"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Zap, GitFork, Settings, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { AddRepoModal } from "@/components/add-repo-modal";
import { Onboarding } from "@/components/onboarding";
import { motion, AnimatePresence } from "framer-motion";

interface Repo {
  id: string;
  owner: string;
  repo: string;
  avatarUrl: string | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchRepos = useCallback(async () => {
    try {
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        setRepos(data.repos || []);
        if (!loaded) {
          setLoaded(true);
          if ((data.repos || []).length === 0) {
            setShowOnboarding(true);
          }
        }
      }
    } catch {
      // silently fail
    }
  }, [loaded]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F1117]">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ duration: 0.2 }}
        className="border-r border-white/5 bg-[#0D0F16] flex flex-col shrink-0"
      >
        {/* Logo */}
        <div className="h-16 border-b border-white/5 flex items-center px-4 gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <Zap className="h-5 w-5 text-indigo-400 shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-base font-bold text-white whitespace-nowrap overflow-hidden"
                >
                  IssuePulse
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Repo list */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium px-2 mb-2">
              Tracked Repos
            </p>
          )}
          {repos.map((r) => {
            const isActive = pathname === `/dashboard/${r.owner}/${r.repo}`;
            return (
              <Link
                key={r.id}
                href={`/dashboard/${r.owner}/${r.repo}`}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors group ${
                  isActive
                    ? "bg-indigo-500/10 text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {r.avatarUrl ? (
                  <img src={r.avatarUrl} alt="" className="h-6 w-6 rounded-full shrink-0" />
                ) : (
                  <GitFork className="h-4 w-4 shrink-0" />
                )}
                {!collapsed && (
                  <span className="text-sm truncate">
                    {r.owner}/{r.repo}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 p-2 space-y-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
              pathname === "/dashboard/settings"
                ? "bg-indigo-500/10 text-white"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-muted-foreground/50 hover:text-muted-foreground transition-colors w-full"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0F1117]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-muted-foreground">Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <AddRepoModal onAdded={fetchRepos} />
            <NotificationBell />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Onboarding */}
      <Onboarding
        show={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          fetchRepos();
        }}
      />
    </div>
  );
}
