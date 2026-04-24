import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { CasinoHeader, DailyEventBanner, useChipCounter, playRound } from "./_shared";

/** Casino Mind Arena — show a sequence of symbols, then ask a logic question:
 *  "Which symbol appeared the most?" or "Which appeared exactly twice?" Bet on yourself.
 *  Time pressure: 5 seconds to decide. */
const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "●"];

type Question = { symbols: string[]; prompt: string; answer: string };

function buildQuestion(): Question {
  // Generate 6-symbol sequence with biased counts
  const counts: Record<string, number> = {};
  const seq: string[] = [];
  for (let i = 0; i < 6; i++) {
    const s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    seq.push(s);
    counts[s] = (counts[s] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const mode = Math.random() < 0.5 ? "max" : "twice";
  if (mode === "max") {
    return { symbols: seq, prompt: "Which appeared the MOST?", answer: sorted[0][0] };
  }
  const twice = Object.entries(counts).find(([, n]) => n === 2);
  if (twice) return { symbols: seq, prompt: "Which appeared EXACTLY twice?", answer: twice[0] };
  return { symbols: seq, prompt: "Which appeared the MOST?", answer: sorted[0][0] };
}

export default function MindArena() {
  const { chips, refresh } = useChipCounter();
  const [stake, setStake] = useState(10);
  const [phase, setPhase] = useState<"idle" | "show" | "ask" | "done">("idle");
  const [q, setQ] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const [msg, setMsg] = useState("");

  const start = () => {
    if (chips < stake || phase === "show" || phase === "ask") return;
    if (!playRound({ stake, rawPayout: 0, coreGameId: "mindarena" }).ok) return;
    refresh();
    const newQ = buildQuestion();
    setQ(newQ);
    setPhase("show");
    setMsg("");
    setTimeout(() => { setPhase("ask"); setTimeLeft(5); }, 2400);
    sounds.click();
  };

  useEffect(() => {
    if (phase !== "ask") return;
    const id = setInterval(() => setTimeLeft((t) => {
      if (t <= 1) { clearInterval(id); answer(""); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const answer = (chosen: string) => {
    if (!q || phase === "done") return;
    setPhase("done");
    if (chosen === q.answer) {
      const round = playRound({ stake: 0, rawPayout: stake * 3, coreGameId: "mindarena" });
      setMsg(`🧠 Correct (${q.answer})! +${round.finalPayout}`);
      celebrate("small");
      sounds.win();
    } else {
      setMsg(`❌ Wrong — answer was ${q.answer}. Lost ${stake}.`);
    }
    refresh();
    setTimeout(() => setPhase("idle"), 100);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title="Casino Mind Arena" subtitle="Casino · Core" emoji="🧠" chips={chips} />
      <DailyEventBanner />

      <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-black/70 to-violet-950/30 space-y-4 min-h-[200px] flex flex-col items-center justify-center">
        {phase === "idle" && (
          <p className="text-sm text-muted-foreground italic">Bet, then watch the sequence. You have 5s to answer.</p>
        )}
        {phase === "show" && q && (
          <div className="space-y-3 text-center">
            <p className="text-[10px] font-mono uppercase text-amber-400">Memorize</p>
            <div className="flex gap-2 justify-center text-4xl font-black">
              {q.symbols.map((s, i) => <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>{s}</span>)}
            </div>
          </div>
        )}
        {phase === "ask" && q && (
          <div className="space-y-3 w-full">
            <div className="text-center space-y-1">
              <p className="text-base font-bold">{q.prompt}</p>
              <p className="text-2xl font-mono text-rose-300">{timeLeft}s</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SYMBOLS.map((s) => (
                <button key={s} onClick={() => answer(s)} className="spring-btn p-3 rounded-xl border-2 border-amber-500/40 bg-amber-500/10 text-3xl font-black hover:bg-amber-500/25">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msg && <p className={`text-center text-base font-bold ${msg.startsWith("🧠") ? "text-amber-300" : "text-rose-300"}`}>{msg}</p>}
      </div>

      {(phase === "idle" || phase === "done") && (
        <div className="flex gap-2 items-center justify-center">
          <label className="text-xs font-mono text-muted-foreground">Bet:</label>
          <input type="number" value={stake} min={1} max={chips}
            onChange={(e) => setStake(Math.max(1, Math.min(chips, +e.target.value || 0)))}
            className="w-24 px-2 py-1 rounded bg-muted/40 border border-border/40 text-center" />
          <button onClick={start} disabled={chips < stake} className="spring-btn px-6 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-50">
            Play · ×3 on correct
          </button>
        </div>
      )}
    </div>
  );
}
