import { Settings, Volume2, VolumeX, RotateCcw, Info, Palette, Check } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { APP_VERSION, CHANGELOGS } from "@/lib/version";
import { THEMES, applyTheme, getStoredTheme, type ThemeId } from "@/lib/theme";

export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(() => loadFromStorage("sound_enabled", true));
  const toggle = (v: boolean) => {
    setEnabled(v);
    saveToStorage("sound_enabled", v);
  };
  return [enabled, toggle] as const;
}

interface Props {
  soundEnabled: boolean;
  onSoundToggle: (v: boolean) => void;
}

// Small color swatch preview for each theme
function ThemeSwatch({ theme }: { theme: typeof THEMES[number] }) {
  return (
    <div className="flex gap-1">
      <span
        className="w-4 h-4 rounded-full border border-white/20"
        style={{ background: `hsl(${theme.vars["--neon-cyan"]})` }}
      />
      <span
        className="w-4 h-4 rounded-full border border-white/20"
        style={{ background: `hsl(${theme.vars["--neon-violet"]})` }}
      />
    </div>
  );
}

export default function SettingsPanel({ soundEnabled, onSoundToggle }: Props) {
  const [showChangelog, setShowChangelog] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);

  const handleResetData = () => {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("randomizr_") || k.startsWith("pickr_")
    );
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const handleThemeChange = (id: ThemeId) => {
    setTheme(id);
    applyTheme(id);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="spring-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40">
          <Settings className="w-5 h-5 shrink-0" />
          <span className="truncate">Settings</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="glass-card border-border/30 w-80 sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="neon-text-cyan">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs">Configure Randomizr preferences</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 className="w-5 h-5 text-neon-cyan" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
              <span className="text-sm font-medium">Sound Effects</span>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={onSoundToggle} />
          </div>

          {/* Theme Picker */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-neon-violet" />
              <span className="text-sm font-medium">Vibe Theme</span>
            </div>
            <div className="grid gap-2">
              {THEMES.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`spring-btn glass-card flex items-center justify-between px-3 py-2.5 text-left ${
                      active ? "border-primary/50 neon-glow-cyan" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ThemeSwatch theme={t} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.label}</p>
                        <p className="text-[10px] text-muted-foreground">{t.description}</p>
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="spring-btn w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Data
            </Button>
            <p className="text-xs text-muted-foreground">Clears all saved lists, preferences, and settings.</p>
          </div>

          {/* Version & Changelog */}
          <div className="pt-4 border-t border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <span className="text-xs font-mono text-neon-cyan">{APP_VERSION}</span>
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
