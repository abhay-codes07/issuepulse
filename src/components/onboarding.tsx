"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, GitFork, Tag, Bell, Check, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface OnboardingProps {
  show: boolean;
  onComplete: () => void;
}

const STEPS = [
  { title: "Add Your First Repo", icon: GitFork, desc: "Track any public GitHub repository" },
  { title: "Choose Labels", icon: Tag, desc: "Pick labels like 'good first issue' or 'bug'" },
  { title: "Enable Notifications", icon: Bell, desc: "Get notified via email and browser" },
];

export function Onboarding({ show, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [repoInput, setRepoInput] = useState("");
  const [addedRepo, setAddedRepo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleAddRepo = async () => {
    if (!repoInput.includes("/")) {
      toast.error("Use format: owner/repo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddedRepo(data.repo.fullName);
        toast.success(`Added ${data.repo.fullName}!`);
        setStep(1);
      } else {
        const data = await res.json();
        toast.error(data.error || "Repository not found");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setCompleted(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, [onComplete]);

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="bg-[#1A1D2E] border-white/10 sm:max-w-lg p-0 overflow-hidden [&>button]:hidden">
        {/* Progress */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-indigo-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              >
                <PartyPopper className="h-16 w-16 text-indigo-400 mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">You&apos;re All Set!</h2>
              <p className="text-muted-foreground text-center">
                IssuePulse is now tracking issues for you. 🎉
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 pt-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  {(() => {
                    const Icon = STEPS[step].icon;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{STEPS[step].title}</h2>
                  <p className="text-xs text-muted-foreground">{STEPS[step].desc}</p>
                </div>
              </div>

              {step === 0 && (
                <div className="space-y-3">
                  <Input
                    placeholder="facebook/react"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddRepo()}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Button
                    onClick={handleAddRepo}
                    disabled={loading || !repoInput.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    {loading ? "Verifying..." : "Add & Continue"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve set up default labels for <strong className="text-white">{addedRepo}</strong>.
                    You can customize them later in the repo settings.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["good first issue", "help wanted", "bug"].map((l) => (
                      <span
                        key={l}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                      >
                        <Check className="inline h-3 w-3 mr-1" />
                        {l}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Allow browser notifications to get instant alerts when matching issues appear.
                  </p>
                  <Button
                    onClick={requestNotificationPermission}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Enable Notifications
                    <Bell className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    onClick={() => {
                      setCompleted(true);
                      setTimeout(onComplete, 2000);
                    }}
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-white"
                  >
                    Skip for now
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
