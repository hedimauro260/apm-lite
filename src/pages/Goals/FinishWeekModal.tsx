import { Archive, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { cn, formatCurrency } from "../../lib/utils";
import { formatDayLabel, type GoalProgress } from "./goalLogic";
import type { Goal } from "../../types";

export interface FinishWeekModalProps {
  open: boolean;
  goal: Goal | null;
  progress: GoalProgress | null;
  onClose: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function FinishWeekModal({
  open,
  goal,
  progress,
  onClose,
  onArchive,
  onDelete,
}: FinishWeekModalProps) {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Finish Week"
      description="Choose how to end the current weekly goal"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={onArchive}>
            <Archive className="h-4 w-4" />
            Archive Progress
          </Button>
          <Button variant="danger" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete Goal
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {goal && (
          <div className="rounded-lg bg-surface-elevated border border-border px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">
              {goal.name}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDayLabel(goal.startDate)} – {formatDayLabel(goal.endDate)}
            </p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-text-muted">Weekly Goal</p>
                <p className="text-sm font-semibold text-text-primary font-mono">
                  {formatCurrency(goal.totalWeeklyGoal)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Progress</p>
                <p className="text-sm font-semibold text-text-primary font-mono">
                  {formatCurrency(progress?.totalWeeklyProgress ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted">Final Status</p>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium",
                    progress?.status === "Completed"
                      ? "bg-success/10 text-success"
                      : progress?.status === "Excellent"
                        ? "bg-success/10 text-success"
                        : progress?.status === "On Track"
                          ? "bg-primary/10 text-primary"
                          : progress?.status === "Behind"
                            ? "bg-warning/10 text-warning"
                            : "bg-surface-elevated text-text-muted",
                  )}
                >
                  {progress?.status ?? "Not Started"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-text-secondary">
            <span className="text-text-primary font-medium">
              Archive Progress
            </span>{" "}
            keeps the goal, its daily targets and the achieved values in your
            archived Goal List.
          </p>
          <p className="text-sm text-text-secondary">
            <span className="text-danger font-medium">Delete Goal</span>{" "}
            permanently removes the goal. Deposits are never deleted.
          </p>
        </div>
      </div>
    </Modal>
  );
}
