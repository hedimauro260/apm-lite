// src/components/layout/Header/useNotifications.ts
import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../database/db";
import {
  buildNotifications,
  getReadNotificationIds,
  saveReadNotificationIds,
} from "./notificationTypes";

function queryOrNull<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((error) => {
    console.error("Error loading notifications data", error);
    return null;
  });
}

export function useNotifications() {
  const transactionsResult = useLiveQuery(
    () => queryOrNull(db.transactions.toArray()),
    [],
  );
  const goalsResult = useLiveQuery(() => queryOrNull(db.goals.toArray()), []);
  const walletsResult = useLiveQuery(() => queryOrNull(db.wallets.toArray()), []);

  const [readIds, setReadIds] = useState<Set<string>>(() => getReadNotificationIds());

  useEffect(() => {
    saveReadNotificationIds([...readIds]);
  }, [readIds]);

  const rawNotifications = useMemo(() => {
    const transactions = Array.isArray(transactionsResult) ? transactionsResult : [];
    const goals = Array.isArray(goalsResult) ? goalsResult : [];
    const wallets = Array.isArray(walletsResult) ? walletsResult : [];
    return buildNotifications(transactions, goals, wallets);
  }, [transactionsResult, goalsResult, walletsResult]);

  const notifications = useMemo(
    () => rawNotifications.map((n) => ({ ...n, read: readIds.has(n.id) })),
    [rawNotifications, readIds],
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds(new Set(rawNotifications.map((n) => n.id)));
  };

  return { notifications, unreadCount, markRead, markAllRead };
}