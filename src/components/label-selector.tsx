"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface LabelSelectorProps {
  repoId: string;
  owner: string;
  repo: string;
  selectedLabels: { label: string; color: string | null }[];
  onUpdate?: () => void;
}

export function LabelSelector({ repoId, owner, repo, selectedLabels: initial, onUpdate }: LabelSelectorProps) {
  const [available, setAvailable] = useState<{ name: string; color: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial.map((l) => l.label)));
  const [customLabel, setCustomLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/repos/${repoId}/labels`);
        if (res.ok) {
          const data = await res.json();
          setAvailable(data.available || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [repoId, owner, repo]);

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

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/repos/${repoId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels: Array.from(selected) }),
      });
      if (res.ok) {
        toast.success("Labels updated!");
        onUpdate?.();
      } else {
        toast.error("Failed to save labels");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const popularLabels = ["good first issue", "help wanted", "bug", "enhancement", "documentation", "hacktoberfest"];

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading labels...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Available labels from repo */}
      {available.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Repository Labels</p>
          <div className="flex flex-wrap gap-2">
            {available.map((l) => {
              const isSelected = selected.has(l.name);
              return (
                <button
                  key={l.name}
                  onClick={() => toggle(l.name)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : "bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: `#${l.color}` }}
                  />
                  {l.name}
                  {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular labels quick-add */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Popular Labels</p>
        <div className="flex flex-wrap gap-2">
          {popularLabels.filter((l) => !available.some((a) => a.name === l)).map((l) => {
            const isSelected = selected.has(l);
            return (
              <button
                key={l}
                onClick={() => toggle(l)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "bg-white/5 text-muted-foreground border border-white/10 hover:border-white/20"
                }`}
              >
                {l}
                {isSelected && <Check className="h-3 w-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom label */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Custom Label</p>
        <div className="flex gap-2">
          <Input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Type a label name..."
            className="bg-white/5 border-white/10 text-white text-sm placeholder:text-muted-foreground/40"
          />
          <Button onClick={addCustom} variant="outline" size="sm" className="border-white/10 text-muted-foreground hover:text-white shrink-0">
            Add
          </Button>
        </div>
      </div>

      {/* Selected summary */}
      {selected.size > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Watching {selected.size} label{selected.size > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(selected).map((l) => (
              <Badge
                key={l}
                variant="secondary"
                className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 gap-1 pr-1"
              >
                {l}
                <button onClick={() => toggle(l)} className="hover:text-white transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={save}
        disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Labels
      </Button>
    </div>
  );
}
