import { useEffect, useState } from "react";
import { Calendar, Lock, Sparkles, Trophy, Check, ChevronRight } from "lucide-react";
import {
  getCurrentSeason,
  isSeasonActive,
  isExclusiveUnlocked,
  getUnlockStatus,
  checkUnlocks,
  type SeasonExclusiveGame,
  type UnlockStatus,
} from "@/lib/seasons";
import { TOOLS, type ToolId } from "@/lib/toolMeta";
import { getChips, getStats, isMember, getActiveEvent } from "@/lib/casino";
import { toast } from "sonner";

interface Props {
  onPickMain: (id: ToolId) => void;
  onPickExclusive: (gameId: string) => void;
}

export default function SeasonHub({ onPickMain, onPickExclusive }: Props) {
  const [info, setInfo] = useState(() => getCurrentSeason());
  const [tick, setTick] = useState(0);
  const [chips, setChips] = useState(getChips());

  useEffect(() => {
    const id = setInterval(() => {
      const newly = checkUnlocks();
      newly.forEach((id) => {
        const g = info?.season.exclusiveGames.find((x) => x.id === id);
        if (g) toast.success(`🔓 Unlocked: ${g.emoji} ${g.label} — yours forever`);
      });
      setInfo(getCurrentSeason());
      setChips(getChips());
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!info) return <p className="text-sm text-muted-foreground">No season running.</p>;
  const { season, daysLeft, daysIn } = info;
  const active = isSeasonActive(season.id);
  const event = getActiveEvent(daysIn);

  const unlockedCount = season.exclusiveGames.filter((g) => isExclusiveUnlocked(season.id, g.id)).length;
  const progress = (unlockedCount / season.exclusiveGames.length) * 100;

  const coreTools = season.coreToolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as typeof TOOLS;

  const stats = getStats();
  const member = isMember();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Cinematic Banner ── */}
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
            <div className="rounded-lg px-3 py-1.5 mt-1 bg-black/40 border border-amber-500/40">
              <p className="text-[10px] font-mono text-amber-400">💰 {chips} chips</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-amber-300">Exclusive unlocks (yours forever)</span>
            <span className="text-amber-300">{unlockedCount} / {season.exclusiveGames.length}</span>
          </div>
          <div className="h-2 rounded-full bg-background/60 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* ── Daily Event Banner ── */}
      <div className="rounded-xl p-4 border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-black/40 to-amber-950/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{event.emoji}</span>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Today · Day {daysIn + 1} · {event.name}</p>
            <p className="text-xs text-muted-foreground">{event.description}</p>
          </div>
        </div>
        {event.winMultiplier > 1 && (
          <span className="text-sm font-mono px-3 py-1.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold">
            ×{event.winMultiplier} payouts
          </span>
        )}
      </div>

      {/* ── Casino Stats Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatPill label="Games played" value={stats.gamesPlayed} />
        <StatPill label="Games won" value={stats.gamesWon} />
        <StatPill label="Chips earned" value={stats.totalChipsEarned} />
        <StatPill label="Membership" value={member ? "🎟️ ACTIVE" : "Locked"} highlight={member} />
      </div>

      {!active && (
        <div className="glass-card p-4 border-rose-500/40 border">
          <p className="text-sm font-bold text-rose-300">⏳ Season ended</p>
          <p className="text-xs text-muted-foreground">You can still play anything you've already unlocked — those are yours forever.</p>
        </div>
      )}

      {/* ── 🎰 Core Hub (always 5 permanent core games) ── */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-display font-bold text-2xl">🎰 The Casino · Core Hub</h3>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">5 permanent original games</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {coreTools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onPickMain(t.id)}
                className="rounded-xl p-4 spring-btn text-left space-y-2 border border-amber-500/30 bg-gradient-to-br from-black/50 to-amber-950/20 hover:border-amber-400 hover:from-amber-950/30 transition"
              >
                <Icon className="w-7 h-7" style={{ color: t.color }} />
                <p className="font-display font-bold text-sm">{t.label}</p>
                <p className="text-[10px] font-mono uppercase text-amber-400/80">Core</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 🎁 Seasonal Exclusives with Unlock Status Panels ── */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-display font-bold text-2xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> 🎁 Seasonal Exclusives
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            unlock once · keep forever
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {season.exclusiveGames.map((g) => {
            const status = getUnlockStatus(season.id, g.id);
            if (!status) return null;
            return (
              <ExclusiveTile
                key={g.id}
                game={g}
                status={status}
                seasonActive={active}
                onClick={() => status.unlocked && onPickExclusive(g.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg px-3 py-2 border ${
      highlight ? "border-amber-500/50 bg-amber-500/10" : "border-border/40 bg-muted/20"
    }`}>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-base font-display font-black ${highlight ? "text-amber-300" : ""}`}>{value}</p>
    </div>
  );
}

function ExclusiveTile({ game, status, seasonActive, onClick }: {
  game: SeasonExclusiveGame;
  status: UnlockStatus;
  seasonActive: boolean;
  onClick: () => void;
}) {
  const { unlocked, permanent, progress, target, pct, badge, task } = status;

  const badgeMeta = {
    "just-started": { text: "🔵 Just started", cls: "bg-blue-500/15 text-blue-300 border-blue-500/40" },
    "close":        { text: "🟡 Getting there", cls: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40" },
    "almost":       { text: "🔥 Almost there", cls: "bg-orange-500/15 text-orange-300 border-orange-500/40" },
    "ready":        { text: "✨ Ready to claim", cls: "bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse" },
    "done":         { text: permanent ? "✅ Permanent" : "✅ Unlocked", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
    "missed":       { text: "💀 Missed", cls: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
  }[badge];

  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={`text-left space-y-3 spring-btn rounded-xl p-4 border-2 transition ${
        unlocked
          ? "border-amber-500/50 bg-gradient-to-br from-amber-950/20 to-black/40 hover:border-amber-400"
          : badge === "missed"
            ? "border-rose-500/30 bg-muted/10 opacity-70"
            : "border-border/30 bg-muted/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl">{unlocked ? game.emoji : "🔒"}</span>
        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${badgeMeta.cls}`}>
          {badgeMeta.text}
        </span>
      </div>

      <div>
        <p className="font-display font-bold text-sm">{game.label}</p>
        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
          {unlocked ? game.description : game.lockReason}
        </p>
      </div>

      {!unlocked && (
        <div className="space-y-2 pt-1 border-t border-border/30">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-muted-foreground flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> {task.label}
              </span>
              <span className="text-amber-400">{progress} / {target}</span>
            </div>
            <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {seasonActive && (
            <p className="text-[10px] text-amber-300/80 flex items-center gap-1">
              <ChevronRight className="w-3 h-3" /> Next: {task.hint}
            </p>
          )}
        </div>
      )}

      {unlocked && (
        <div className="pt-1 border-t border-border/30 flex items-center justify-between text-[10px] font-mono">
          <span className="text-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Tap to play</span>
          {permanent && <span className="text-amber-300">Yours forever</span>}
        </div>
      )}
    </button>
  );
}
