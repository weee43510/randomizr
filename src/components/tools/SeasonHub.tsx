import { useEffect, useState } from "react";
import { Calendar, Lock, Sparkles, Trophy } from "lucide-react";
import { getCurrentSeason, getUnlockedSeasonGames, isSeasonActive, type Season, type SeasonExclusiveGame, checkAutoUnlocks } from "@/lib/seasons";
import { getToolUsage, getUnlocked } from "@/lib/achievements";
import { TOOLS, type ToolId } from "@/lib/toolMeta";

interface Props {
  onPickMain: (id: ToolId) => void;
  onPickExclusive: (gameId: string) => void;
}

export default function SeasonHub({ onPickMain, onPickExclusive }: Props) {
  const [info, setInfo] = useState(() => getCurrentSeason());
  const [unlocked, setUnlocked] = useState<string[]>(() => info ? getUnlockedSeasonGames(info.season.id) : []);

  useEffect(() => {
    const id = setInterval(() => {
      checkAutoUnlocks({ toolUsage: getToolUsage(), achievements: getUnlocked() });
      const i = getCurrentSeason();
      setInfo(i);
      if (i) setUnlocked(getUnlockedSeasonGames(i.season.id));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  if (!info) return <p className="text-sm text-muted-foreground">No season running.</p>;
  const { season, daysLeft, daysIn } = info;
  const active = isSeasonActive(season.id);
  const totalUnlocked = unlocked.length;
  const progress = (totalUnlocked / season.exclusiveGames.length) * 100;

  const mainTools = season.mainGames
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as typeof TOOLS;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden border border-amber-500/30" style={{ background: season.bannerGradient }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/50 border border-amber-500/40 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-300">
              <Sparkles className="w-3 h-3" /> Season 1 of ∞
            </div>
            <h2 className="font-display font-black text-4xl md:text-5xl">{season.emoji} {season.name}</h2>
            <p className="text-sm text-amber-200/80 italic">"{season.tagline}"</p>
          </div>
          <div className="text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300">
              <Calendar className="w-3.5 h-3.5" />
              {active ? `${daysLeft} days left` : "ENDED"}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground">Day {daysIn + 1} of {season.durationDays}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-amber-300">Exclusive unlocks</span>
            <span className="text-amber-300">{totalUnlocked} / {season.exclusiveGames.length}</span>
          </div>
          <div className="h-2 rounded-full bg-background/60 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {!active && (
        <div className="glass-card p-4 border-destructive/40">
          <p className="text-sm font-bold text-destructive">⏳ Season ended</p>
          <p className="text-xs text-muted-foreground">Locked games can't be unlocked anymore — they're gone for good.</p>
        </div>
      )}

      {/* Main games */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display font-bold text-2xl">Main lineup</h3>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">4 core games this season</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mainTools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onPickMain(t.id)}
                className="glass-card p-4 spring-btn text-left space-y-2 border border-amber-500/20"
              >
                <Icon className="w-7 h-7" style={{ color: t.color }} />
                <p className="font-display font-bold text-sm">{t.label}</p>
                <p className="text-[10px] font-mono uppercase text-amber-400">Featured</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Exclusive games */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display font-bold text-2xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Exclusive games
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            unlock during the season — or lose them forever
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {season.exclusiveGames.map((g) => (
            <ExclusiveTile
              key={g.id}
              game={g}
              unlocked={unlocked.includes(g.id)}
              seasonActive={active}
              onClick={() => unlocked.includes(g.id) && onPickExclusive(g.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ExclusiveTile({ game, unlocked, seasonActive, onClick }: {
  game: SeasonExclusiveGame;
  unlocked: boolean;
  seasonActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`glass-card p-4 text-left space-y-2 spring-btn border transition ${
        unlocked
          ? "border-amber-500/50 hover:border-amber-400"
          : "border-border/30 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{unlocked ? game.emoji : "🔒"}</span>
        {unlocked ? (
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            UNLOCKED
          </span>
        ) : (
          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
            seasonActive
              ? "bg-muted/30 text-muted-foreground border-border/40"
              : "bg-destructive/10 text-destructive border-destructive/40"
          }`}>
            {seasonActive ? "LOCKED" : "MISSED"}
          </span>
        )}
      </div>
      <p className="font-display font-bold text-sm">{game.label}</p>
      <p className="text-[11px] text-muted-foreground leading-snug">
        {unlocked ? game.description : <><Lock className="w-3 h-3 inline mr-1" />{game.unlockHint}</>}
      </p>
    </button>
  );
}
