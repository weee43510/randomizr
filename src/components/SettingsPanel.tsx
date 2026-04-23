import { Settings, Volume2, VolumeX, RotateCcw, Info, Palette, Check, Monitor, Tablet, Smartphone, Sparkles, KeyRound, Map, Trophy, Headphones, Brain, MessageCircle, Clock, Heart, Coffee } from "lucide-react";
import DevNotesPanel from "@/components/DevNotesPanel";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { APP_VERSION, CHANGELOGS } from "@/lib/version";
import { THEMES, applyTheme, getStoredTheme, type ThemeId } from "@/lib/theme";
import type { DeviceType } from "@/components/DevicePicker";
import Roadmap from "@/components/Roadmap";
import SettingsMiniGame from "@/components/SettingsMiniGame";
import ThemeEditor from "@/components/ThemeEditor";
import AchievementsPanel from "@/components/AchievementsPanel";
import SoundStudio from "@/components/SoundStudio";
import CustomTriviaPanel from "@/components/CustomTriviaPanel";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import VersionRollbackPanel from "@/components/VersionRollbackPanel";
import { isRainbowUnlocked, applyRainbowTheme, matrixRainOverlay, isDevMode, setDevMode } from "@/lib/easterEggs";
import { emojiRain, celebrate } from "@/lib/confetti";
import { unlock } from "@/lib/achievements";
import { toast } from "sonner";

interface Props {
  soundEnabled: boolean;
  onSoundToggle: (v: boolean) => void;
  deviceType: DeviceType;
  onDeviceChange: (d: DeviceType) => void;
  compact?: boolean;
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
      className={`spring-btn relative rounded-xl p-4 text-left overflow-hidden border-2 transition-all ${
        active ? "border-primary/80 neon-glow-cyan scale-[1.02]" : "border-border/30 hover:border-border/60"
      }`}
      style={{
        background: `linear-gradient(135deg, hsl(${theme.vars["--gradient-a"]}), hsl(${theme.vars["--gradient-b"]}), hsl(${theme.vars["--gradient-c"]}))`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl">{theme.emoji}</span>
        {active && <Check className="w-5 h-5" style={{ color: `hsl(${theme.vars["--primary"]})` }} />}
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="text-base font-display font-bold" style={{ color: `hsl(${theme.vars["--foreground"]})` }}>
          {theme.label}
        </p>
        <p className="text-[11px] opacity-70" style={{ color: `hsl(${theme.vars["--foreground"]})` }}>
          {theme.description}
        </p>
      </div>
      <div className="mt-3 flex gap-1.5">
        {["--primary", "--secondary", "--accent"].map((v) => (
          <span key={v} className="w-4 h-4 rounded-full border border-white/20" style={{ background: `hsl(${theme.vars[v]})` }} />
        ))}
      </div>
    </button>
  );
}

export default function SettingsPanel({ soundEnabled, onSoundToggle, deviceType, onDeviceChange, compact }: Props) {
  const [showChangelog, setShowChangelog] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);
  const [versionTaps, setVersionTaps] = useState(0);
  const [devMode, setDevModeState] = useState(isDevMode);
  const [rainbow, setRainbow] = useState(isRainbowUnlocked);
  const [matrixInput, setMatrixInput] = useState("");

  useEffect(() => {
    if (theme !== "custom" && !rainbow) return;
    let raf: number;
    const tick = () => {
      if ((window as any).__rainbow_active) {
        applyRainbowTheme();
        raf = requestAnimationFrame(tick);
      }
    };
    if ((window as any).__rainbow_active) tick();
    return () => raf && cancelAnimationFrame(raf);
  }, [theme, rainbow]);

