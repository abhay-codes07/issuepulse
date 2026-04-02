"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { IssueCard } from "@/components/issue-card";
import { EmptyState } from "@/components/empty-state";

interface NotificationItem {
  id: string;
  repoFullName: string;
  issueTitle: string;
  issueUrl: string;
  issueNumber: number;
  labels: string[];
  createdAt: string;
}

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications?limit=50");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Activity className="h-6 w-6 text-indigo-400" />
          Issue Feed
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recent issues matching your tracked labels across all repositories.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No matching issues yet"
          description="Add repositories and select labels to start tracking issues. We'll check for new matches every 10 minutes."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <IssueCard
              key={n.id}
              title={n.issueTitle}
              number={n.issueNumber}
              url={n.issueUrl}
              labels={n.labels}
              repoFullName={n.repoFullName}
              createdAt={n.createdAt}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
