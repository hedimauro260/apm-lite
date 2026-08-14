import { Archive, Eye } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { cn, formatCurrency } from "../../lib/utils";
import {
  formatDayLabel,
  getStatusClasses,
} from "./goalLogic";
import type { Goal } from "../../types";

export interface GoalListModalProps {
  open: boolean;
  goals: Goal[];
  onClose: () => void;
  onView: (goal: Goal) => void;
}

export function GoalListModal({ open, goals, onClose, onView }: GoalListModalProps) {
  const sorted = [...goals].sort(
    (a, b) =>
      new Date(b.archivedAt ?? b.updatedAt).getTime() -
      new Date(a.archivedAt ?? a.updatedAt).getTime(),
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Goal List"
      description="Archived weekly goals"
      size="lg"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <div className="p-3 rounded-lg bg-surface-elevated text-text-muted">
            <Archive className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              No archived goals
            </p>
            <p className="mt-1 text-xs text-text-muted max-w-sm">
              When you finish a weekly goal, it will show up here with its full
              history.
            </p>
          </div>
        </div>
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full min-w-160">
            <thead>
              <tr className="border-b border-border bg-surface-elevated">
                {["Goal Name", "Period", "Weekly Goal", "Status", "Action"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((goal) => (
                <tr key={goal.id} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-text-primary">
                      {goal.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-text-secondary">
                      {formatDayLabel(goal.startDate)} –{" "}
                      {formatDayLabel(goal.endDate)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-text-primary font-mono">
                      {formatCurrency(goal.totalWeeklyGoal)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-[10px] font-medium",
                        getStatusClasses(goal.snapshot?.status ?? "Not Started"),
                      )}
                    >
                      {goal.snapshot?.status ?? "Not Started"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => onView(goal)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
