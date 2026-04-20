import { Settings, Volume2, VolumeX, RotateCcw, Info, Palette, Check, Monitor, Tablet, Smartphone, Sparkles, KeyRound, Map } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { APP_VERSION, CHANGELOGS } from "@/lib/version";
import { THEMES, applyTheme, getStoredTheme, type ThemeId } from "@/lib/theme";
import type { DeviceType } from "@/components/DevicePicker";
import Roadmap from "@/components/Roadmap";
import SettingsMiniGame from "@/components/SettingsMiniGame";
import { isRainbowUnlocked, applyRainbowTheme, matrixRainOverlay, isDevMode, setDevMode } from "@/lib/easterEggs";
import { emojiRain } from "@/lib/confetti";
import { toast } from "sonner";

export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(() => loadFromStorage("sound_enabled", true));
  const toggle = (v: boolean) => { setEnabled(v); saveToStorage("sound_enabled", v); };
  return [enabled, toggle] as const;
}

interface Props {
  soundEnabled: boolean;
  onSoundToggle: (v: boolean) => void;
  deviceType: DeviceType;
  onDeviceChange: (d: DeviceType) => void;
}

const DEVICES: { id: DeviceType; label: string; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobile", icon: Smartphone },
];

function ThemeCard({ theme, active, onClick }: { theme: typeof THEMES[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`spring-btn relative rounded-xl p-3 text-left overflow-hidden border-2 transition-all ${
        active ? "border-primary/80 neon-glow-cyan" : "border-border/30 hover:border-border/60"
      }`}
      style={{
        background: `linear-gradient(135deg, hsl(${theme.vars["--gradient-a"]}), hsl(${theme.vars["--gradient-b"]}), hsl(${theme.vars["--gradient-c"]}))`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{theme.emoji}</span>
        {active && <Check className="w-4 h-4" style={{ color: `hsl(${theme.vars["--primary"]})` }} />}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm font-display font-bold" style={{ color: `hsl(${theme.vars["--foreground"]})` }}>
          {theme.label}
        </p>
        <p className="text-[10px] opacity-70" style={{ color: `hsl(${theme.vars["--foreground"]})` }}>
          {theme.description}
        </p>
      </div>
      <div className="mt-2 flex gap-1">
        {["--primary", "--secondary", "--accent"].map((v) => (
          <span key={v} className="w-3 h-3 rounded-full border border-white/20" style={{ background: `hsl(${theme.vars[v]})` }} />
        ))}
      </div>
    </button>
  );
}

export default function SettingsPanel({ soundEnabled, onSoundToggle, deviceType, onDeviceChange }: Props) {
  const [showChangelog, setShowChangelog] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);
  const [versionTaps, setVersionTaps] = useState(0);
  const [devMode, setDevModeState] = useState(isDevMode);
  const [rainbow, setRainbow] = useState(isRainbowUnlocked);
  const [matrixInput, setMatrixInput] = useState("");

  // Rainbow theme animation loop
  useEffect(() => {
    if (theme !== ("rainbow" as ThemeId)) return;
    let raf: number;
    const tick = () => { applyRainbowTheme(); raf = requestAnimationFrame(tick); };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  // Re-check rainbow unlock when reopening
  useEffect(() => {
    const id = setInterval(() => setRainbow(isRainbowUnlocked()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleResetData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("randomizr_") || k.startsWith("pickr_"));
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const handleThemeChange = (id: ThemeId) => { setTheme(id); applyTheme(id); };

  const handleVersionTap = () => {
    const next = versionTaps + 1;
    setVersionTaps(next);
    if (next === 7) {
      setDevMode(true);
      setDevModeState(true);
      toast.success("👨‍💻 DEV MODE unlocked!");
      emojiRain("⚡", 30);
    } else if (next > 2 && next < 7) {
      toast(`${7 - next} more taps…`);
    }
  };

  const handleMatrixTrigger = (val: string) => {
    setMatrixInput(val);
    if (val.toLowerCase().endsWith("matrix")) {
      matrixRainOverlay();
      setMatrixInput("");
      toast("🟢 Welcome to the Matrix");
    }
  };

  const visibleThemes = THEMES;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="spring-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40">
          <Settings className="w-5 h-5 shrink-0" />
          <span className="truncate">Settings</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="glass-card border-border/30 w-[92vw] sm:w-[480px] overflow-y-auto p-5">
        <SheetHeader>
          <SheetTitle className="gradient-text font-display text-2xl">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs">
            Themes, device, roadmap & secrets — make it yours.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-7">
          {/* Sound */}
          <section className="flex items-center justify-between glass-card p-3">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-neon-cyan" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
              <span className="text-sm font-medium">Sound Effects</span>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={onSoundToggle} />
          </section>

          {/* Device switcher */}
          <section className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Device Layout</p>
            <div className="grid grid-cols-3 gap-2">
              {DEVICES.map((d) => {
                const I = d.icon;
                const active = deviceType === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => onDeviceChange(d.id)}
                    className={`spring-btn p-3 rounded-lg border-2 flex flex-col items-center gap-1 ${
                      active ? "border-primary/60 bg-primary/15 text-primary" : "border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <I className="w-5 h-5" />
                    <span className="text-xs font-semibold">{d.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Themes */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Vibe Themes
              </p>
              <span className="text-[10px] font-mono text-muted-foreground">{visibleThemes.length} available</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleThemes.map((t) => (
                <ThemeCard key={t.id} theme={t} active={theme === t.id} onClick={() => handleThemeChange(t.id)} />
              ))}
            </div>
            {!rainbow && (
              <p className="text-[10px] font-mono text-muted-foreground italic">
                Hint: try the Konami code anywhere to unlock a 🌈 secret.
              </p>
            )}
            {rainbow && (
              <p className="text-[10px] font-mono text-neon-pink animate-pulse">🌈 Rainbow theme unlocked! (apply via dev mode)</p>
            )}
          </section>

          {/* Roadmap */}
          <section className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5" /> Coming Soon
            </p>
            <Roadmap />
          </section>

          {/* Secrets / Easter eggs */}
          <section className="space-y-3 glass-card p-3">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Secrets
            </p>
            <input
              value={matrixInput}
              onChange={(e) => handleMatrixTrigger(e.target.value)}
              placeholder='Type "matrix"…'
              className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-xs font-mono outline-none focus:border-primary/50"
            />
            <SettingsMiniGame />
            {devMode && (
              <div className="space-y-1 p-2 rounded-lg bg-neon-green/10 border border-neon-green/30">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neon-green">⚡ Dev Mode Active</p>
                <p className="text-[10px] text-muted-foreground">All secrets unlocked. You broke the wall.</p>
              </div>
            )}
          </section>

          {/* Reset */}
          <section className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="spring-btn w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" /> Reset All Data
            </Button>
            <p className="text-xs text-muted-foreground">Wipes all saved lists, scores, themes & devices.</p>
          </section>

          {/* Version & Changelog */}
          <section className="pt-4 border-t border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <button onClick={handleVersionTap} className="text-xs font-mono neon-text-cyan spring-btn">
                {APP_VERSION}
              </button>
            </div>
            <button
              onClick={() => setShowChangelog(!showChangelog)}
              className="spring-btn flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Info className="w-3.5 h-3.5" />
              {showChangelog ? "Hide" : "Show"} Developer Notes
            </button>
            {showChangelog && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {CHANGELOGS.map((log, i) => (
                  <div key={i} className="glass-card p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-neon-violet">{log.version}</span>
                      <span className="text-[10px] text-muted-foreground">{log.date}</span>
                    </div>
                    <ul className="space-y-0.5">
                      {log.notes.map((note, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-neon-green mt-0.5">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="text-center pt-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-neon-cyan" /> Made with chaos
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
