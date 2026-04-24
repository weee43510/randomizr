import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { CasinoHeader, DailyEventBanner, useChipCounter, playRound } from "./_shared";

/** Neon Roulette — bet on color zones, even/odd, or thirds with cinematic spin. */
type Zone = { id: string; label: string; mult: number; matches: (n: number) => boolean; color: string };

const ZONES: Zone[] = [
  { id: "red",   label: "🔴 Red",    mult: 2,  matches: (n) => n !== 0 && [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n), color: "rose" },
  { id: "black", label: "⚫ Black",  mult: 2,  matches: (n) => n !== 0 && ![1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(n), color: "zinc" },
  { id: "even",  label: "🔢 Even",   mult: 2,  matches: (n) => n !== 0 && n % 2 === 0, color: "cyan" },
  { id: "odd",   label: "🎯 Odd",    mult: 2,  matches: (n) => n % 2 === 1, color: "violet" },
  { id: "low",   label: "⬇ 1–18",   mult: 2,  matches: (n) => n >= 1 && n <= 18, color: "emerald" },
  { id: "high",  label: "⬆ 19–36",  mult: 2,  matches: (n) => n >= 19 && n <= 36, color: "indigo" },
  { id: "zero",  label: "💚 0",      mult: 35, matches: (n) => n === 0, color: "emerald" },
];

export default function NeonRoulette() {
  const { chips, refresh } = useChipCounter();
  const [stake, setStake] = useState(10);
  const [zone, setZone] = useState<Zone>(ZONES[0]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const spin = () => {
    if (spinning || stake > chips) return;
    if (!playRound({ stake, rawPayout: 0, coreGameId: "roulette" }).ok) return;
    setSpinning(true);
    setMsg("");
    refresh();
    sounds.drumroll(1700);
    let ticks = 0;
    const id = setInterval(() => {
      setResult(Math.floor(Math.random() * 37));
      ticks += 1;
      if (ticks >= 22) {
        clearInterval(id);
        const final = Math.floor(Math.random() * 37);
        setResult(final);
        if (zone.matches(final)) {
          const round = playRound({ stake: 0, rawPayout: stake * zone.mult, coreGameId: "roulette" });
          setMsg(`✅ ${final} — ${zone.label} hits! +${round.finalPayout}`);
          celebrate("medium");
          sounds.win();
        } else {
          setMsg(`❌ ${final} — house wins.`);
        }
        setSpinning(false);
        refresh();
      }
    }, 75);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title="Neon Roulette Wheel" subtitle="Casino · Core" emoji="🎡" chips={chips} />
      <DailyEventBanner />

      <div className="rounded-2xl p-8 border border-amber-500/30 bg-gradient-to-br from-black/70 to-amber-950/30 text-center">
        <div className={`mx-auto w-44 h-44 rounded-full border-8 border-amber-500/60 flex items-center justify-center text-7xl font-black text-white transition-all ${
          spinning ? "animate-spin" : ""
        }`}
          style={{
            background: result === null
              ? "radial-gradient(circle, hsl(45 80% 30%), hsl(0 0% 8%))"
              : result === 0
                ? "hsl(140 70% 35%)"
                : ZONES[0].matches(result) ? "hsl(0 70% 45%)" : "hsl(0 0% 12%)",
          }}>
          {result ?? "?"}
        </div>
        {msg && <p className={`mt-4 text-base font-bold ${msg.startsWith("✅") ? "text-amber-300" : "text-muted-foreground"}`}>{msg}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ZONES.map((z) => (
          <button key={z.id} onClick={() => setZone(z)} className={`spring-btn p-3 rounded-xl border-2 text-sm font-bold ${
            zone.id === z.id ? "border-amber-400 bg-amber-500/15 text-amber-300" : "border-border/40 text-muted-foreground"
          }`}>
            <div>{z.label}</div>
            <div className="text-[10px] font-mono opacity-70">×{z.mult}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-center justify-center">
        <label className="text-xs font-mono text-muted-foreground">Bet:</label>
        <input type="number" value={stake} min={1} max={chips}
          onChange={(e) => setStake(Math.max(1, Math.min(chips, +e.target.value || 0)))}
          className="w-24 px-2 py-1 rounded bg-muted/40 border border-border/40 text-center" />
        <button onClick={spin} disabled={spinning || stake > chips} className="spring-btn px-6 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-50">
          {spinning ? "Spinning…" : "Spin"}
        </button>
      </div>
    </div>
  );
}
