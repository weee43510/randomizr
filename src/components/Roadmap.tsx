import { useState } from "react";
import { ROADMAP, ROADMAP_V2 } from "@/lib/version";

const STATUS_STYLES: Record<string, { dot: string; ring: string; label: string }> = {
  shipped: { dot: "bg-neon-green", ring: "ring-neon-green/40", label: "SHIPPED" },
  next:    { dot: "bg-neon-cyan animate-pulse", ring: "ring-neon-cyan/50", label: "NEXT UP" },
  planned: { dot: "bg-muted-foreground/40", ring: "ring-border/40", label: "PLANNED" },
};

export default function Roadmap() {
  const [version, setVersion] = useState<"v1" | "v2">("v1");
  const stops = version === "v1" ? ROADMAP : ROADMAP_V2;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">30-Day Roadmap</p>
          <div className="flex gap-1">
            {(["v1", "v2"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`spring-btn text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                  version === v ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "v1" ? "v1 · Solo" : "v2 · Multiplayer"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground">{stops.length} stops · scroll →</p>
      </div>
      <div className="relative overflow-x-auto pb-4 -mx-2 px-2">
        {/* Connecting line */}
        <div
          className="absolute top-[42px] left-2 right-2 h-px"
          style={{
            background: "linear-gradient(90deg, hsl(var(--neon-green)) 0%, hsl(var(--neon-cyan)) 15%, hsla(var(--border)) 30%)",
          }}
        />
        <div className="flex gap-3 min-w-max relative">
          {ROADMAP.map((stop) => {
            const s = STATUS_STYLES[stop.status];
            return (
              <div key={stop.day} className="w-44 shrink-0 flex flex-col items-center text-center">
                <span className="text-[10px] font-mono text-muted-foreground mb-1">Day {stop.day}</span>
                <div className={`w-5 h-5 rounded-full ${s.dot} ring-4 ${s.ring} mb-3 z-10`} />
                <div className="glass-card p-3 w-full space-y-1">
                  <div className="text-2xl">{stop.icon}</div>
                  <p className="text-xs font-display font-bold text-foreground leading-tight">{stop.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{stop.detail}</p>
                  <p className={`text-[9px] font-mono uppercase tracking-widest mt-1 ${
                    stop.status === "shipped" ? "text-neon-green"
                    : stop.status === "next" ? "text-neon-cyan"
                    : "text-muted-foreground"
                  }`}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
