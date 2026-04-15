import { Settings, Volume2, VolumeX, RotateCcw, Info } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { APP_VERSION, CHANGELOGS } from "@/lib/version";

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

export default function SettingsPanel({ soundEnabled, onSoundToggle }: Props) {
  const [showChangelog, setShowChangelog] = useState(false);

  const handleResetData = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("pickr_"));
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200">
          <Settings className="w-5 h-5 shrink-0" />
          <span className="truncate">Settings</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="glass-card border-border/30 w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="neon-text-cyan">Settings</SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs">Configure Pickr preferences</SheetDescription>
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

          {/* Reset */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
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
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
