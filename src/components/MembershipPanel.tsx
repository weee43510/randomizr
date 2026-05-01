import { useEffect, useState } from "react";
import { Crown, Lock, Check, Gift, Sparkles, Star } from "lucide-react";
import {
  TIERS, type MemberTier, getMemberState, highestTier, tierLevel, tierProgressInLevel,
  getPassRewards, getClaimedPassLevels, claimPassReward, addTierXP, checkTierUnlocks, getStats
} from "@/lib/casino";
import { celebrate } from "@/lib/confetti";
import { toast } from "sonner";

export default function MembershipPanel() {
  const [, setTick] = useState(0);
  const [tab, setTab] = useState<MemberTier>("basic");

  useEffect(() => {
    const id = setInterval(() => {
      const newly = checkTierUnlocks();
      if (newly.length) {
        const last = newly[newly.length - 1];
        const tdef = TIERS.find((t) => t.id === last)!;
        toast.success(`🎉 ${tdef.emoji} ${tdef.label} unlocked! +50 chips bonus`);
        celebrate("big");
      }
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const top = highestTier();
  const state = getMemberState();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-2xl p-5 border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-black/40 to-amber-950/30">
        <div className="flex items-center gap-3 flex-wrap">
          <Crown className="w-10 h-10 text-amber-400" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-300">Casino Membership</p>
            <p className="font-display font-black text-2xl">
              {top === "none" ? "Not a member yet" : `${TIERS.find((t) => t.id === top)?.emoji} ${TIERS.find((t) => t.id === top)?.label}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Lifetime chips earned: <span className="text-amber-300 font-bold">{getStats().totalChipsEarned}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tier ladder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIERS.map((t) => {
          const unlocked = state.unlocked.includes(t.id);
          const check = t.unlockCheck();
          const pct = Math.min(100, Math.round((check.progress / check.target) * 100));
          return (
            <div key={t.id} className={`rounded-xl p-4 border-2 space-y-2 ${
              unlocked ? "border-amber-400/60 bg-amber-500/10" : "border-border/40 bg-muted/10"
            }`}>
              <div className="flex items-start justify-between">
                <span className="text-3xl">{t.emoji}</span>
                {unlocked
                  ? <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"><Check className="w-2.5 h-2.5" /> ACTIVE</span>
                  : <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted/30 text-muted-foreground border border-border/40 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> LOCKED</span>
                }
              </div>
              <p className="font-display font-bold text-sm">{t.label}</p>
              <p className="text-[11px] text-muted-foreground">{t.description}</p>
              <p className="text-[10px] font-mono text-amber-400">{t.passLevels}-level pass</p>
              {!unlocked && (
                <div className="space-y-1 pt-1 border-t border-border/30">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">{check.hint}</span>
                    <span className="text-amber-300">{check.progress} / {check.target}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pass tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-muted/30 w-fit border border-border/40">
        {TIERS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`spring-btn px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider ${
            tab === t.id ? "bg-amber-500/20 text-amber-300" : "text-muted-foreground"
          }`}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <PassTab tier={tab} />

      <div className="rounded-xl p-3 border border-border/40 bg-muted/10 flex items-center justify-between gap-2 flex-wrap">
        <p className="text-[11px] text-muted-foreground">
          ✨ Tip: every game you play awards XP to your highest unlocked pass.
        </p>
        <button
          onClick={() => { addTierXP(50); toast.success("+50 XP (debug helper)"); setTick((t) => t + 1); }}
          className="spring-btn text-[10px] font-mono px-2 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40"
        >
          +50 XP (test)
        </button>
      </div>
    </div>
  );
}

function PassTab({ tier }: { tier: MemberTier }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const tdef = TIERS.find((t) => t.id === tier)!;
  const unlocked = getMemberState().unlocked.includes(tier);
  const lvl = tierLevel(tier);
  const prog = tierProgressInLevel(tier);
  const rewards = getPassRewards(tier);
  const claimed = getClaimedPassLevels(tier);

  if (!unlocked) {
    const c = tdef.unlockCheck();
    return (
      <div className="glass-card p-5 text-center space-y-2">
        <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
        <p className="text-sm font-bold">{tdef.label} pass is locked</p>
        <p className="text-xs text-muted-foreground">{c.hint} ({c.progress} / {c.target})</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-black/40 to-amber-950/30">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-300">{tdef.label} Pass</p>
            <p className="font-display font-black text-xl">Level {lvl} / {tdef.passLevels}</p>
          </div>
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-muted-foreground">XP this level</span>
            <span className="text-amber-300">{prog.current} / {prog.needed}</span>
          </div>
          <div className="h-2 rounded-full bg-background/60 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: `${prog.pct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {rewards.map((r) => {
          const isClaimed = claimed.includes(r.level);
          const reachable = lvl >= r.level;
          return (
            <button
              key={r.level}
              disabled={!reachable || isClaimed}
              onClick={() => {
                const res = claimPassReward(tier, r.level);
                if (res.ok) {
                  toast.success(`🎁 Claimed ${r.label}`);
                  celebrate("medium");
                  setTick((t) => t + 1);
                } else toast.error(res.reason || "Couldn't claim");
              }}
              className={`rounded-lg p-2.5 border-2 text-left space-y-1 transition ${
                isClaimed ? "border-emerald-500/40 bg-emerald-500/10"
                : reachable ? "border-amber-500/50 bg-amber-500/10 hover:scale-[1.02] cursor-pointer"
                : "border-border/30 bg-muted/10 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Lv {r.level}</span>
                {isClaimed ? <Check className="w-3 h-3 text-emerald-400" />
                  : reachable ? <Gift className="w-3 h-3 text-amber-400" />
                  : <Lock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <p className="text-xl">{r.emoji}</p>
              <p className="text-[10px] font-bold leading-tight">{r.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
