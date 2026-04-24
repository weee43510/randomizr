import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { CasinoHeader, DailyEventBanner, useChipCounter, playRound } from "./_shared";

/** Chip Cascade — chain reaction risk. Each level multiplies, but bust chance climbs. */
const LEVELS = [
  { mult: 1.5, bustChance: 0.18 },
  { mult: 2.0, bustChance: 0.28 },
  { mult: 3.0, bustChance: 0.38 },
  { mult: 5.0, bustChance: 0.48 },
  { mult: 8.0, bustChance: 0.58 },
  { mult: 14.0, bustChance: 0.68 },
];

export default function ChipCascade() {
  const { chips, refresh } = useChipCounter();
  const [stake, setStake] = useState(10);
  const [level, setLevel] = useState(0); // 0 = idle, 1+ active
  const [pot, setPot] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const start = () => {
    if (level !== 0 || chips < stake) return;
    if (!playRound({ stake, rawPayout: 0, coreGameId: "cascade" }).ok) return;
    setPot(stake);
    setLevel(0);
    setMsg("");
    refresh();
    push();
  };

  const push = () => {
    setBusy(true);
    sounds.click();
    setTimeout(() => {
      const next = level + 1;
      const tier = LEVELS[Math.min(next - 1, LEVELS.length - 1)];
      const bust = Math.random() < tier.bustChance;
      if (bust) {
        setMsg(`💥 Cascade collapsed at level ${next}. Lost ${pot}.`);
        setPot(0);
        setLevel(0);
      } else {
        const newPot = Math.floor(pot * tier.mult);
        setPot(newPot);
        setLevel(next);
        setMsg(`⚡ Level ${next} cleared. Pot ×${tier.mult} = ${newPot}`);
        sounds.win();
      }
      setBusy(false);
    }, 700);
  };

  const cashOut = () => {
    if (pot <= 0) return;
    const round = playRound({ stake: 0, rawPayout: pot, coreGameId: "cascade" });
    setMsg(`💰 Cashed out +${round.finalPayout}`);
    celebrate("medium");
    setPot(0);
    setLevel(0);
    refresh();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title="Chip Cascade Engine" subtitle="Casino · Core" emoji="🎰" chips={chips} />
      <DailyEventBanner />

      <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-black/70 to-amber-950/30 space-y-4">
        <div className="grid grid-cols-6 gap-1.5">
          {LEVELS.map((tier, i) => {
            const reached = level > i;
            const current = level === i + 1;
            return (
              <div key={i} className={`rounded-lg p-2 border text-center transition ${
                current ? "border-amber-400 bg-amber-500/20 scale-110"
                : reached ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-border/30 bg-muted/20 opacity-60"
              }`}>
                <p className="text-[10px] font-mono">L{i + 1}</p>
                <p className="text-xs font-bold text-amber-300">×{tier.mult}</p>
                <p className="text-[9px] text-rose-300">{Math.round(tier.bustChance * 100)}%</p>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Pot</p>
          <p className="text-4xl font-display font-black text-amber-400">💰 {pot}</p>
        </div>
        {msg && <p className={`text-center text-sm font-bold ${msg.startsWith("⚡") || msg.startsWith("💰") ? "text-amber-300" : "text-rose-300"}`}>{msg}</p>}
      </div>

      {pot === 0 ? (
        <div className="flex gap-2 items-center justify-center">
          <label className="text-xs font-mono text-muted-foreground">Bet:</label>
          <input type="number" value={stake} min={1} max={chips}
            onChange={(e) => setStake(Math.max(1, Math.min(chips, +e.target.value || 0)))}
            className="w-24 px-2 py-1 rounded bg-muted/40 border border-border/40 text-center" />
          <button onClick={start} disabled={chips < stake} className="spring-btn px-6 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-50">
            Start Cascade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={push} disabled={busy || level >= LEVELS.length} className="spring-btn p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-300 font-bold disabled:opacity-50">
            ⬆ Push next level
          </button>
          <button onClick={cashOut} disabled={busy} className="spring-btn p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-300 font-bold">
            💰 Cash out · {pot}
          </button>
        </div>
      )}
    </div>
  );
}