  useEffect(() => {
    const id = setInterval(() => setRainbow(isRainbowUnlocked()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleResetData = () => {
    if (!confirm("Wipe ALL saved data? Snapshots are kept.")) return;
    const keys = Object.keys(localStorage).filter(
      (k) => (k.startsWith("randomizr_") || k.startsWith("pickr_")) && k !== "randomizr_version_snapshots"
    );
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const handleThemeChange = (id: ThemeId) => { setTheme(id); applyTheme(id); (window as any).__rainbow_active = false; };

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

  const handleSecretInput = (val: string) => {
    setMatrixInput(val);
    const lc = val.toLowerCase();
    if (lc.endsWith("matrix")) {
      matrixRainOverlay();
      setMatrixInput("");
      toast("🟢 Welcome to the Matrix");
    } else if (lc.endsWith("rainbow")) {
      (window as any).__rainbow_active = true;
      saveToStorage("rainbow_unlocked", true);
      setRainbow(true);
      toast.success("🌈 Rainbow mode ON — type anything to stop");
      setMatrixInput("");
      const stop = () => { (window as any).__rainbow_active = false; window.removeEventListener("keydown", stop); };
      setTimeout(() => window.addEventListener("keydown", stop, { once: true }), 1000);
    } else if (lc.endsWith("party")) {
      celebrate("big");
      toast("🎉 PARTY!");
      unlock("secret_party");
      setMatrixInput("");
    } else if (lc.endsWith("free")) {
      emojiRain("🦅", 25);
      toast("🦅 Soar.");
      setMatrixInput("");
    }
  };

  const trigger = compact ? (
    <button title="Settings" className="spring-btn w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40">
      <Settings className="w-5 h-5" />
    </button>
  ) : (
    <button className="spring-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40">
      <Settings className="w-5 h-5 shrink-0" />
      <span className="truncate">Settings</span>
    </button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="glass-card border-border/30 max-w-none w-screen h-screen sm:rounded-none p-0 inset-0 translate-x-0 translate-y-0 left-0 top-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border/30">
          <DialogTitle className="gradient-text font-display text-3xl flex items-center gap-3">
            <Settings className="w-7 h-7 text-neon-cyan" /> Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs flex items-center gap-3 flex-wrap">
            <span>Themes · device · achievements · sounds · seasons — make it yours.</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px]">
              <Sparkles className="w-3 h-3" /> Season 1 · The Casino
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="themes" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mx-6 mt-3 flex flex-wrap h-auto justify-start gap-1 bg-muted/30">
            <TabsTrigger value="themes"><Palette className="w-3.5 h-3.5 mr-1.5" />Themes</TabsTrigger>
            <TabsTrigger value="device"><Monitor className="w-3.5 h-3.5 mr-1.5" />Device</TabsTrigger>
            <TabsTrigger value="achievements"><Trophy className="w-3.5 h-3.5 mr-1.5" />Badges</TabsTrigger>
            <TabsTrigger value="sounds"><Headphones className="w-3.5 h-3.5 mr-1.5" />Sounds</TabsTrigger>
            <TabsTrigger value="trivia"><Brain className="w-3.5 h-3.5 mr-1.5" />Trivia</TabsTrigger>
            <TabsTrigger value="roadmap"><Map className="w-3.5 h-3.5 mr-1.5" />Roadmap</TabsTrigger>
            <TabsTrigger value="suggest"><MessageCircle className="w-3.5 h-3.5 mr-1.5" />Suggest</TabsTrigger>
            <TabsTrigger value="rollback"><Clock className="w-3.5 h-3.5 mr-1.5" />Rollback</TabsTrigger>
            <TabsTrigger value="notes"><Coffee className="w-3.5 h-3.5 mr-1.5" />Dev Notes</TabsTrigger>
            <TabsTrigger value="secrets"><KeyRound className="w-3.5 h-3.5 mr-1.5" />Secrets</TabsTrigger>
            <TabsTrigger value="about"><Info className="w-3.5 h-3.5 mr-1.5" />About</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 pb-10 pt-5">
            {/* THEMES */}
            <TabsContent value="themes" className="space-y-6 max-w-5xl mx-auto">
              <section className="flex items-center justify-between glass-card p-4">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-neon-cyan" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-bold">Sound Effects</p>
                    <p className="text-[11px] text-muted-foreground">Pops, dings, clicks across all tools</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={onSoundToggle} />
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Themes
                  </p>
                  <span className="text-[10px] font-mono text-muted-foreground">{THEMES.length} presets</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {THEMES.map((t) => (
                    <ThemeCard key={t.id} theme={t} active={theme === t.id} onClick={() => handleThemeChange(t.id)} />
                  ))}
                </div>
                {!rainbow && (
                  <p className="text-[11px] font-mono text-muted-foreground italic">
                    Hint: try the Konami code (↑↑↓↓←→←→ B A) or type "rainbow" in Secrets.
                  </p>
                )}
              </section>

              <section>
                <ThemeEditor active={theme === "custom"} onActivate={() => setTheme("custom")} />
              </section>
            </TabsContent>

            {/* DEVICE */}
            <TabsContent value="device" className="space-y-5 max-w-2xl mx-auto">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Device Layout</p>
              <div className="grid grid-cols-3 gap-3">
                {DEVICES.map((d) => {
                  const I = d.icon;
                  const active = deviceType === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => onDeviceChange(d.id)}
                      className={`spring-btn p-5 rounded-xl border-2 flex flex-col items-center gap-2 ${
                        active ? "border-primary/60 bg-primary/15 text-primary neon-glow-cyan" : "border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <I className="w-8 h-8" />
                      <span className="text-sm font-bold">{d.label}</span>
                      {active && <span className="text-[10px] font-mono uppercase">CURRENT</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">Switching here is non-destructive — your data stays.</p>
            </TabsContent>

            <TabsContent value="achievements" className="max-w-5xl mx-auto"><AchievementsPanel /></TabsContent>
            <TabsContent value="sounds" className="max-w-2xl mx-auto"><SoundStudio /></TabsContent>
            <TabsContent value="trivia" className="max-w-2xl mx-auto"><CustomTriviaPanel /></TabsContent>
            <TabsContent value="roadmap" className="max-w-6xl mx-auto"><Roadmap /></TabsContent>
            <TabsContent value="suggest" className="max-w-2xl mx-auto"><SuggestionsPanel /></TabsContent>
            <TabsContent value="rollback" className="max-w-2xl mx-auto"><VersionRollbackPanel /></TabsContent>
            <TabsContent value="notes" className="max-w-2xl mx-auto"><DevNotesPanel /></TabsContent>

            {/* SECRETS */}
            <TabsContent value="secrets" className="space-y-5 max-w-2xl mx-auto">
              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Secret Words
                </p>
                <input
                  value={matrixInput}
                  onChange={(e) => handleSecretInput(e.target.value)}
                  placeholder='Try: matrix · rainbow · party · free'
                  className="w-full px-3 py-2.5 rounded-lg bg-muted/40 border border-border/50 text-sm font-mono outline-none focus:border-primary/50"
                />
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
                  <div>🟢 <span className="text-foreground">matrix</span> → code rain</div>
                  <div>🌈 <span className="text-foreground">rainbow</span> → cycling hues</div>
                  <div>🎉 <span className="text-foreground">party</span> → confetti burst</div>
                  <div>🦅 <span className="text-foreground">free</span> → eagle swarm</div>
                </div>
              </div>

              <div className="glass-card p-4 space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">⌨️ Konami Code</p>
                <div className="flex gap-1 flex-wrap">
                  {["↑","↑","↓","↓","←","→","←","→","B","A"].map((k, i) => (
                    <kbd key={i} className="px-2 py-1 rounded bg-muted/50 border border-border/40 text-xs font-mono">{k}</kbd>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">Unlocks the 🌈 Rainbow theme app-wide.</p>
              </div>

              <SettingsMiniGame />

              {devMode && (
                <div className="glass-card p-3 border border-neon-green/30 bg-neon-green/5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neon-green">⚡ Dev Mode Active</p>
                  <p className="text-[11px] text-muted-foreground mt-1">All secrets unlocked.</p>
                </div>
              )}
            </TabsContent>

            {/* ABOUT */}
            <TabsContent value="about" className="space-y-5 max-w-2xl mx-auto">
              <div className="glass-card p-4 flex items-center justify-between">
                <span className="text-sm">Version</span>
                <button onClick={handleVersionTap} className="text-base font-mono neon-text-cyan spring-btn font-bold">
                  v{APP_VERSION}
                </button>
              </div>

              <div className="glass-card p-4 text-center space-y-1">
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground inline-flex items-center gap-1.5">
                  <Heart className="w-3 h-3 text-neon-pink" /> website by Elias
                </p>
                <p className="text-[11px] text-muted-foreground">Made with love. Got ideas? Use the Suggest tab!</p>
              </div>

              <Button
                variant="outline"
                onClick={handleResetData}
                className="spring-btn w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-4 h-4" /> Reset All Data
              </Button>
              <p className="text-xs text-muted-foreground -mt-3">Wipes saved lists, scores, themes & devices. Snapshots are kept.</p>

              <button onClick={() => setShowChangelog(!showChangelog)} className="spring-btn flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                <Info className="w-3.5 h-3.5" />
                {showChangelog ? "Hide" : "Show"} Changelog
              </button>
              {showChangelog && (
                <div className="space-y-3">
                  {CHANGELOGS.map((log, i) => (
                    <div key={i} className="glass-card p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-neon-violet">v{log.version}</span>
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

              <div className="text-center pt-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground inline-flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-neon-cyan" /> Made with care
                </span>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
