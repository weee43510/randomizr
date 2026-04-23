import { useState } from "react";
import type { Season, SeasonExclusiveGame } from "@/lib/seasons";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";

interface Props {
  game: SeasonExclusiveGame;
  season: Season;
}

/** Generic playable shell for season exclusives that don't have a custom screen yet.
 * It's a quick "press your luck" mini-game themed to the season. */
export default function GenericSeasonGame({ game, season }: Props) {
  const [chips, setChips] = useState(100);
  const [history, setHistory] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const play = () => {
    if (busy || chips < 5) return;
    setBusy(true);
    setChips((c) => c - 5);
    sounds.click();
    const roll = Math.random();
    setTimeout(() => {
      let line: string;
      if (roll > 0.92) {
        const win = 50;
        setChips((c) => c + win);
        line = `💥 BIG WIN +${win}`;
        celebrate("medium");
        sounds.win();
      } else if (roll > 0.55) {
        const win = 12;
        setChips((c) => c + win);
        line = `✅ Win +${win}`;
        sounds.win();
      } else {
        line = `❌ Loss −5`;
      }
      setHistory((h) => [line, ...h].slice(0, 8));
      setBusy(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">{season.name} · Exclusive</p>
          <h1 className="font-display font-black text-4xl">{game.emoji} {game.label}</h1>
          <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
        </div>
        <div className="glass-card px-4 py-2 text-right">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Chips</p>
          <p className="text-2xl font-display font-black text-amber-400">💰 {chips}</p>
        </div>
      </div>

      <div className="glass-card p-8 text-center space-y-4">
        <div className="text-7xl">{game.emoji}</div>
        <p className="text-xs text-muted-foreground italic max-w-md mx-auto">
          A taste of {game.label}. Press to play — costs 5 chips. Win up to 50.
          A deeper version is brewing.
        </p>
        <button
          onClick={play}
          disabled={busy || chips < 5}
          className="spring-btn px-8 py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-lg disabled:opacity-50"
        >
          {busy ? "…" : "Play · 5 chips"}
        </button>
      </div>

      {history.length > 0 && (
        <div className="glass-card p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Recent rolls</p>
          <ul className="text-sm space-y-1 font-mono">
            {history.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
