import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { Shuffle } from "lucide-react";

const EMOJIS = [
  "🐉","🚀","🍕","👻","🦄","🌋","🧙","🦖","🎸","⚔️",
  "🪐","🍔","🐙","🤖","🧠","🐝","🌪️","🦊","🎩","💎",
  "🏰","🗡️","🍩","🦇","🌈","🛸","🐢","🥷","🧜","🎲",
  "🏝️","🔮","🎪","🐧","🪄","🦑","🍣","🛹","🎤","🐺",
];

export default function EmojiStory() {
  const [picks, setPicks] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const roll = () => {
    const out: string[] = [];
    const pool = [...EMOJIS];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    setPicks(out);
    setStory("");
    setSubmitted(false);
    sounds.flip();
  };

  const submit = () => {
    if (story.trim().length < 10) return;
    setSubmitted(true);
    sounds.win();
    celebrate("medium");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">5 EMOJIS · 1 STORY</p>
        <h2 className="text-4xl font-display font-black gradient-text">Emoji Story</h2>
        <p className="text-xs text-muted-foreground">Roll 5 random emojis. Spin a tale using all of them.</p>
      </header>

      <div className="glass-card-highlight p-8 flex justify-center gap-3 min-h-[120px] items-center">
        {picks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Hit ROLL to get your prompt</p>
        ) : (
          picks.map((e, i) => (
            <span key={i} className="text-5xl animate-pop-in" style={{ animationDelay: `${i * 80}ms` }}>{e}</span>
          ))
        )}
      </div>

      <button
        onClick={roll}
        className="w-full spring-btn px-6 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold neon-glow-cyan flex items-center justify-center gap-2"
      >
        <Shuffle className="w-4 h-4" /> ROLL EMOJIS
      </button>

      {picks.length > 0 && (
        <>
          <textarea
            value={story}
            onChange={(e) => { setStory(e.target.value); setSubmitted(false); }}
            placeholder="Once upon a time…"
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/50 outline-none focus:border-primary/50 resize-none text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-muted-foreground">{story.length} chars</span>
            <button
              onClick={submit}
              disabled={story.trim().length < 10}
              className="spring-btn px-6 py-2.5 rounded-xl bg-accent/20 border border-accent/40 text-accent font-bold disabled:opacity-40"
            >
              {submitted ? "✓ SAVED" : "SUBMIT"}
            </button>
          </div>
          {submitted && (
            <div className="glass-card-highlight p-4 animate-pop-in">
              <p className="text-xs font-mono uppercase tracking-widest neon-text-cyan mb-2">Your tale</p>
              <p className="text-sm leading-relaxed">{story}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
