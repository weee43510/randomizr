import { useMemo, useState } from "react";
import { type ToolId, TOOLS } from "@/lib/toolMeta";
import { getToolUsage, trackToolUsage } from "@/lib/achievements";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Search, Star, Clock, Sparkles } from "lucide-react";

interface Props {
  onPick: (id: ToolId) => void;
}

export default function Dashboard({ onPick }: Props) {
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>(() => loadFromStorage("favorites", []));
  const usage = useMemo(() => getToolUsage(), []);

  const recent = TOOLS
    .map((t) => ({ ...t, count: usage[t.id] || 0 }))
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const filtered = TOOLS.filter((t) =>
    t.label.toLowerCase().includes(q.toLowerCase()) ||
    t.group.toLowerCase().includes(q.toLowerCase())
  );

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    setFavs(next);
    saveToStorage("favorites", next);
  };

  const pick = (id: ToolId) => {
    trackToolUsage(id);
    onPick(id);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-neon-cyan" />
          <span>Home</span>
        </div>
        <h1 className="font-display font-black text-5xl sm:text-6xl tracking-tight gradient-text leading-none">
          Pick your chaos.
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {TOOLS.length} tools, all in one place. Search, favorite, or grab one of your usuals.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools…"
          className="w-full pl-11 pr-4 py-3 rounded-xl glass-card text-sm font-medium outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Favorites */}
      {favs.length > 0 && q === "" && (
        <section className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" /> Favorites
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TOOLS.filter((t) => favs.includes(t.id)).map((t) => (
              <ToolTile key={t.id} t={t} onPick={pick} fav onFav={() => toggleFav(t.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      {recent.length > 0 && q === "" && (
        <section className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Recently used
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recent.map((t) => (
              <ToolTile key={t.id} t={t} onPick={pick} fav={favs.includes(t.id)} onFav={() => toggleFav(t.id)} count={t.count} />
            ))}
          </div>
        </section>
      )}

      {/* All grouped */}
      {(["Random","Party","Mini-Games","Tools"] as const).map((g) => {
        const inGroup = filtered.filter((t) => t.group === g);
        if (inGroup.length === 0) return null;
        return (
          <section key={g} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-display font-black text-2xl">{g}</h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {inGroup.length} {inGroup.length === 1 ? "tool" : "tools"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {inGroup.map((t) => (
                <ToolTile key={t.id} t={t} onPick={pick} fav={favs.includes(t.id)} onFav={() => toggleFav(t.id)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ToolTile({
  t, onPick, fav, onFav, count,
}: {
  t: typeof TOOLS[number];
  onPick: (id: ToolId) => void;
  fav?: boolean;
  onFav: () => void;
  count?: number;
}) {
  const Icon = t.icon;
  return (
    <div className="tilt-card group relative">
      <button
        onClick={() => onPick(t.id)}
        className="w-full glass-card glass-card-shimmer p-4 text-left space-y-3 spring-btn overflow-hidden relative"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{ background: `${t.color} / 0.15`, color: t.color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-tight">{t.label}</p>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">{t.group}</p>
        </div>
        {t.isNew && (
          <span className="absolute top-2 right-2 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-neon-pink/20 text-neon-pink border border-neon-pink/40 animate-pulse">
            NEW
          </span>
        )}
        {count !== undefined && (
          <span className="absolute bottom-2 right-2 text-[9px] font-mono text-muted-foreground">×{count}</span>
        )}
      </button>
      <button
        onClick={onFav}
        className="absolute top-2 left-2 p-1 rounded-full bg-background/60 spring-btn opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Favorite"
      >
        <Star className={`w-3.5 h-3.5 ${fav ? "fill-neon-pink text-neon-pink" : "text-muted-foreground"}`} />
      </button>
    </div>
  );
}
