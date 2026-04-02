"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Mail, Trash2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";

interface Repo {
  id: string;
  owner: string;
  repo: string;
  avatarUrl: string | null;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

export default function SettingsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState<string>("default");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/repos");
        if (res.ok) {
          const data = await res.json();
          setRepos(data.repos || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();

    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const toggleAll = async (field: "emailEnabled" | "pushEnabled", value: boolean) => {
    const promises = repos.map((r) =>
      fetch(`/api/repos/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })
    );
    await Promise.all(promises);
    setRepos((prev) => prev.map((r) => ({ ...r, [field]: value })));
    toast.success(`${field === "emailEnabled" ? "Email" : "Push"} notifications ${value ? "enabled" : "disabled"} for all repos`);
  };

  const deleteRepo = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from tracking?`)) return;
    try {
      const res = await fetch(`/api/repos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRepos((prev) => prev.filter((r) => r.id !== id));
        toast.success("Repository removed");
      }
    } catch {
      toast.error("Failed to remove");
    }
  };

  const requestPush = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      if (perm === "granted") {
        toast.success("Push notifications enabled!");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Settings className="h-6 w-6 text-indigo-400" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your notification preferences and tracked repositories.
        </p>
      </motion.div>

      {/* Global notification settings */}
      <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-6 mb-8">
        <h3 className="text-base font-semibold text-white">Global Preferences</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Toggle for all repositories</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs border-white/10" onClick={() => toggleAll("emailEnabled", true)}>
              Enable All
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-white/10" onClick={() => toggleAll("emailEnabled", false)}>
              Disable All
            </Button>
          </div>
        </div>

        <Separator className="bg-white/5" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Push Notifications</p>
              <p className="text-xs text-muted-foreground">
                Permission: <span className={pushPermission === "granted" ? "text-emerald-400" : "text-amber-400"}>{pushPermission}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {pushPermission !== "granted" && (
              <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white" onClick={requestPush}>
                Request Permission
              </Button>
            )}
            <Button size="sm" variant="outline" className="text-xs border-white/10" onClick={() => toggleAll("pushEnabled", true)}>
              Enable All
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-white/10" onClick={() => toggleAll("pushEnabled", false)}>
              Disable All
            </Button>
          </div>
        </div>
      </div>

      {/* Repo list */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white">Tracked Repositories</h3>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : repos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No repositories tracked yet. Add one from the dashboard.
          </p>
        ) : (
          repos.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3">
                {r.avatarUrl ? (
                  <img src={r.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium text-white">
                  {r.owner}/{r.repo}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Mail className={`h-3.5 w-3.5 ${r.emailEnabled ? "text-indigo-400" : "text-muted-foreground/30"}`} />
                  <Bell className={`h-3.5 w-3.5 ${r.pushEnabled ? "text-indigo-400" : "text-muted-foreground/30"}`} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRepo(r.id, `${r.owner}/${r.repo}`)}
                  className="text-red-400/60 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
