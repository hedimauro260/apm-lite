import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertCircle, List, Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { db } from "../../database/db";
import { generateId } from "../../lib/utils";
import type { Goal } from "../../types";
import { SummaryCardsGoals } from "./SummaryCardsGoals";
import { DailyGoalsTable } from "./DailyGoalsTable";
import { RecentGoalActivity } from "./RecentGoalActivity";
import { NewGoalModal, type NewGoalData } from "./NewGoalModal";
import { FinishWeekModal } from "./FinishWeekModal";
import { GoalListModal } from "./GoalListModal";
import { GoalDetailModal } from "./GoalDetailModal";
import { buildGoalSnapshot, computeGoalProgress } from "./goalLogic";

function queryOrNull<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((error) => {
    console.error("Error loading data", error);
    return null;
  });
}

export default function GoalsPage() {
  const goalsResult = useLiveQuery(() => queryOrNull(db.goals.toArray()), []);
  const transactionsResult = useLiveQuery(
    () => queryOrNull(db.transactions.toArray()),
    [],
  );
  const walletsResult = useLiveQuery(
    () => queryOrNull(db.wallets.toArray()),
    [],
  );

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isFinishWeekOpen, setIsFinishWeekOpen] = useState(false);
  const [isGoalListOpen, setIsGoalListOpen] = useState(false);
  const [viewingGoal, setViewingGoal] = useState<Goal | null>(null);

  const loading =
    goalsResult === undefined ||
    transactionsResult === undefined ||
    walletsResult === undefined;

  const loadError =
    goalsResult === null || transactionsResult === null || walletsResult === null;

  const goals = Array.isArray(goalsResult) ? goalsResult : [];
  const transactions = Array.isArray(transactionsResult) ? transactionsResult : [];
  const wallets = Array.isArray(walletsResult) ? walletsResult : [];

  const activeGoal = useMemo(
    () => goals.find((goal) => goal.status === "active") ?? null,
    [goals],
  );

  const archivedGoals = useMemo(
    () => goals.filter((goal) => goal.status === "archived"),
    [goals],
  );

  const progress = useMemo(
    () =>
      activeGoal
        ? computeGoalProgress(activeGoal, transactions, wallets)
        : null,
    [activeGoal, transactions, wallets],
  );

  const handleCreateGoal = async (data: NewGoalData) => {
    const now = new Date().toISOString();
    const goal: Goal = {
      id: generateId(),
      name: data.name,
      status: "active",
      startDate: data.startDate,
      endDate: data.endDate,
      distributionType: data.distributionType,
      totalWeeklyGoal: data.totalWeeklyGoal,
      wallets: data.wallets,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await db.goals.add(goal);
    } catch (error) {
      console.error("Error creating goal", error);
    }
    setIsNewGoalOpen(false);
  };

  const handleArchiveGoal = async () => {
    if (!activeGoal || !progress) return;
    const now = new Date().toISOString();
    const snapshot = buildGoalSnapshot(progress);
    try {
      await db.goals.update(activeGoal.id, {
        status: "archived",
        archivedAt: now,
        snapshot,
        updatedAt: now,
      });
    } catch (error) {
      console.error("Error archiving goal", error);
    }
    setIsFinishWeekOpen(false);
  };

  const handleDeleteGoal = async () => {
    if (!activeGoal) return;
    try {
      await db.goals.delete(activeGoal.id);
    } catch (error) {
      console.error("Error deleting goal", error);
    }
    setIsFinishWeekOpen(false);
  };

  return (
    <div className="space-y-4 px-4">
      <Helmet>
        <title>Goals | Asset Portfolio Manager Lite</title>
        <meta
          name="description"
          content="Set and track weekly deposit goals across your wallets"
        />
        <meta
          name="keywords"
          content="goals, weekly, deposit, savings, track, portfolio"
        />
      </Helmet>

      {/* 1. PageHeader */}
      <PageHeader
        title="Goals"
        subtitle="Track your weekly deposit goals"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsGoalListOpen(true)}
            >
              <List className="h-4 w-4" />
              Goal List
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewGoalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </>
        }
      />

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4" />
          Failed to load goals data.
        </div>
      )}

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="card p-4 h-28 animate-pulse">
                <div className="h-3 w-20 bg-surface-elevated rounded" />
                <div className="mt-4 h-5 w-28 bg-surface-elevated rounded" />
              </div>
            ))}
          </div>
          <div className="card p-8 animate-pulse">
            <div className="h-4 w-40 bg-surface-elevated rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 w-full bg-surface-elevated rounded" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 2. Summary Cards */}
          <SummaryCardsGoals progress={progress} />

          {/* 3. Daily Goals Table */}
          <DailyGoalsTable
            progress={progress}
            onFinishWeek={() => setIsFinishWeekOpen(true)}
            onCreateGoal={() => setIsNewGoalOpen(true)}
          />

          {/* 4. Recent Goal Activity */}
          <RecentGoalActivity transactions={transactions} wallets={wallets} />
        </>
      )}

      {/* Modals */}
      <NewGoalModal
        open={isNewGoalOpen}
        wallets={wallets}
        hasActiveGoal={activeGoal !== null}
        onClose={() => setIsNewGoalOpen(false)}
        onSubmit={handleCreateGoal}
      />
      <FinishWeekModal
        open={isFinishWeekOpen}
        goal={activeGoal}
        progress={progress}
        onClose={() => setIsFinishWeekOpen(false)}
        onArchive={handleArchiveGoal}
        onDelete={handleDeleteGoal}
      />
      <GoalListModal
        open={isGoalListOpen}
        goals={archivedGoals}
        onClose={() => setIsGoalListOpen(false)}
        onView={(goal) => setViewingGoal(goal)}
      />
      <GoalDetailModal
        open={viewingGoal !== null}
        goal={viewingGoal}
        wallets={wallets}
        onClose={() => setViewingGoal(null)}
      />
    </div>
  );
}
