"use client";

import { motion } from "framer-motion";
import { ExternalLink, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface IssueCardProps {
  title: string;
  number: number;
  url: string;
  labels: string[];
  repoFullName?: string;
  createdAt: string;
  index?: number;
}

export function IssueCard({ title, number, url, labels, repoFullName, createdAt, index = 0 }: IssueCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="block p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {repoFullName && (
            <p className="text-xs text-muted-foreground/60 mb-1">
              📦 {repoFullName}
            </p>
          )}
          <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-snug">
            <MessageSquare className="inline h-3.5 w-3.5 mr-1.5 text-indigo-400/60" />
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground/50">#{number}</span>
            {labels.map((l) => (
              <span
                key={l}
                className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {l}
              </span>
            ))}
            <span className="text-[10px] text-muted-foreground/40">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
      </div>
    </motion.a>
  );
}
