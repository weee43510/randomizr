import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { CasinoHeader, DailyEventBanner, useChipCounter, playRound } from "./_shared";

/** Dealer's Bluff — pick whether the dealer is bluffing on a hidden card.
 *  Each round you see the dealer's "tell" (their stated card 1-13) and one true peek hint.
 *  You decide: BELIEVE or CALL BLUFF. Wager scales with confidence (1×, 2×, 4×). */
export default function DealersBluff() {
  const { chips, refresh } = useChipCounter();
  const [stake, setStake] = useState(10);
  const [confidence, setConfidence] = useState<1 | 2 | 4>(1);
  const [phase, setPhase] = useState<"idle" | "show" | "reveal">("idle");
  const [tell, setTell] = useState(0);     // dealer claim
  const [actual, setActual] = useState(0); // dealer real card
  const [hint, setHint] = useState("");
  const [msg, setMsg] = useState("");

  const cardLabel = (n: number) => n === 1 ? "A" : n === 11 ? "J" : n === 12 ? "Q" : n === 13 ? "K" : `${n}`;

  const deal = () => {
    if (phase === "show") return;
    const totalStake = stake * confidence;
    if (!playRound({ stake: totalStake, rawPayout: 0, coreGameId: "bluff" }).ok) return;
    refresh();
    const real = Math.floor(Math.random() * 13) + 1;
    const isBluff = Math.random() < 0.45;
    let claim = real;
    if (isBluff) {
      do { claim = Math.floor(Math.random() * 13) + 1; } while (claim === real);
    }
    setActual(real);
    setTell(claim);
    // Honest hint: reveals real card range (high/low) 70% of the time, lies 30%.
    const honest = Math.random() < 0.7;
    const trueHigh = real >= 7;
    const reportedHigh = honest ? trueHigh : !trueHigh;
    setHint(reportedHigh ? "🔮 The chip whispers: HIGH (7+)" : "🔮 The chip whispers: LOW (≤6)");
    setMsg("");
    setPhase("show");
    sounds.click();
  };

  const decide = (call: "believe" | "bluff") => {
    if (phase !== "show") return;
    setPhase("reveal");
    const isBluff = tell !== actual;
    const correct = (call === "bluff" && isBluff) || (call === "believe" && !isBluff);
    if (correct) {
      const totalStake = stake * confidence;
      const payout = totalStake * 2; // doubles your stake on correct call
      const round = playRound({ stake: 0, rawPayout: payout, coreGameId: "bluff" });
      setMsg(`✅ Right! Dealer ${isBluff ? "WAS bluffing" : "told the truth"}. +${round.finalPayout}`);
      celebrate("small");
      sounds.win();
    } else {
      setMsg(`❌ Wrong. Dealer ${isBluff ? "WAS bluffing" : "told the truth"}. Lost ${stake * confidence}.`);
    }
    refresh();
    setTimeout(() => setPhase("idle"), 100);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title="Dealer's Bluff Table" subtitle="Casino · Core" emoji="🃏" chips={chips} />
      <DailyEventBanner />

      <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-black/70 to-emerald-950/30 space-y-4">
        <div className="flex items-center justify-around">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Dealer's claim</p>
            <div className="w-20 h-28 rounded-xl border-4 border-amber-500/60 bg-card flex items-center justify-center text-4xl font-black">
              {phase === "idle" ? "?" : cardLabel(tell)}
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Actual</p>
            <div className={`w-20 h-28 rounded-xl border-4 flex items-center justify-center text-4xl font-black ${
              phase === "reveal"
                ? (tell === actual ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300" : "border-rose-500/60 bg-rose-500/10 text-rose-300")
                : "border-muted bg-muted/40 text-muted-foreground"
            }`}>
              {phase === "reveal" ? cardLabel(actual) : "?"}
            </div>
          </div>
        </div>

        {phase === "show" && <p className="text-center text-sm text-amber-300">{hint}</p>}
        {msg && <p className={`text-center text-base font-bold ${msg.startsWith("✅") ? "text-amber-300" : "text-rose-300"}`}>{msg}</p>}
      </div>

      {phase !== "show" ? (
        <>
          <div className="flex gap-2 items-center justify-center">
            <label className="text-xs font-mono text-muted-foreground">Bet:</label>
            <input type="number" value={stake} min={1} max={chips}
              onChange={(e) => setStake(Math.max(1, Math.min(chips, +e.target.value || 0)))}
              className="w-20 px-2 py-1 rounded bg-muted/40 border border-border/40 text-center" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 4] as const).map((c) => (
              <button key={c} onClick={() => setConfidence(c)} className={`spring-btn p-3 rounded-xl border-2 font-bold text-sm ${
                confidence === c ? "border-amber-400 bg-amber-500/15 text-amber-300" : "border-border/40 text-muted-foreground"
              }`}>
                {c === 1 ? "Cautious" : c === 2 ? "Bold" : "All-in"} · ×{c}
              </button>
            ))}
          </div>
          <button onClick={deal} disabled={chips < stake * confidence} className="w-full spring-btn px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-50">
            Deal · risk {stake * confidence}
          </button>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => decide("believe")} className="spring-btn p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-300 font-bold">
            ✅ Believe
          </button>
          <button onClick={() => decide("bluff")} className="spring-btn p-4 rounded-xl bg-rose-500/15 border-2 border-rose-500/50 text-rose-300 font-bold">
            🤥 Call Bluff
          </button>
        </div>
      )}
    </div>
  );
}
