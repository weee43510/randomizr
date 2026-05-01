import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import type { Season, SeasonExclusiveGame } from "@/lib/seasons";
import { CasinoHeader, DailyEventBanner, useChipCounter, playRound } from "@/components/tools/casino/_shared";
import { addTierXP } from "@/lib/casino";

interface Props {
  game: SeasonExclusiveGame;
  season: Season;
}

const STAKE = 10;

interface Choice {
  emoji: string;
  label: string;
  /** Probability weight & payout multiplier */
  weight: number;
  payout: number;
}

function buildChoices(seed: string): Choice[] {
  // Deterministic-ish per game so each exclusive feels distinct
  const variants: Choice[][] = [
    [
      { emoji: "🟢", label: "Safe", weight: 70, payout: 15 },
      { emoji: "🟡", label: "Risky", weight: 25, payout: 40 },
      { emoji: "🔴", label: "Wild", weight: 8,  payout: 120 },
    ],
    [
      { emoji: "🃏", label: "Cards", weight: 50, payout: 22 },
      { emoji: "🎲", label: "Dice",  weight: 30, payout: 35 },
      { emoji: "🎰", label: "Slots", weight: 12, payout: 90 },
    ],
    [
      { emoji: "💎", label: "Diamond", weight: 20, payout: 60 },
      { emoji: "👑", label: "Crown",   weight: 15, payout: 80 },
      { emoji: "🔥", label: "Fire",    weight: 50, payout: 18 },
      { emoji: "⚡", label: "Bolt",    weight: 10, payout: 130 },
    ],
  ];
  const i = seed.charCodeAt(0) % variants.length;
  return variants[i];
}

type Phase = "pick" | "reveal" | "result";

export default function GenericSeasonGame({ game, season }: Props) {
  const { chips, refresh } = useChipCounter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [picked, setPicked] = useState<number | null>(null);
  const [outcomeIdx, setOutcomeIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [revealStep, setRevealStep] = useState(0);

  const choices = buildChoices(game.id);

  const totalWeight = choices.reduce((s, c) => s + c.weight, 0);
  const rollOutcome = () => {
    let r = Math.random() * totalWeight;
    for (let i = 0; i < choices.length; i++) {
      r -= choices[i].weight;
      if (r <= 0) return i;
    }
    return 0;
  };

  const reset = () => { setPhase("pick"); setPicked(null); setOutcomeIdx(null); setRevealStep(0); };

  const handlePick = (idx: number) => {
    if (chips < STAKE) return;
    if (!playRound({ stake: STAKE, rawPayout: 0, coreGameId: `exclusive_${game.id}` }).ok) return;
    refresh();
    sounds.click();
    setPicked(idx);
    setPhase("reveal");
    const outcome = rollOutcome();
    setOutcomeIdx(outcome);

    // Suspense reveal cycle
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRevealStep(step);
      sounds.click();
      if (step >= 8) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("result");
          if (outcome === idx) {
            const round = playRound({ stake: 0, rawPayout: choices[idx].payout, coreGameId: `exclusive_${game.id}` });
            const line = `🎉 +${round.finalPayout} chips · matched ${choices[idx].emoji}`;
            setHistory((h) => [line, ...h].slice(0, 8));
            sounds.win();
            celebrate(choices[idx].payout >= 80 ? "big" : "medium");
            addTierXP(20);
          } else {
            setHistory((h) => [`❌ −${STAKE} · you picked ${choices[idx].emoji}, drew ${choices[outcome].emoji}`, ...h].slice(0, 8));
            addTierXP(5);
          }
          refresh();
        }, 250);
      }
    }, 130);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title={game.label} subtitle={`${season.name} · Exclusive`} emoji={game.emoji} chips={chips} />
      <DailyEventBanner />

      <div className="rounded-2xl p-6 border border-amber-500/30 bg-gradient-to-br from-black/70 via-amber-950/10 to-black/70 text-center space-y-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_50%_50%,hsl(45_95%_55%/0.3),transparent_70%)]" />
        <div className="relative">
          <div className="text-6xl mb-2">{game.emoji}</div>
          <p className="text-xs text-muted-foreground italic max-w-md mx-auto">{game.description}</p>
          <p className="text-[10px] font-mono text-amber-400/80 mt-1">Stake: {STAKE} chips · Match your pick to win</p>
        </div>

        {phase === "pick" && (
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto relative">
            {choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handlePick(i)}
                disabled={chips < STAKE}
                className="spring-btn rounded-xl p-4 border-2 border-amber-500/40 bg-black/40 hover:bg-amber-500/10 hover:border-amber-400 disabled:opacity-40"
              >
                <div className="text-4xl">{c.emoji}</div>
                <p className="text-[11px] font-mono text-amber-300 mt-1">{c.label}</p>
                <p className="text-[10px] text-muted-foreground">×{(c.payout / STAKE).toFixed(1)}</p>
              </button>
            ))}
          </div>
        )}

        {phase === "reveal" && outcomeIdx !== null && (
          <div className="space-y-3 relative">
            <p className="text-xs font-mono text-amber-400 uppercase tracking-widest animate-pulse">Drawing…</p>
            <div className="text-7xl animate-bounce">
              {choices[(revealStep + outcomeIdx) % choices.length].emoji}
            </div>
            <p className="text-[11px] text-muted-foreground">You picked {choices[picked!].emoji}</p>
          </div>
        )}

        {phase === "result" && outcomeIdx !== null && (
          <div className="space-y-3 relative">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-400">Result</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-[10px] font-mono text-muted-foreground">You</p>
                <div className="text-5xl">{choices[picked!].emoji}</div>
              </div>
              <span className="text-2xl font-display">vs</span>
              <div className="text-center">
                <p className="text-[10px] font-mono text-muted-foreground">House</p>
                <div className="text-5xl">{choices[outcomeIdx].emoji}</div>
              </div>
            </div>
            <p className={`font-display font-black text-2xl ${outcomeIdx === picked ? "text-emerald-400" : "text-rose-400"}`}>
              {outcomeIdx === picked ? `+${choices[picked!].payout} chips!` : "Better luck next time"}
            </p>
            <button onClick={reset} className="spring-btn px-6 py-2.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold">
              Play Again
            </button>
          </div>
        )}

        {chips < STAKE && phase === "pick" && (
          <p className="text-xs text-rose-400 relative">Not enough chips — grab free ones in the Chip Shop.</p>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-xl p-3 border border-border/40 bg-muted/10">
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Recent rounds</p>
          <ul className="text-sm space-y-1 font-mono">
            {history.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
