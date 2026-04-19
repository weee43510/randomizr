import { useEffect, useRef, useState } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Save } from "lucide-react";

export default function Notepad() {
  const [text, setText] = useState<string>(() => loadFromStorage<string>("notepad_text", ""));
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastSavedRef = useRef<string>(text);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (text !== lastSavedRef.current) {
        saveToStorage("notepad_text", text);
        lastSavedRef.current = text;
        setSavedAt(Date.now());
      }
    }, 3000);
    return () => clearInterval(id);
  }, [text]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const ago = savedAt ? Math.max(0, Math.floor((Date.now() - savedAt) / 1000)) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">SCRATCHPAD · LOCAL</p>
        <h2 className="text-4xl font-display font-black gradient-text">Notepad</h2>
        <p className="text-xs text-muted-foreground">Autosaves every 3 seconds. Stays on this device.</p>
      </header>

      <div className="glass-card-highlight glass-card-shimmer p-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Brain dump here…"
          className="w-full min-h-[400px] bg-transparent p-5 text-foreground font-mono text-sm leading-relaxed resize-y outline-none placeholder:text-muted-foreground/60"
          spellCheck
        />
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
        <span>{wordCount} words · {charCount} chars</span>
        <span className="flex items-center gap-1.5">
          <Save className="w-3 h-3" />
          {ago === null ? "not saved yet" : ago < 3 ? "just saved" : `saved ${ago}s ago`}
        </span>
      </div>
    </div>
  );
}
