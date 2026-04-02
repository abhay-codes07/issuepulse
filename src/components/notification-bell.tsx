"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  repoFullName: string;
  issueTitle: string;
  issueUrl: string;
  issueNumber: number;
  labels: string[];
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.repoFullName]) acc[n.repoFullName] = [];
    acc[n.repoFullName].push(n);
    return acc;
  }, {});

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/5"
            id="notification-bell"
          />
        }
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="pulse-badge absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </SheetTrigger>
      <SheetContent className="w-[420px] bg-[#0D0F16] border-l border-white/5 p-0">
        <SheetHeader className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold text-white">
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="text-indigo-400 hover:text-indigo-300 hover:bg-white/5 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1 opacity-60">
                We&apos;ll notify you when matching issues are found
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(grouped).map(([repo, items]) => (
                <div key={repo}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    📦 {repo}
                  </p>
                  <div className="space-y-1">
                    {items.map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <a
                          href={n.issueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => markAsRead(n.id)}
                          className={`block p-3 rounded-lg transition-colors group ${
                            n.isRead
                              ? "hover:bg-white/3"
                              : "bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-snug truncate ${n.isRead ? "text-muted-foreground" : "text-white font-medium"}`}>
                                {n.issueTitle}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-muted-foreground">
                                  #{n.issueNumber}
                                </span>
                                {n.labels.slice(0, 2).map((l) => (
                                  <span
                                    key={l}
                                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300"
                                  >
                                    {l}
                                  </span>
                                ))}
                                <span className="text-[10px] text-muted-foreground/60">
                                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
