import { useState } from "react";
import { sounds } from "@/lib/sounds";

const TRUTHS = [
  "What's the most embarrassing song on your playlist?",
  "Last person you stalked on social media?",
  "What's a lie you told that snowballed?",
  "Biggest irrational fear?",
  "What's your weirdest hidden talent?",
  "Worst gift you've ever received?",
  "Most childish thing you still do?",
  "What's a secret you've never told your best friend?",
  "Last time you cried — and why?",
  "Most embarrassing nickname you've had?",
  "What's the dumbest thing you've Googled?",
  "Biggest red flag you ignored?",
];

const DARES = [
  "Speak in an accent for the next 3 rounds.",
  "Text the 5th person in your contacts 'I miss your face'.",
  "Do 10 push-ups. Right now. Go.",
  "Let someone post a story on your Instagram.",
  "Show the last photo you saved.",
  "Sing the chorus of a song picked by the group.",
  "Eat a spoonful of something from the fridge — eyes closed.",
  "Do your best impression of someone in the room.",
  "Speak only in questions for 2 minutes.",
  "Read your last 3 sent texts out loud.",
  "Do an interpretive dance of your day so far.",
  "Compliment everyone in the room — specifically.",
];

type Mode = "truth" | "dare" | "either";

export default function TruthOrDare() {
  const [mode, setMode] = useState<Mode>("either");
  const [pulled, setPulled] = useState<{ kind: "truth" | "dare"; text: string } | null>(null);
  const [pulling, setPulling] = useState(false);

  const pull = () => {
    if (pulling) return;
    setPulling(true);
    setPulled(null);
    sounds.drumroll(900);
    setTimeout(() => {
      const kind: "truth" | "dare" =
        mode === "either" ? (Math.random() < 0.5 ? "truth" : "dare") : mode;
      const list = kind === "truth" ? TRUTHS : DARES;
      const text = list[Math.floor(Math.random() * list.length)];
      setPulled({ kind, text });
      setPulling(false);
      sounds.win();
    }, 900);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold gradient-text">Truth or Dare</h2>
        <p className="text-sm text-muted-foreground">Tap a mode, pull a card, get exposed.</p>
      </div>

      <div className="flex justify-center gap-2">
        {(["truth", "either", "dare"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`spring-btn px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border ${
                active
                  ? m === "truth"
                    ? "bg-primary/25 border-primary/60 text-primary neon-glow-cyan"
                    : m === "dare"
                      ? "bg-destructive/25 border-destructive/60 text-destructive"
                      : "bg-accent/25 border-accent/60 text-accent neon-glow-violet"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {m === "either" ? "Surprise Me" : m}
            </button>
          );
        })}
      </div>

      <div
        className={`glass-card-highlight glass-card-shimmer min-h-[220px] p-8 flex items-center justify-center text-center ${
          pulled?.kind === "dare" ? "border-destructive/40" : ""
        }`}
      >
        {pulling ? (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : pulled ? (
          <div className="space-y-3 animate-scale-in">
            <p
              className={`text-xs font-mono uppercase tracking-[0.3em] ${
                pulled.kind === "dare" ? "text-destructive" : "neon-text-cyan"
              }`}
            >
              {pulled.kind}
            </p>
            <p className="text-lg font-display font-semibold text-foreground leading-snug">
              {pulled.text}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pull your first card →</p>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={pull}
          disabled={pulling}
          className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
        >
          {pulling ? "Drawing…" : "PULL A CARD"}
        </button>
      </div>
    </div>
  );
}
