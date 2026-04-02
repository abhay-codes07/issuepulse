"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { GitFork, ExternalLink, Mail, Bell, Loader2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LabelSelector } from "@/components/label-selector";
import { IssueCard } from "@/components/issue-card";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface RepoDetail {
  id: string;
  owner: string;
  repo: string;
  avatarUrl: string | null;
  emailEnabled: boolean;
  pushEnabled: boolean;
  labelSubscriptions: { label: string; color: string | null }[];
}

interface NotificationItem {
  id: string;
  issueTitle: string;
  issueUrl: string;
  issueNumber: number;
  labels: string[];
  createdAt: string;
}

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo: repoName } = use(params);
  const router = useRouter();
  const [repoData, setRepoData] = useState<RepoDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/repos");
        if (res.ok) {
          const data = await res.json();
          const found = (data.repos as RepoDetail[]).find(
            (r) => r.owner === owner && r.repo === repoName
          );
          if (found) {
            setRepoData(found);
            // Fetch notifications for this repo
            const nRes = await fetch(
              `/api/notifications?repo=${owner}/${repoName}&limit=20`
            );
            if (nRes.ok) {
              const nData = await nRes.json();
              setNotifications(nData.notifications || []);
            }
          }
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [owner, repoName]);

  const toggleSetting = async (field: "emailEnabled" | "pushEnabled", value: boolean) => {
    if (!repoData) return;
    try {
      const res = await fetch(`/api/repos/${repoData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setRepoData((prev) => (prev ? { ...prev, [field]: value } : null));
        toast.success("Settings updated");
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const deleteRepo = async () => {
    if (!repoData) return;
    if (!confirm(`Remove ${owner}/${repoName} from tracking?`)) return;
    try {
      const res = await fetch(`/api/repos/${repoData.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Repository removed");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!repoData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <EmptyState
          title="Repository not found"
          description="This repository is not in your tracked list."
        />
        <div className="text-center mt-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-indigo-400">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-white transition-colors inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
        <div className="flex items-center gap-4">
          {repoData.avatarUrl && (
            <img src={repoData.avatarUrl} alt="" className="h-12 w-12 rounded-lg" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitFork className="h-5 w-5 text-indigo-400" />
              {owner}/{repoName}
            </h1>
            <a
              href={`https://github.com/${owner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-indigo-400 transition-colors inline-flex items-center gap-1 mt-0.5"
            >
              View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Notification toggles */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Notification Settings</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-toggle" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Mail className="h-4 w-4" />
                Email Alerts
              </Label>
              <Switch
                id="email-toggle"
                checked={repoData.emailEnabled}
                onCheckedChange={(v) => toggleSetting("emailEnabled", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push-toggle" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Bell className="h-4 w-4" />
                Push Notifications
              </Label>
              <Switch
                id="push-toggle"
                checked={repoData.pushEnabled}
                onCheckedChange={(v) => toggleSetting("pushEnabled", v)}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-4">Watched Labels</h3>
            <LabelSelector
              repoId={repoData.id}
              owner={owner}
              repo={repoName}
              selectedLabels={repoData.labelSubscriptions}
            />
          </div>

          {/* Danger zone */}
          <div className="p-4 rounded-xl border border-red-500/10">
            <Button
              variant="ghost"
              onClick={deleteRepo}
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Repository
            </Button>
          </div>
        </div>

        {/* Issue feed */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Matched Issues</h3>
          {notifications.length === 0 ? (
            <EmptyState
              title="No issues yet"
              description="No matching issues found for this repository's watched labels."
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
                  createdAt={n.createdAt}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
