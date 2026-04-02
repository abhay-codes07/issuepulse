"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitFork,
  ExternalLink,
  Mail,
  Bell,
  Loader2,
  Trash2,
  ArrowLeft,
  Tag,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// ──────────────────────────────────────────────
// Inline label editor (expanded panel)
// ──────────────────────────────────────────────
function LabelEditor({
  repoId,
  owner,
  repo,
  initialSelected,
  onSave,
  onCancel,
}: {
  repoId: string;
  owner: string;
  repo: string;
  initialSelected: { label: string; color: string | null }[];
  onSave: (labels: string[]) => void;
  onCancel: () => void;
}) {
  const [available, setAvailable] = useState<{ name: string; color: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected.map((l) => l.label))
  );
  const [customLabel, setCustomLabel] = useState("");
  const [loadingLabels, setLoadingLabels] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/repos/${repoId}/labels`)
      .then((r) => r.json())
      .then((d) => setAvailable(d.available || []))
      .catch(() => {})
      .finally(() => setLoadingLabels(false));
  }, [repoId]);

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const addCustom = () => {
    const trimmed = customLabel.trim();
    if (trimmed && !selected.has(trimmed)) {
      setSelected((prev) => new Set(prev).add(trimmed));
      setCustomLabel("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels: Array.from(selected) }),
      });
      if (res.ok) {
        toast.success("Labels saved!");
        onSave(Array.from(selected));
      } else {
        toast.error("Failed to save labels");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const popularLabels = [
    "good first issue",
    "help wanted",
    "bug",
    "enhancement",
    "documentation",
    "hacktoberfest",
  ];
  const extraPopular = popularLabels.filter(
    (l) => !available.some((a) => a.name === l)
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="border border-white/10 rounded-2xl bg-[#13162A] mt-2">
        {/* Inner scrollable area */}
        <div className="p-5 space-y-5 max-h-[52vh] overflow-y-auto">
          {loadingLabels ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-6 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading repository labels…
            </div>
          ) : (
            <>
              {/* Repo labels grid */}
              {available.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                    Repository Labels ({available.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {available.map((l) => {
                      const isSelected = selected.has(l.name);
                      return (
                        <button
                          key={l.name}
                          onClick={() => toggle(l.name)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/50 shadow-sm shadow-indigo-500/10"
                              : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/25 hover:text-slate-200"
                          }`}
                        >
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: `#${l.color}` }}
                          />
                          {l.name}
                          {isSelected && <Check className="h-3 w-3 ml-0.5 text-indigo-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular quick-picks */}
              {extraPopular.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                    Popular Labels
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extraPopular.map((l) => {
                      const isSelected = selected.has(l);
                      return (
                        <button
                          key={l}
                          onClick={() => toggle(l)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-indigo-500/20 text-indigo-200 border-indigo-500/50"
                              : "bg-white/[0.04] text-slate-400 border-white/10 hover:border-white/25 hover:text-slate-200"
                          }`}
                        >
                          {l}
                          {isSelected && <Check className="h-3 w-3 ml-0.5 text-indigo-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom label */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                  Custom Label
                </p>
                <div className="flex gap-2 max-w-sm">
                  <Input
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                    placeholder="Type a label name…"
                    className="bg-white/5 border-white/15 text-white text-sm placeholder:text-slate-600 h-9"
                  />
                  <Button
                    onClick={addCustom}
                    size="sm"
                    variant="outline"
                    className="border-white/15 text-slate-400 hover:text-white h-9 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky footer — selected chips + save */}
        <div className="border-t border-white/8 px-5 py-4 bg-[#0F1117]/60 rounded-b-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {selected.size > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selected).map((l) => (
                    <Badge
                      key={l}
                      variant="secondary"
                      className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 gap-1 pr-1 text-xs"
                    >
                      {l}
                      <button
                        onClick={() => toggle(l)}
                        className="hover:text-white transition-colors ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600">No labels selected</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={onCancel}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white h-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 px-4"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : null}
                Save Labels
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────
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
  const [labelEditorOpen, setLabelEditorOpen] = useState(false);

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

  const toggleSetting = async (
    field: "emailEnabled" | "pushEnabled",
    value: boolean
  ) => {
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
      const res = await fetch(`/api/repos/${repoData.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Repository removed");
        router.push("/dashboard");
      }
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleLabelSave = (labels: string[]) => {
    setRepoData((prev) =>
      prev
        ? {
            ...prev,
            labelSubscriptions: labels.map((l) => ({ label: l, color: null })),
          }
        : null
    );
    setLabelEditorOpen(false);
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
      <div className="max-w-5xl mx-auto px-6 py-8">
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
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/dashboard"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {repoData.avatarUrl && (
              <img
                src={repoData.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-xl border border-white/10"
              />
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
                className="text-xs text-slate-500 hover:text-indigo-400 transition-colors inline-flex items-center gap-1 mt-0.5"
              >
                View on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          {/* Danger zone — right of header */}
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteRepo}
            className="text-red-500/70 hover:text-red-400 hover:bg-red-500/8 border border-red-500/15 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Remove Repo
          </Button>
        </div>
      </motion.div>

      {/* ── Top 2-col bar: notification settings + quick stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 gap-4 mb-4"
      >
        {/* Notification toggles */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-400" />
            Notification Settings
          </h3>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="email-toggle"
              className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer"
            >
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
            <Label
              htmlFor="push-toggle"
              className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer"
            >
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

        {/* Watched labels summary card */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-400" />
              Watched Labels
            </h3>
            <button
              onClick={() => setLabelEditorOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              {labelEditorOpen ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Edit
                </>
              )}
            </button>
          </div>
          {repoData.labelSubscriptions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {repoData.labelSubscriptions.map(({ label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25"
                >
                  {color && (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: `#${color}` }}
                    />
                  )}
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              No labels watched yet.{" "}
              <button
                onClick={() => setLabelEditorOpen(true)}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Add some
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Label editor panel (full width, collapsible) ── */}
      <AnimatePresence>
        {labelEditorOpen && (
          <LabelEditor
            repoId={repoData.id}
            owner={owner}
            repo={repoName}
            initialSelected={repoData.labelSubscriptions}
            onSave={handleLabelSave}
            onCancel={() => setLabelEditorOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Recent Matched Issues (full width below) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-400" />
          Recent Matched Issues
          {notifications.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-normal">
              {notifications.length}
            </span>
          )}
        </h3>
        {notifications.length === 0 ? (
          <EmptyState
            title="No issues yet"
            description="No matching issues found for this repository's watched labels."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
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
      </motion.div>
    </div>
  );
}
