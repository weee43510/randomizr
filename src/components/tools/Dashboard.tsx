import { useEffect, useMemo, useState } from "react";
import { type ToolId, TOOLS } from "@/lib/toolMeta";
import { getToolUsage, trackToolUsage } from "@/lib/achievements";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Search, Star, Clock, Sparkles, Award, Flame, TrendingUp, Brain, Crown } from "lucide-react";
import { getGameOfTheWeek } from "@/lib/gameOfTheWeek";
import { getTrending, getHotNow, getMostReplayed } from "@/lib/discovery";
import { getCurrentSeason } from "@/lib/seasons";

interface Props { onPick: (id: ToolId) => void; }

export default function Dashboard({ onPick }: Props) {
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>(() => loadFromStorage("favorites", []));
  const [tick, setTick] = useState(0);
  const usage = useMemo(() => getToolUsage(), [tick]);
  const gotw = useMemo(() => getGameOfTheWeek(), []);
  const seasonInfo = useMemo(() => getCurrentSeason(), [tick]);

  // Re-evaluate discovery every 4s (cheap)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const trending = useMemo(() => getTrending(4), [tick]);
  const hotNow = useMemo(() => getHotNow(4), [tick]);
  const mostReplayed = useMemo(() => getMostReplayed(4), [tick]);

  const recent = TOOLS
    .map((t) => ({ ...t, count: usage[t.id] || 0 }))
    .filter((t) => t.count > 0 && t.id !== "dashboard")
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const filtered = TOOLS.filter((t) =>
    t.id !== "dashboard" && (
      t.label.toLowerCase().includes(q.toLowerCase()) ||
      t.group.toLowerCase().includes(q.toLowerCase())
    )
  );

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    setFavs(next);
    saveToStorage("favorites", next);
  };

  const pick = (id: ToolId) => { trackToolUsage(id); onPick(id); };

  const findTool = (id: ToolId) => TOOLS.find((t) => t.id === id);
  const GotwIcon = gotw.tool.icon;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <Sparkles className="w-3 h-3 text-neon-cyan" />
          <span>Home · v6.2</span>
        </div>
        <h1 className="font-display font-black text-5xl sm:text-6xl tracking-tight gradient-text leading-none">
          Pick a tool.
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {TOOLS.length - 1} tools, all in one place. Search, favorite, or grab one of your usuals.
        </p>
      </div>

      {/* Season banner */}
      {seasonInfo && (
        <button
          onClick={() => pick("season")}
          className="w-full text-left rounded-2xl p-5 spring-btn relative overflow-hidden border border-amber-500/40 group"
          style={{ background: seasonInfo.season.bannerGradient }}
        >
          <div className="flex items-center gap-4">
            <Crown className="w-12 h-12 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-300">Season 1 · Live now</p>
              <p className="font-display font-black text-2xl">{seasonInfo.season.emoji} {seasonInfo.season.name}</p>
              <p className="text-xs text-amber-200/80 italic">"{seasonInfo.season.tagline}" · {seasonInfo.daysLeft} days left</p>
            </div>
            <span className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">→</span>
          </div>
        </button>
      )}

      {/* Game of the Week */}
      {q === "" && (
        <button
          onClick={() => pick(gotw.tool.id)}
          className="w-full text-left glass-card-highlight p-5 rounded-2xl flex items-center gap-4 spring-btn group overflow-hidden relative"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform"
            style={{ background: `${gotw.tool.color} / 0.15`, color: gotw.tool.color, border: `1px solid ${gotw.tool.color}` }}
          >
            <GotwIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-neon-pink" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neon-pink">Game of the Week · #{gotw.week}</span>
            </div>
            <p className="font-display font-black text-2xl">{gotw.tool.label}</p>
            <p className="text-xs text-muted-foreground">Featured this week — give it a go!</p>
          </div>
          <span className="text-3xl opacity-40 group-hover:opacity-100 transition-opacity">🌟</span>
        </button>
      )}

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

      {/* Discovery sections — only when not searching */}
      {q === "" && (trending.length > 0 || hotNow.length > 0 || mostReplayed.length > 0) && (
        <section className="space-y-4">
          {hotNow.length > 0 && (
            <DiscoveryRow icon={<Flame className="w-3.5 h-3.5 text-orange-400" />} title="Hot right now" subtitle="last 24 hours">
              {hotNow.map(({ id }) => {
                const t = findTool(id);
                return t ? <ToolTile key={id} t={t} onPick={pick} fav={favs.includes(id)} onFav={() => toggleFav(id)} badge="🔥" /> : null;
              })}
            </DiscoveryRow>
          )}
          {trending.length > 0 && (
            <DiscoveryRow icon={<TrendingUp className="w-3.5 h-3.5 text-neon-pink" />} title="Trending" subtitle="this week">
              {trending.map(({ id }) => {
                const t = findTool(id);
                return t ? <ToolTile key={id} t={t} onPick={pick} fav={favs.includes(id)} onFav={() => toggleFav(id)} badge="📈" /> : null;
              })}
            </DiscoveryRow>
          )}
          {mostReplayed.length > 0 && (
            <DiscoveryRow icon={<Brain className="w-3.5 h-3.5 text-neon-violet" />} title="Most replayed" subtitle="you keep coming back">
              {mostReplayed.map(({ id, days }) => {
                const t = findTool(id);
                return t ? <ToolTile key={id} t={t} onPick={pick} fav={favs.includes(id)} onFav={() => toggleFav(id)} badge={`${days}d`} /> : null;
              })}
            </DiscoveryRow>
          )}
        </section>
      )}

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

      {(["Season","Random","Party","Mini-Games","Tools"] as const).map((g) => {
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

function DiscoveryRow({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          {icon} {title}
        </p>
        <span className="text-[9px] font-mono text-muted-foreground/70">· {subtitle}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{children}</div>
    </div>
  );
}

function ToolTile({
  t, onPick, fav, onFav, count, badge,
}: {
  t: typeof TOOLS[number];
  onPick: (id: ToolId) => void;
  fav?: boolean;
  onFav: () => void;
  count?: number;
  badge?: string;
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
        {!t.isNew && badge && (
          <span className="absolute top-2 right-2 text-[10px]">{badge}</span>
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
