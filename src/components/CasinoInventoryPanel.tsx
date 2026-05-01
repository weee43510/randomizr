import { useEffect, useState } from "react";
import { Package, Check, Coins, Square } from "lucide-react";
import { SHOP_ITEMS, getOwned, getEquipped, equip, unequip, sellBack, getChips } from "@/lib/casino";
import { toast } from "sonner";

const CATEGORY_LABELS = {
  theme: "🎨 Themes",
  fx: "✨ Effects",
  sound: "🎙️ Sound",
  ui: "🪙 UI Skins",
} as const;

export default function CasinoInventoryPanel() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  const owned = getOwned();
  const equipped = getEquipped();
  const chips = getChips();

  const ownedItems = SHOP_ITEMS.filter((i) => owned.includes(i.id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Casino Inventory
          </p>
          <p className="text-sm">
            {ownedItems.length} items owned · <span className="text-amber-400 font-mono"><Coins className="inline w-3 h-3" /> {chips}</span>
          </p>
        </div>
      </div>

      {ownedItems.length === 0 && (
        <div className="glass-card p-6 text-center space-y-2">
          <Square className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-bold">Inventory empty</p>
          <p className="text-xs text-muted-foreground">Visit the Chip Shop to buy themes, FX, sounds, and UI skins.</p>
        </div>
      )}

      {(["theme", "fx", "sound", "ui"] as const).map((cat) => {
        const items = ownedItems.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{CATEGORY_LABELS[cat]}</p>
              {equipped[cat] && (
                <button onClick={() => { unequip(cat); toast("Unequipped"); setTick((t) => t + 1); }} className="spring-btn text-[10px] font-mono text-muted-foreground hover:text-foreground">
                  Unequip
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((item) => {
                const isEq = equipped[cat] === item.id;
                return (
                  <div key={item.id} className={`rounded-xl p-3 border-2 space-y-2 ${
                    isEq ? "border-amber-400/60 bg-amber-500/10" : "border-border/40 bg-muted/10"
                  }`}>
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{item.emoji}</span>
                      {isEq && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> EQUIPPED
                        </span>
                      )}
                    </div>
                    <p className="font-display font-bold text-sm">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{item.description}</p>
                    <div className="flex gap-1.5">
                      <button
                        disabled={isEq}
                        onClick={() => { if (equip(item.id)) toast.success(`✅ Equipped ${item.label}`); setTick((t) => t + 1); }}
                        className="flex-1 spring-btn text-[11px] px-2 py-1.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 disabled:opacity-40 font-bold"
                      >
                        {isEq ? "Equipped" : "Equip"}
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm(`Sell ${item.label} for ${Math.floor(item.cost * 0.9)} chips?`)) return;
                          const r = sellBack(item.id);
                          if (r.ok) toast.success(`💰 Sold for ${r.refund} chips`);
                          setTick((t) => t + 1);
                        }}
                        className="spring-btn text-[11px] px-2 py-1.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/40"
                      >
                        Sell · {Math.floor(item.cost * 0.9)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
