import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { History, Sparkles } from "lucide-react";

const answers = [
  "Absolutely, yes! ✨", "Without a doubt.", "My sources say no. 💀",
  "Ask again... I was napping.", "The stars align — YES!", "Not a chance. 😏",
  "Signs point to maybe... lol.", "100% yes, don't overthink it.",
  "Hard no. Next question.", "Reply hazy, try after coffee ☕",
  "Yasss queen! 👑", "The universe says... meh.",
  "Bold of you to ask. But yes.", "LOL no.", "It is certain!",
  "Don't count on it.", "Better not tell you now 😶",
  "My gut says yes. My brain says run.", "Outlook not so good 💀",
  "Concentrate and ask again...", "Mercury says: GO FOR IT.",
  "The vibes are off. Try later.", "Crystal clear: yes.", "Nope. Touch grass.",
];

interface Entry { q: string; a: string; t: number; }

export default function AiMystic() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState<Entry[]>(() => loadFromStorage("mystic_history", [] as Entry[]));
  const [shake, setShake] = useState(false);

  useEffect(() => { saveToStorage("mystic_history", history.slice(0, 5)); }, [history]);

  const ask = () => {
    if (!question.trim() || thinking) return;
    setThinking(true);
    setAnswer(null);
    setShake(true);
    sounds.mystic();
    setTimeout(() => setShake(false), 600);

    setTimeout(() => {
      const a = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(a);
      setThinking(false);
      setHistory((h) => [{ q: question.trim(), a, t: Date.now() }, ...h].slice(0, 5));
      sounds.win();
      celebrate("small");
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 animate-fade-in py-4">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">8-BALL · 24 ANSWERS</p>
        <h2 className="text-4xl font-display font-black gradient-text">AI Mystic</h2>
      </header>

      {/* Orb */}
      <div className={`relative w-48 h-48 flex items-center justify-center ${shake ? "animate-pulse" : ""}`}>
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-neon-violet/30 to-neon-cyan/30 ${
            thinking ? "animate-spin" : "animate-pulse-glow"
          }`}
          style={{ filter: "blur(20px)" }}
        />
        <div className="relative w-40 h-40 rounded-full glass-card-highlight flex items-center justify-center neon-glow-violet">
          <div className="text-center p-4">
            {thinking ? (
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            ) : answer ? (
              <p className="text-sm font-bold neon-text-cyan animate-pop-in">{answer}</p>
            ) : (
              <Sparkles className="w-8 h-8 text-neon-cyan/60 mx-auto" />
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="w-full max-w-md flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Will I win the lottery?"
          className="flex-1 px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
        />
        <button
          onClick={ask}
          disabled={thinking}
          className="spring-btn px-6 py-3 rounded-lg bg-primary/20 border border-primary/40 text-primary font-semibold hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
        >
          Ask
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <History className="w-3 h-3" /> Last 5 readings
          </p>
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="glass-card p-2.5 space-y-0.5">
                <p className="text-[11px] text-muted-foreground italic truncate">"{h.q}"</p>
                <p className="text-xs font-semibold text-foreground">→ {h.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
