import { useState, useEffect } from "react";
import { ShoppingBag, Check, Lock, Coins, Gift, Clock } from "lucide-react";
import {
  SHOP_ITEMS, getOwned, buy, getChips, isMember, getEquipped, equip,
  claimFreeChips, freeChipsCooldownLeft, dailyBonusAvailable, claimDailyBonus
} from "@/lib/casino";
import { CasinoHeader, DailyEventBanner } from "./_shared";
import { toast } from "sonner";
import { celebrate } from "@/lib/confetti";

const CATEGORIES = [
  { id: "theme",  label: "🎨 Themes" },
  { id: "fx",     label: "✨ Effects" },
  { id: "sound",  label: "🎙️ Sound" },
  { id: "ui",     label: "🪙 UI Skins" },
] as const;

function fmtCooldown(ms: number) {
  if (ms <= 0) return "ready";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export default function ChipShop() {
  const [chips, setChipsState] = useState(getChips());
  const [owned, setOwned] = useState<string[]>(getOwned());
  const [equipped, setEquipped] = useState(getEquipped());
  const [cat, setCat] = useState<typeof CATEGORIES[number]["id"]>("theme");
  const [cooldown, setCooldown] = useState(freeChipsCooldownLeft());
  const member = isMember();

  useEffect(() => {
    const id = setInterval(() => {
      setChipsState(getChips());
      setOwned(getOwned());
      setEquipped(getEquipped());
      setCooldown(freeChipsCooldownLeft());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleBuy = (id: string, label: string, cost: number) => {
    const r = buy(id);
    if (r.ok) {
      toast.success(`✅ Purchased ${label} for ${cost} chips · view in Settings → Inventory`);
      celebrate("medium");
      setChipsState(getChips());
      setOwned(getOwned());
    } else {
      toast.error(r.reason || "Couldn't buy");
    }
  };

  const handleEquip = (id: string, label: string) => {
    if (equip(id)) {
      toast.success(`🎽 Equipped ${label}`);
      setEquipped(getEquipped());
    }
  };

  const handleFreeChips = () => {
    const r = claimFreeChips();
    if (r.ok) { toast.success(`🎁 +${r.amount} free chips!`); celebrate("medium"); setChipsState(getChips()); setCooldown(freeChipsCooldownLeft()); }
    else toast.error(`⏳ Wait ${fmtCooldown(r.waitMs || 0)}`);
  };

  const handleDailyBonus = () => {
    const r = claimDailyBonus();
    if (r.ok) { toast.success(`🎉 Daily bonus: +${r.amount} chips!`); celebrate("big"); setChipsState(getChips()); }
    else toast.error("Already claimed today — come back tomorrow.");
  };

  const items = SHOP_ITEMS.filter((i) => i.category === cat);
  const dailyReady = dailyBonusAvailable();
  const freeReady = cooldown <= 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <CasinoHeader title="Chip Shop" subtitle="Casino · Cosmetics" emoji="🛍️" chips={chips} />
      <DailyEventBanner />

      {/* CHIP RECOVERY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDailyBonus}
          disabled={!dailyReady}
          className={`rounded-xl p-4 border-2 text-left spring-btn ${
            dailyReady ? "border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 to-black/40 hover:scale-[1.01]" : "border-border/30 bg-muted/10 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className={`w-5 h-5 ${dailyReady ? "text-emerald-300" : "text-muted-foreground"}`} />
            <p className="font-display font-bold text-sm">Daily Bonus</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{dailyReady ? "+50 chips waiting for you" : "Already claimed today"}</p>
        </button>

        <button
          onClick={handleFreeChips}
          disabled={!freeReady}
          className={`rounded-xl p-4 border-2 text-left spring-btn ${
            freeReady ? "border-amber-500/50 bg-gradient-to-br from-amber-950/40 to-black/40 hover:scale-[1.01]" : "border-border/30 bg-muted/10 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2">
            <Coins className={`w-5 h-5 ${freeReady ? "text-amber-300" : "text-muted-foreground"}`} />
            <p className="font-display font-bold text-sm">Free Chips</p>
            {!freeReady && <span className="ml-auto text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtCooldown(cooldown)}</span>}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{freeReady ? "+25 chips · 7 min cooldown" : "On cooldown"}</p>
        </button>
      </div>

      {member && (
        <div className="rounded-xl px-4 py-2.5 border border-amber-400/50 bg-gradient-to-r from-amber-500/15 to-amber-700/15">
          <p className="text-xs font-mono uppercase tracking-widest text-amber-300 flex items-center gap-2">
            🎟️ Casino Membership · Active
          </p>
          <p className="text-[11px] text-muted-foreground">Cosmetic perks unlocked. Manage inventory in Settings → Inventory.</p>
        </div>
      )}

      <div className="flex gap-1 p-1 rounded-lg bg-muted/30 w-fit border border-border/40">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`spring-btn px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider ${
            cat === c.id ? "bg-amber-500/20 text-amber-300" : "text-muted-foreground"
          }`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const isOwn = owned.includes(item.id);
          const isEq = equipped[item.category] === item.id;
          const canAfford = chips >= item.cost;
          return (
            <div key={item.id} className={`rounded-xl p-4 border-2 space-y-2 ${
              isEq ? "border-emerald-500/60 bg-emerald-500/10"
              : isOwn ? "border-amber-500/40 bg-amber-500/5"
              : canAfford ? "border-amber-500/40 bg-gradient-to-br from-black/40 to-amber-950/20"
              : "border-border/30 bg-muted/10 opacity-80"
            }`}>
              <div className="flex items-start justify-between">
                <span className="text-3xl">{item.emoji}</span>
                {isEq ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> EQUIPPED
                  </span>
                ) : isOwn ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    OWNED
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-400">💰 {item.cost}</span>
                )}
              </div>
              <p className="font-display font-bold text-sm">{item.label}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.description}</p>

              {!isOwn && (
                <button
                  onClick={() => handleBuy(item.id, item.label, item.cost)}
                  disabled={!canAfford}
                  className="w-full spring-btn text-xs px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  {canAfford ? <ShoppingBag className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {canAfford ? `Buy · ${item.cost}` : `Need ${item.cost - chips} more`}
                </button>
              )}
              {isOwn && !isEq && (
                <button
                  onClick={() => handleEquip(item.id, item.label)}
                  className="w-full spring-btn text-xs px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/50 text-emerald-300 font-bold"
                >
                  Equip
                </button>
              )}
              {isEq && (
                <p className="text-[10px] font-mono text-emerald-400 text-center">✓ Active</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
