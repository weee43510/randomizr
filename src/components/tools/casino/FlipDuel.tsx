import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { CasinoHeader, DailyEventBanner, useChipCounter, playRound } from "./_shared";

/** High Stakes Flip Duel — predict streaks of high/low coin flips with escalating multipliers. */
export default function FlipDuel() {
  const { chips, refresh } = useChipCounter();
  const [stake, setStake] = useState(10);
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<string>("");
  const [pick, setPick] = useState<"H" | "T">("H");
  const [pot, setPot] = useState(0); // chips locked in current run

  const start = () => {
    if (busy || chips < stake) return;
    if (!playRound({ stake, rawPayout: 0, coreGameId: "flipduel" }).ok) return;
    setPot(stake);
    setStreak(0);
    setLast("");
    refresh();
    flip();
  };

  const flip = () => {
    setBusy(true);
    sounds.click();
    setTimeout(() => {
      const flip: "H" | "T" = Math.random() < 0.5 ? "H" : "T";
      const won = flip === pick;
      if (won) {
        const newStreak = streak + 1;
        const newPot = Math.floor(pot * 1.7);
        setStreak(newStreak);
        setPot(newPot);
        setLast(`✅ ${flip} — streak ${newStreak} · pot ${newPot}`);
        sounds.win();
      } else {
        setLast(`❌ ${flip} — bust. Lost ${pot}.`);
        setPot(0);
        setStreak(0);
      }
      setBusy(false);
    }, 600);
  };

  const cashOut = () => {
    if (pot <= 0) return;
    const round = playRound({ stake: 0, rawPayout: pot, coreGameId: "flipduel" });
    setLast(`💰 Cashed out +${round.finalPayout}`);
    celebrate("medium");
    setPot(0);
    setStreak(0);
    refresh();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title="High Stakes Flip Duel" subtitle="Casino · Core" emoji="🎲" chips={chips} />
      <DailyEventBanner />

      <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-black/60 to-amber-950/20 text-center space-y-3">
        <div className="text-7xl animate-pulse">{busy ? "🌀" : pot > 0 ? "🪙" : "🎰"}</div>
        <p className="text-[11px] font-mono text-amber-400/80">Streak {streak} · Pot 💰{pot}</p>
        {last && <p className={`text-sm font-bold ${last.startsWith("✅") || last.startsWith("💰") ? "text-amber-300" : "text-rose-300"}`}>{last}</p>}
      </div>

      {pot === 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(["H", "T"] as const).map((p) => (
              <button key={p} onClick={() => setPick(p)} className={`spring-btn p-4 rounded-xl border-2 font-bold text-lg ${
                pick === p ? "border-amber-400 bg-amber-500/15 text-amber-300" : "border-border/40 text-muted-foreground"
              }`}>
                {p === "H" ? "👑 Heads" : "🪶 Tails"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center justify-center">
            <label className="text-xs font-mono text-muted-foreground">Bet:</label>
            <input type="number" value={stake} min={1} max={chips}
              onChange={(e) => setStake(Math.max(1, Math.min(chips, +e.target.value || 0)))}
              className="w-24 px-2 py-1 rounded bg-muted/40 border border-border/40 text-center" />
            <button onClick={start} disabled={chips < stake} className="spring-btn px-6 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-50">
              Start Duel
            </button>
          </div>
          <p className="text-[10px] font-mono text-center text-muted-foreground">Each correct flip multiplies your pot ×1.7. Cash out before you bust.</p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { setPick(pick === "H" ? "T" : "H"); flip(); }} disabled={busy} className="spring-btn p-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold disabled:opacity-50">
            🔁 Flip again ({pick === "H" ? "T" : "H"})
          </button>
          <button onClick={flip} disabled={busy} className="spring-btn p-4 rounded-xl border-2 border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold disabled:opacity-50">
            ▶ Flip ({pick})
          </button>
          <button onClick={cashOut} disabled={busy} className="col-span-2 spring-btn p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-bold">
            💰 Cash out · {pot}
          </button>
        </div>
      )}
    </div>
  );
}
