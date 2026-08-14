import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Target,
  Wallet as WalletIcon,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { cn, formatCurrency } from "../../lib/utils";
import type {
  DistributionType,
  GoalWalletConfig,
  Wallet,
} from "../../types";
import {
  buildGoalDays,
  formatDayLabel,
  splitWeeklyGoal,
} from "./goalLogic";

export interface NewGoalData {
  name: string;
  distributionType: DistributionType;
  totalWeeklyGoal: number;
  startDate: string;
  endDate: string;
  wallets: GoalWalletConfig[];
}

export interface NewGoalModalProps {
  open: boolean;
  wallets: Wallet[];
  hasActiveGoal: boolean;
  onClose: () => void;
  onSubmit: (data: NewGoalData) => void;
}

const fieldClass =
  "w-full bg-surface border border-border rounded-md text-text-primary px-4 h-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:pointer-events-none disabled:opacity-50";

export function NewGoalModal({
  open,
  wallets,
  hasActiveGoal,
  onClose,
  onSubmit,
}: NewGoalModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [distributionType, setDistributionType] =
    useState<DistributionType | null>(null);
  const [weeklyGoals, setWeeklyGoals] = useState<Record<string, string>>({});
  const [customValues, setCustomValues] = useState<Record<string, string[]>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dayDates = useMemo(
    () => buildGoalDays(new Date()).map((day) => day.date),
    [],
  );

  const selectedWalletKey = selectedWalletIds.join("|");

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setName("");
    setSelectedWalletIds([]);
    setDistributionType(null);
    setWeeklyGoals({});
    setCustomValues({});
    setErrors({});
  }, [open]);

  useEffect(() => {
    setWeeklyGoals((prev) => {
      const next: Record<string, string> = {};
      selectedWalletIds.forEach((id) => {
        next[id] = prev[id] ?? "";
      });
      return next;
    });
    setCustomValues((prev) => {
      const next: Record<string, string[]> = {};
      selectedWalletIds.forEach((id) => {
        next[id] = prev[id] ?? Array.from({ length: 7 }, () => "");
      });
      return next;
    });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWalletKey]);

  const selectableWallets = wallets.filter((w) => w.status === "active");
  const walletList = selectableWallets.length > 0 ? selectableWallets : wallets;

  const walletName = (walletId: string) =>
    wallets.find((w) => w.id === walletId)?.name ?? "Unknown Wallet";

  const walletSameValues = (walletId: string): number[] => {
    const total = parseFloat(weeklyGoals[walletId] ?? "");
    return splitWeeklyGoal(isNaN(total) ? 0 : total);
  };

  const walletCustomTotal = (walletId: string): number =>
    (customValues[walletId] ?? []).reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      0,
    );

  const totalWeekly = useMemo(() => {
    if (distributionType === "same") {
      return selectedWalletIds.reduce(
        (sum, id) => sum + (parseFloat(weeklyGoals[id] ?? "") || 0),
        0,
      );
    }
    return selectedWalletIds.reduce(
      (sum, id) => sum + walletCustomTotal(id),
      0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributionType, selectedWalletKey, weeklyGoals, customValues]);

  const dayTotals = useMemo(() => {
    return dayDates.map((_, index) =>
      selectedWalletIds.reduce((sum, id) => {
        if (distributionType === "same") {
          return sum + (walletSameValues(id)[index] ?? 0);
        }
        return sum + (parseFloat(customValues[id]?.[index] ?? "") || 0);
      }, 0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributionType, selectedWalletKey, weeklyGoals, customValues, dayDates]);

  const toggleWallet = (walletId: string) => {
    setSelectedWalletIds((prev) =>
      prev.includes(walletId)
        ? prev.filter((id) => id !== walletId)
        : [...prev, walletId],
    );
    setErrors((prev) => {
      const { wallets: _w, ...rest } = prev;
      void _w;
      return rest;
    });
  };

  const validateStep1 = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Goal name is required";
    if (selectedWalletIds.length === 0)
      nextErrors.wallets = "Select at least one wallet";
    if (!distributionType) nextErrors.distribution = "Select a distribution type";
    return nextErrors;
  };

  const validateStep2 = (): Record<string, string> => {
    const nextErrors: Record<string, string> = {};
    if (distributionType === "same") {
      selectedWalletIds.forEach((walletId) => {
        const value = weeklyGoals[walletId] ?? "";
        const parsed = parseFloat(value);
        if (value === "" || isNaN(parsed) || parsed <= 0) {
          nextErrors[`weekly-${walletId}`] = "Enter a value greater than zero";
        }
      });
    } else if (distributionType === "custom") {
      selectedWalletIds.forEach((walletId) => {
        let sum = 0;
        (customValues[walletId] ?? []).forEach((value, index) => {
          const parsed = parseFloat(value);
          if (value === "" || isNaN(parsed)) {
            nextErrors[`custom-${walletId}-${index}`] = "Required";
          } else if (parsed < 0) {
            nextErrors[`custom-${walletId}-${index}`] = "Cannot be negative";
          } else {
            sum += parsed;
          }
        });
        if (sum <= 0) {
          nextErrors[`customTotal-${walletId}`] =
            "The weekly sum must be greater than zero";
        }
      });
    }
    return nextErrors;
  };

  const handleNext = () => {
    const nextErrors = validateStep1();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleBack = () => {
    setErrors({});
    setStep(1);
  };

  const handleSubmit = () => {
    const nextErrors = validateStep2();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const wallets: GoalWalletConfig[] = selectedWalletIds.map((walletId) => {
      const days = buildGoalDays(new Date());
      if (distributionType === "same") {
        const values = splitWeeklyGoal(parseFloat(weeklyGoals[walletId] ?? ""));
        days.forEach((day, index) => {
          day.goal = values[index];
        });
      } else {
        days.forEach((day, index) => {
          day.goal = parseFloat(customValues[walletId]?.[index] ?? "") || 0;
        });
      }
      const weeklyGoal = days.reduce((sum, day) => sum + day.goal, 0);
      return { walletId, weeklyGoal, days };
    });

    const totalWeeklyGoal = wallets.reduce(
      (sum, wallet) => sum + wallet.weeklyGoal,
      0,
    );

    onSubmit({
      name: name.trim(),
      distributionType: distributionType as DistributionType,
      totalWeeklyGoal,
      startDate: wallets[0]?.days[0].date ?? dayDates[0],
      endDate: wallets[0]?.days[6].date ?? dayDates[6],
      wallets,
    });
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="New Goal"
      description="Create a weekly deposit goal"
      size="xl"
      footer={
        <>
          {step === 2 && (
            <Button variant="secondary" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={hasActiveGoal}
              title={
                hasActiveGoal
                  ? "Finish or delete the current active goal first"
                  : undefined
              }
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit}>
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  step === s
                    ? "bg-primary text-white"
                    : step > s
                      ? "bg-success/10 text-success"
                      : "bg-surface-elevated text-text-muted",
                )}
              >
                {step > s ? <Check className="h-3.5 w-3.5" /> : s}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  step >= s ? "text-text-primary" : "text-text-muted",
                )}
              >
                {s === 1 ? "Goal Configuration" : "Weekly Distribution"}
              </span>
            </div>
          ))}
        </div>

        {hasActiveGoal && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
            <Target className="h-4 w-4 shrink-0" />
            <span>
              There is already an active goal. Finish or delete it before
              creating a new one.
            </span>
          </div>
        )}

        {step === 1 && (
          <>
            <Input
              label="Goal Name"
              placeholder="e.g. Weekly Investment"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => {
                  const { name: _n, ...rest } = prev;
                  void _n;
                  return rest;
                });
              }}
              error={errors.name}
              required
            />

            <div>
              <span className="block text-sm font-medium text-text-secondary">
                Wallets
              </span>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {walletList.map((wallet) => {
                  const isSelected = selectedWalletIds.includes(wallet.id);
                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => toggleWallet(wallet.id)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-all duration-150",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface hover:border-border-hover",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-border",
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <WalletIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "text-primary" : "text-text-muted",
                        )}
                      />
                      <span className="text-sm font-medium text-text-primary truncate">
                        {wallet.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.wallets && (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {errors.wallets}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-text-secondary">
                Distribution Type
              </span>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDistributionType("same");
                    setErrors((prev) => {
                      const { distribution: _d, ...rest } = prev;
                      void _d;
                      return rest;
                    });
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-left transition-all duration-150",
                    distributionType === "same"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:border-border-hover",
                  )}
                >
                  <span className="block text-sm font-medium text-text-primary">
                    Same Amount Every Day
                  </span>
                  <span className="block text-xs text-text-muted mt-0.5">
                    Split each wallet&apos;s weekly goal equally across the 7
                    days
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDistributionType("custom");
                    setErrors((prev) => {
                      const { distribution: _d, ...rest } = prev;
                      void _d;
                      return rest;
                    });
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2.5 text-left transition-all duration-150",
                    distributionType === "custom"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:border-border-hover",
                  )}
                >
                  <span className="block text-sm font-medium text-text-primary">
                    Custom Amount by Day
                  </span>
                  <span className="block text-xs text-text-muted mt-0.5">
                    Set a different goal for each day, per wallet
                  </span>
                </button>
              </div>
              {errors.distribution && (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {errors.distribution}
                </p>
              )}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <div className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4 text-text-muted" />
                <span className="text-sm font-medium text-text-secondary">
                  {distributionType === "same"
                    ? "Weekly goal per wallet"
                    : "Daily goals per wallet"}
                </span>
              </div>

              <div className="mt-2 min-w-0 overflow-x-auto border border-border rounded-md">
                <table className="w-full min-w-240">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated">
                      <th className="px-3 py-2.5 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">
                        Wallet
                      </th>
                      {dayDates.map((date) => (
                        <th
                          key={date}
                          className="px-2 py-2.5 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap"
                        >
                          {formatDayLabel(date)}
                        </th>
                      ))}
                      <th className="px-3 py-2.5 text-right text-[10px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap">
                        Weekly Goal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedWalletIds.map((walletId) => (
                      <tr key={walletId}>
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium text-text-primary whitespace-nowrap">
                            {walletName(walletId)}
                          </span>
                        </td>
                        {dayDates.map((date, index) =>
                          distributionType === "same" ? (
                            <td key={date} className="px-2 py-2">
                              <span className="text-xs font-semibold text-text-primary font-mono whitespace-nowrap">
                                {formatCurrency(
                                  walletSameValues(walletId)[index] ?? 0,
                                )}
                              </span>
                            </td>
                          ) : (
                            <td key={date} className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={customValues[walletId]?.[index] ?? ""}
                                onChange={(e) => {
                                  setCustomValues((prev) => {
                                    const next = { ...prev };
                                    const values = [...(next[walletId] ?? [])];
                                    values[index] = e.target.value;
                                    next[walletId] = values;
                                    return next;
                                  });
                                  setErrors((prev) => {
                                    const { ...rest } = prev;
                                    delete rest[`custom-${walletId}-${index}`];
                                    delete rest[`customTotal-${walletId}`];
                                    return rest;
                                  });
                                }}
                                className={cn(
                                  fieldClass,
                                  "h-8 px-2 text-sm min-w-16",
                                  errors[`custom-${walletId}-${index}`] &&
                                    "border-danger focus-visible:ring-danger",
                                )}
                              />
                              {errors[`custom-${walletId}-${index}`] && (
                                <span className="block text-[10px] text-danger mt-0.5">
                                  {errors[`custom-${walletId}-${index}`]}
                                </span>
                              )}
                            </td>
                          ),
                        )}
                        <td className="px-3 py-2 text-right">
                          {distributionType === "same" ? (
                            <>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={weeklyGoals[walletId] ?? ""}
                                onChange={(e) => {
                                  setWeeklyGoals((prev) => ({
                                    ...prev,
                                    [walletId]: e.target.value,
                                  }));
                                  setErrors((prev) => {
                                    const { ...rest } = prev;
                                    delete rest[`weekly-${walletId}`];
                                    return rest;
                                  });
                                }}
                                className={cn(
                                  fieldClass,
                                  "h-8 px-2 text-sm min-w-24 text-right",
                                  errors[`weekly-${walletId}`] &&
                                    "border-danger focus-visible:ring-danger",
                                )}
                              />
                              {errors[`weekly-${walletId}`] && (
                                <span className="block text-[10px] text-danger mt-0.5">
                                  {errors[`weekly-${walletId}`]}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-xs font-semibold text-text-primary font-mono whitespace-nowrap">
                                {formatCurrency(walletCustomTotal(walletId))}
                              </span>
                              {errors[`customTotal-${walletId}`] && (
                                <span className="block text-[10px] text-danger mt-0.5">
                                  {errors[`customTotal-${walletId}`]}
                                </span>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border bg-surface-elevated/40">
                      <td className="px-3 py-2.5">
                        <span className="text-xs font-semibold text-text-primary">
                          Total
                        </span>
                      </td>
                      {dayTotals.map((total, index) => (
                        <td key={dayDates[index]} className="px-2 py-2.5">
                          <span className="text-xs font-semibold text-text-primary font-mono whitespace-nowrap">
                            {formatCurrency(total)}
                          </span>
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-right">
                        <span className="text-sm font-bold text-text-primary font-mono whitespace-nowrap">
                          {formatCurrency(totalWeekly)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
