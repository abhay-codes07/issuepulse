"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bell, GitFork, Tag, Zap, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";

const LABELS = [
  "good first issue", "bug", "help wanted", "enhancement", "documentation",
  "hacktoberfest", "beginner friendly", "feature request", "high priority",
  "TypeScript", "React", "security", "performance", "accessibility",
  "needs triage", "wontfix", "duplicate", "question", "refactor",
];

const MOCK_NOTIFICATIONS = [
  { repo: "facebook/react", title: "Fix useEffect cleanup in concurrent mode", labels: ["bug", "good first issue"], time: "2m ago" },
  { repo: "vercel/next.js", title: "Add support for custom 404 in App Router", labels: ["enhancement"], time: "8m ago" },
  { repo: "tailwindlabs/tailwindcss", title: "Container queries not working with JIT", labels: ["bug", "help wanted"], time: "15m ago" },
];

function AnimatedTagCloud() {
  return (
    <div className="relative w-full h-[200px] overflow-hidden" aria-hidden>
      {[0, 1, 2].map((row) => (
        <motion.div
          key={row}
          className="flex gap-3 absolute whitespace-nowrap"
          style={{ top: `${row * 70}px` }}
          animate={{ x: row % 2 === 0 ? [0, -1000] : [-1000, 0] }}
          transition={{ duration: 30 + row * 5, repeat: Infinity, ease: "linear" }}
        >
          {[...LABELS, ...LABELS].map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/[0.03] border border-white/[0.06] text-muted-foreground/50 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors"
            >
              {label}
            </span>
          ))}
        </motion.div>
      ))}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0F1117] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0F1117] to-transparent z-10" />
    </div>
  );
}

function MockNotificationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-md mx-auto glass-card rounded-2xl p-1 glow"
    >
      <div className="rounded-xl bg-[#0D0F16]/80 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">Live Feed</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Live
          </span>
        </div>
        <div className="space-y-2">
          {MOCK_NOTIFICATIONS.map((n, i) => (
            <motion.div
              key={n.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              className="p-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <p className="text-[10px] text-muted-foreground/50 mb-0.5">📦 {n.repo}</p>
              <p className="text-xs text-white/80 leading-snug">{n.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {n.labels.map((l) => (
                  <span key={l} className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                    {l}
                  </span>
                ))}
                <span className="text-[9px] text-muted-foreground/40 ml-auto">{n.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const FEATURES = [
  { icon: GitFork, title: "Track Any Repo", desc: "Add any public GitHub repository by typing owner/repo." },
  { icon: Tag, title: "Label Subscriptions", desc: "Watch specific labels like 'good first issue' or 'bug'." },
  { icon: Zap, title: "Instant Polling", desc: "Issues are checked every 10 minutes via automated cron jobs." },
  { icon: Bell, title: "Push Notifications", desc: "Browser & system notifications when matching issues appear." },
  { icon: Mail, title: "Email Alerts", desc: "Beautiful HTML emails with direct links to GitHub issues." },
  { icon: Shield, title: "Secure & Private", desc: "Auth via Clerk with GitHub OAuth. Your data stays yours." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F1117] overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-white/5 sticky top-0 z-50 bg-[#0F1117]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <span className="text-lg font-bold text-white">IssuePulse</span>
          </Link>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-muted-foreground hover:text-white">
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Get Started
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  Dashboard
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mb-6">
              <Zap className="h-3 w-3" />
              Never miss a good first issue again
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Track Issues.</span>
              <br />
              <span className="gradient-text">Get Notified.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Monitor open source repositories and get instant notifications when issues
              matching your chosen labels are created or updated.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-20"
          >
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 text-base h-12">
                  Start Tracking in 30 Seconds
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 text-base h-12">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </Show>
          </motion.div>

          <MockNotificationCard />
        </div>
      </section>

      {/* Tag Cloud */}
      <section className="py-16">
        <AnimatedTagCloud />
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-muted-foreground">Powerful issue tracking, simplified.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-colors group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Zap className="h-4 w-4 text-indigo-400" />
            IssuePulse
          </div>
          <p className="text-xs text-muted-foreground/50">
            Built with Next.js, Clerk, and ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}
