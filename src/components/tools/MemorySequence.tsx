import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const COLORS = [
  { id: 0, name: "cyan", color: "hsl(var(--neon-cyan))", tone: 523 },
  { id: 1, name: "violet", color: "hsl(var(--neon-violet))", tone: 659 },
  { id: 2, name: "pink", color: "hsl(var(--neon-pink))", tone: 784 },
  { id: 3, name: "green", color: "hsl(var(--neon-green))", tone: 988 },
];

export default function MemorySequence() {
  const [seq, setSeq] = useState<number[]>([]);
  const [userIdx, setUserIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "show" | "input" | "lose">("idle");
  const [best, setBest] = useState<number>(() => loadFromStorage("memseq_best", 0));

  const start = () => {
    setSeq([Math.floor(Math.random() * 4)]);
    setUserIdx(0);
    setStatus("show");
    setPlaying(true);
  };

  // Show sequence
  useEffect(() => {
    if (status !== "show" || seq.length === 0) return;
    let i = 0;
    const tick = () => {
      if (i >= seq.length) {
        setActive(null);
        setStatus("input");
        setUserIdx(0);
        return;
      }
      const id = seq[i];
      setActive(id);
      // play tone
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.value = COLORS[id].tone;
        osc.type = "triangle";
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } catch {}
      setTimeout(() => {
        setActive(null);
        i++;
        setTimeout(tick, 180);
      }, 380);
    };
    const t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [status, seq]);

  const press = (id: number) => {
    if (status !== "input") return;
    setActive(id);
    setTimeout(() => setActive(null), 180);
    if (seq[userIdx] !== id) {
      setStatus("lose");
      setPlaying(false);
      sounds.flip();
      if (seq.length - 1 > best) {
        setBest(seq.length - 1);
        saveToStorage("memseq_best", seq.length - 1);
        celebrate("small");
      }
      return;
    }
    if (userIdx + 1 === seq.length) {
      // next round
      sounds.tick();
      setTimeout(() => {
        setSeq((s) => [...s, Math.floor(Math.random() * 4)]);
        setStatus("show");
      }, 500);
    } else {
      setUserIdx((i) => i + 1);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">SIMON · COPYCAT</p>
        <h2 className="text-4xl font-display font-black gradient-text">Memory Sequence</h2>
        <p className="text-xs text-muted-foreground">
          Round {playing ? seq.length : 0} · Best {best}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 aspect-square">
        {COLORS.map((c) => {
          const on = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => press(c.id)}
              disabled={status !== "input"}
              className="rounded-2xl spring-btn border-2 transition-all"
              style={{
                background: on ? c.color : `${c.color.replace(")", " / 0.2)")}`,
                borderColor: c.color,
                boxShadow: on ? `0 0 40px ${c.color}` : "none",
                transform: on ? "scale(0.96)" : undefined,
              }}
            />
          );
        })}
      </div>

      <div className="text-center space-y-3">
        {status === "lose" && (
          <p className="text-destructive font-display font-bold animate-pop-in">
            ❌ Game over! You hit round {seq.length}.
          </p>
        )}
        <button
          onClick={start}
          className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 neon-glow-cyan"
        >
          {status === "idle" ? "START" : status === "lose" ? "PLAY AGAIN" : status === "show" ? "WATCH…" : "YOUR TURN"}
        </button>
      </div>
    </div>
  );
}
