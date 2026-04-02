"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface AddRepoModalProps {
  onAdded?: () => void;
}

export function AddRepoModal({ onAdded }: AddRepoModalProps) {
  const [open, setOpen] = useState(false);
  const [repoInput, setRepoInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{
    fullName: string;
    avatarUrl: string;
    description: string;
  } | null>(null);

  const handleVerifyAndAdd = async () => {
    const trimmed = repoInput.trim();
    if (!trimmed.includes("/")) {
      toast.error("Enter in owner/repo format (e.g. facebook/react)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to add repository");
        return;
      }

      setVerified(true);
      setRepoInfo(data.repo);
      toast.success(`Added ${data.repo.fullName}!`);
      
      setTimeout(() => {
        setOpen(false);
        setRepoInput("");
        setVerified(false);
        setRepoInfo(null);
        onAdded?.();
      }, 1000);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v);
      if (!v) {
        setRepoInput("");
        setVerified(false);
        setRepoInfo(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          id="add-repo-button"
        >
          <Plus className="h-4 w-4" />
          Add Repo
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1D2E] border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Track a Repository</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="repo-input" className="text-sm text-muted-foreground">
              Repository (owner/repo)
            </Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="repo-input"
                placeholder="facebook/react"
                value={repoInput}
                onChange={(e) => {
                  setRepoInput(e.target.value);
                  setVerified(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyAndAdd()}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/40"
                disabled={loading}
              />
            </div>
          </div>

          {verified && repoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              {repoInfo.avatarUrl && (
                <img
                  src={repoInfo.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300">
                  <Check className="inline h-3.5 w-3.5 mr-1" />
                  {repoInfo.fullName}
                </p>
                {repoInfo.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {repoInfo.description}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleVerifyAndAdd}
            disabled={loading || !repoInput.trim() || verified}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : verified ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {loading ? "Verifying..." : verified ? "Added!" : "Add Repository"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
