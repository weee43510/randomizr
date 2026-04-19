import { useState } from "react";
import { Monitor, Tablet, Smartphone, Sparkles, ArrowRight } from "lucide-react";
import { saveToStorage, loadFromStorage } from "@/lib/storage";

export type DeviceType = "desktop" | "tablet" | "mobile";

const devices = [
  {
    id: "desktop" as DeviceType,
    label: "Desktop",
    icon: Monitor,
    desc: "Full sidebar, max screen real-estate",
    accent: "hsl(var(--neon-cyan))",
  },
  {
    id: "tablet" as DeviceType,
    label: "Tablet",
    icon: Tablet,
    desc: "Compact icon-only sidebar",
    accent: "hsl(var(--neon-violet))",
  },
  {
    id: "mobile" as DeviceType,
    label: "Mobile",
    icon: Smartphone,
    desc: "Top bar with hamburger menu",
    accent: "hsl(var(--neon-pink))",
  },
];

export function getStoredDevice(): DeviceType | null {
  return loadFromStorage<DeviceType | null>("device_type", null);
}

interface Props {
  onSelect: (device: DeviceType) => void;
}

export default function DevicePicker({ onSelect }: Props) {
  const [hovered, setHovered] = useState<DeviceType | null>(null);

  const handleSelect = (device: DeviceType) => {
    saveToStorage("device_type", device);
    onSelect(device);
  };

  return (
    <div className="gradient-bg-animated min-h-screen flex items-center justify-center p-6 relative">
      {/* floating orbs for vibe */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan)) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-pink)) 0%, transparent 70%)", animationDelay: "1.5s" }}
      />

      <div className="relative z-10 w-full max-w-3xl space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
            <Sparkles className="w-3 h-3 text-neon-cyan" />
            <span>v3.2 · Welcome</span>
          </div>
          <h1 className="font-display font-black text-6xl sm:text-7xl tracking-tight gradient-text leading-none">
            Randomizr
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Quick question — what are you on? We'll tune the layout for the best vibe.
            Only the menu changes; the tools stay identical.
          </p>
        </div>

        {/* Device cards */}
        <div className="grid sm:grid-cols-3 gap-3">
          {devices.map((d) => {
            const Icon = d.icon;
            const isHovered = hovered === d.id;
            return (
              <button
                key={d.id}
                onMouseEnter={() => setHovered(d.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSelect(d.id)}
                className="spring-btn glass-card glass-card-shimmer relative p-6 text-left flex flex-col gap-4 group overflow-hidden"
                style={{
                  borderColor: isHovered ? `${d.accent} / 0.4` : undefined,
                  boxShadow: isHovered ? `0 0 24px ${d.accent.replace(")", " / 0.25)")}` : undefined,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${d.accent.replace(")", " / 0.15)")}` }}
                >
                  <Icon className="w-6 h-6" style={{ color: d.accent }} />
                </div>
                <div className="space-y-1">
                  <p className="font-display font-bold text-lg">{d.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
                <div
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] mt-auto opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ color: d.accent }}
                >
                  Pick this <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          To change later, reset all data in Settings
        </p>
      </div>
    </div>
  );
}
