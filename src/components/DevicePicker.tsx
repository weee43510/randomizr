import { useState, useRef } from "react";
import { Monitor, Tablet, Smartphone, Sparkles, ArrowRight, Rocket } from "lucide-react";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { APP_VERSION } from "@/lib/version";

export type DeviceType = "desktop" | "tablet" | "mobile";

const devices = [
  { id: "desktop" as DeviceType, label: "Desktop", icon: Monitor, desc: "Full sidebar, keyboard shortcuts, max screen room.", accent: "hsl(var(--neon-cyan))", accentRaw: "0,240,255", tag: "RECOMMENDED", emoji: "💻" },
  { id: "tablet" as DeviceType, label: "Tablet", icon: Tablet, desc: "Compact icon-only sidebar, touch-tuned layout.", accent: "hsl(var(--neon-violet))", accentRaw: "168,85,247", tag: "BALANCED", emoji: "📱", },
  { id: "mobile" as DeviceType, label: "Mobile", icon: Smartphone, desc: "Top bar, hamburger menu, thumb-reachable.", accent: "hsl(var(--neon-pink))", accentRaw: "255,0,234", tag: "ON-THE-GO", emoji: "📲", },
];

export function getStoredDevice(): DeviceType | null {
  return loadFromStorage<DeviceType | null>("device_type", null);
}

interface Props {
  onSelect: (device: DeviceType) => void;
}

export default function DevicePicker({ onSelect }: Props) {
  // Welcome step → device step
  const [step, setStep] = useState<"welcome" | "device">(() => {
    const seen = loadFromStorage<boolean>("welcome_seen", false);
    return seen ? "device" : "welcome";
  });
  const [tilt, setTilt] = useState<Record<DeviceType, { x: number; y: number }>>({
    desktop: { x: 0, y: 0 }, tablet: { x: 0, y: 0 }, mobile: { x: 0, y: 0 },
  });

  const beginFromWelcome = () => {
    saveToStorage("welcome_seen", true);
    setStep("device");
  };

  const handleSelect = (device: DeviceType) => {
    saveToStorage("device_type", device);
    saveToStorage("welcome_seen", true);
    onSelect(device);
  };

  const onMove = (id: DeviceType, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt((t) => ({ ...t, [id]: { x, y } }));
  };
  const onLeave = (id: DeviceType) => setTilt((t) => ({ ...t, [id]: { x: 0, y: 0 } }));

  return (
    <div className="gradient-bg-animated min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan)) 0%, transparent 70%)" }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none animate-float"
        style={{ background: "radial-gradient(circle, hsl(var(--neon-pink)) 0%, transparent 70%)", animationDelay: "1.5s" }} />

      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        {step === "welcome" ? (
          <div className="text-center space-y-8 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="w-3 h-3 text-neon-cyan" />
              <span>v{APP_VERSION} · WELCOME</span>
            </div>
            <h1 className="font-display font-black text-7xl sm:text-8xl tracking-tighter gradient-text leading-[0.9]">
              Welcome to<br />Randomizr
            </h1>
            <p className="text-base sm:text-lg text-foreground/80 font-light leading-relaxed">
              24+ tools, mini-games, and party-starters in one place. Built for groups, classrooms, and anyone who needs to pick something — fast.
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-muted-foreground">
              <span>★ No signup</span>
              <span>★ 100% local</span>
              <span>★ Works offline</span>
            </div>
            <button
              onClick={beginFromWelcome}
              className="spring-btn inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary/20 border-2 border-primary/40 text-primary font-display font-black text-lg tracking-wide neon-glow-cyan hover:bg-primary/30"
            >
              <Rocket className="w-5 h-5" /> BEGIN
            </button>
            <p className="text-[10px] font-mono text-muted-foreground">
              website by <span className="text-foreground">Elias</span>
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <header className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="w-3 h-3 text-neon-cyan" />
                <span>STEP 2 · PICK YOUR DEVICE</span>
              </div>
              <h2 className="font-display font-black text-5xl sm:text-6xl tracking-tighter gradient-text leading-tight">
                What are you on?
              </h2>
              <p className="text-sm text-foreground/70 max-w-md mx-auto">
                We'll tune the layout for the best vibe. Same tools either way — you can switch later in Settings.
              </p>
            </header>

            <div className="grid sm:grid-cols-3 gap-4">
              {devices.map((d) => {
                const Icon = d.icon;
                const t = tilt[d.id];
                return (
                  <div
                    key={d.id}
                    onMouseMove={(e) => onMove(d.id, e)}
                    onMouseLeave={() => onLeave(d.id)}
                    className="tilt-card group"
                    style={{ transform: `perspective(1000px) rotateX(${t.y}deg) rotateY(${t.x}deg)` }}
                  >
                    <button
                      onClick={() => handleSelect(d.id)}
                      className="w-full glass-card relative p-6 text-left flex flex-col gap-4 overflow-hidden border-2 border-transparent hover:border-white/20 transition-all"
                      style={{ boxShadow: `0 20px 60px -15px rgba(${d.accentRaw}, 0.30), inset 0 1px 0 rgba(255,255,255,0.06)` }}
                    >
                      <span
                        className="absolute -top-2 -right-2 text-[9px] font-mono font-bold uppercase px-2 py-1 rounded-md tracking-wider rotate-6 shadow-lg"
                        style={{ background: d.accent, color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                      >
                        {d.tag}
                      </span>
                      <div className="flex items-start justify-between">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3"
                          style={{ background: `rgba(${d.accentRaw}, 0.18)`, border: `1px solid rgba(${d.accentRaw}, 0.3)` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: d.accent }} />
                        </div>
                        <span className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">{d.emoji}</span>
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-display font-black text-2xl tracking-tight">{d.label}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.3em] mt-auto opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ color: d.accent }}
                      >
                        Pick this <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[10px] font-mono text-muted-foreground">
              website by <span className="text-foreground">Elias</span> · v{APP_VERSION}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
