"use client";

import { motion } from "framer-motion";
import { GitPullRequestDraft } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No issues yet",
  description = "When matching issues are found in your tracked repositories, they'll appear here.",
  icon,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      <div className="relative mb-6">
        {icon || (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <svg
              viewBox="0 0 120 120"
              className="h-20 w-20 text-muted-foreground/20"
              fill="currentColor"
            >
              <path d="M60 0C26.9 0 0 26.9 0 60s26.9 60 60 60 60-26.9 60-60S93.1 0 60 0zm0 112C31.3 112 8 88.7 8 60S31.3 8 60 8s52 23.3 52 52-23.3 52-52 52z"/>
              <circle cx="38" cy="48" r="6"/>
              <circle cx="82" cy="48" r="6"/>
              <path d="M80 76c0 0-8 10-20 10s-20-10-20-10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M60 4 L65 0 L60 -4 M56 -8 C56 -8 60 -14 72 -14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" transform="translate(16, 28)"/>
            </svg>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-white/80 mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground/60 max-w-md">{description}</p>
    </motion.div>
  );
}
