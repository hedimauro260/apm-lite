import { useEffect, useState } from "react";
import { Calendar, Clock, Globe, Link2, Plus, Save } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { cn } from "../../lib/utils";
import type { Site } from "../../types";

export const SITE_COLORS = [
    "#7C5CFC",
    "#3B82F6",
    "#F97316",
    "#22C55E",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F59E0B",
    "#EF4444",
    "#6B7280",
];

export interface SiteModalData {
    name: string;
    url?: string;
    initialBalance: number;
    createdAt: string;
    description?: string;
    color: string;
}

export interface SiteModalProps {
    open: boolean;
    mode: "create" | "edit";
    site?: Site;
    onClose: () => void;
    onSubmit?: (data: SiteModalData) => void;
    onUpdate?: (site: Site, data: SiteModalData) => void;
}

function toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function SiteModal({
    open,
    mode = "create",
    site,
    onClose,
    onSubmit,
    onUpdate,
}: SiteModalProps) {
    const isEditing = mode === "edit";

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [initialBalance, setInitialBalance] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(SITE_COLORS[0]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!open) return;
        if (isEditing && site) {
            setName(site.name);
            setUrl(site.url ?? "");
            setInitialBalance(String(site.initialBalance));
            setDate(toDateInputValue(new Date(site.createdAt)));
            setTime(toTimeInputValue(new Date(site.createdAt)));
            setDescription(site.description ?? "");
            setColor(site.color || SITE_COLORS[0]);
        } else {
            const now = new Date();
            setName("");
            setUrl("");
            setInitialBalance("");
            setDate(toDateInputValue(now));
            setTime(toTimeInputValue(now));
            setDescription("");
            setColor(SITE_COLORS[0]);
        }
        setErrors({});
    }, [open, isEditing, site]);

    const handleSubmit = () => {
        const nextErrors: Record<string, string> = {};
        if (!name.trim()) nextErrors.name = "Site name is required";

        const parsedBalance = parseFloat(initialBalance);
        if (initialBalance && (isNaN(parsedBalance) || parsedBalance < 0)) {
            nextErrors.initialBalance = "Enter a valid initial balance";
        }
        if (!date) nextErrors.date = "Select a date";

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        const createdAt = new Date(`${date}T${time || "00:00"}`).toISOString();
        const data: SiteModalData = {
            name: name.trim(),
            url: url.trim() || undefined,
            initialBalance: parsedBalance || 0,
            createdAt,
            description: description.trim() || undefined,
            color,
        };

        if (isEditing && site) {
            onUpdate?.(site, data);
        } else {
            onSubmit?.(data);
        }
    };

    const fieldClass =
        "w-full bg-surface border border-border rounded-md text-text-primary px-4 h-10 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent disabled:pointer-events-none disabled:opacity-50";

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={isEditing ? "Edit Site" : "Add Site"}
            description={
                isEditing
                    ? "Update the platform information"
                    : "Register a new task platform"
            }
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        {isEditing ? (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Add Site
                            </>
                        )}
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                        style={{
                            backgroundColor: `${color}20`,
                            color,
                        }}
                    >
                        <Globe className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary">
                            Task platform
                        </p>
                        <p className="text-xs text-text-muted">
                            {isEditing
                                ? `Editing ${site?.name}`
                                : "Fill in the details of the new platform"}
                        </p>
                    </div>
                </div>

                <Input
                    label="Site name"
                    placeholder="e.g. Timebucks"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                    }}
                    error={errors.name}
                    required
                />

                <Input
                    label="Site URL"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    iconLeft={<Link2 className="h-4 w-4" />}
                />

                <Input
                    label="Initial balance"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={initialBalance}
                    onChange={(e) => {
                        setInitialBalance(e.target.value);
                        if (errors.initialBalance)
                            setErrors((p) => ({ ...p, initialBalance: "" }));
                    }}
                    error={errors.initialBalance}
                    iconLeft={<span className="text-sm text-text-muted">$</span>}
                    helperText="Balance that already exists on the platform before the first record"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Date
                        </label>
                        <div className="mt-1.5 relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    if (errors.date)
                                        setErrors((p) => ({ ...p, date: "" }));
                                }}
                                className={cn(
                                    fieldClass,
                                    "pl-10",
                                    errors.date && "border-danger focus-visible:ring-danger"
                                )}
                            />
                        </div>
                        {errors.date && (
                            <p className="mt-1 text-sm text-danger" role="alert">
                                {errors.date}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Time
                        </label>
                        <div className="mt-1.5 relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className={cn(fieldClass, "pl-10")}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary">
                        Description{" "}
                        <span className="text-text-muted">(optional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Surveys and micro-tasks platform"
                        rows={2}
                        className="mt-1.5 w-full rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted px-4 py-2 text-base transition-all duration-150 hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                    />
                </div>

                <div>
                    <span className="block text-sm font-medium text-text-secondary">
                        Identification color
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {SITE_COLORS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setColor(option)}
                                aria-label={`Select color ${option}`}
                                className={cn(
                                    "h-8 w-8 rounded-full transition-all duration-150",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                    color === option ? "scale-110" : "hover:scale-110"
                                )}
                                style={{
                                    backgroundColor: option,
                                    boxShadow:
                                        color === option
                                            ? `0 0 0 2px var(--color-background), 0 0 0 4px ${option}`
                                            : undefined,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
