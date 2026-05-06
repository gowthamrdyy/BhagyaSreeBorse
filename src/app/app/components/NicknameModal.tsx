"use client";
import { useState } from "react";
import { useNicknameStore } from "@/hooks/zustand";

export const NicknameModal = () => {
  const { hasSet, setNickname } = useNicknameStore();
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Already set or just submitted — don't render
  if (hasSet || submitted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    setNickname(name);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-1">What should I call you?</h2>
        <p className="text-xs text-muted-foreground mb-5">Enter a nickname — this is how you'll appear everywhere in the app.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Gowtham"
            autoFocus
            maxLength={30}
            className="w-full px-3 py-2 text-sm bg-secondary border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full py-2 text-sm font-semibold bg-foreground text-background rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Let's go
          </button>
        </form>
      </div>
    </div>
  );
};
