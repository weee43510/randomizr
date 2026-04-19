import { Sparkles, Hand, Image, LayoutList, Users, Dice5, Menu, X, Flame, Grid3x3, Swords, HelpCircle, Brain, StickyNote, NotebookPen } from "lucide-react";
import { sounds } from "@/lib/sounds";
import SettingsPanel from "@/components/SettingsPanel";
import { APP_VERSION } from "@/lib/version";
import type { DeviceType } from "@/components/DevicePicker";

const tools = [
  { id: "mystic", label: "AI Mystic", icon: Sparkles },
  { id: "roulette", label: "Finger Roulette", icon: Hand },
  { id: "wheel", label: "Photo Wheel", icon: Image },
  { id: "ranking", label: "Ranking Board", icon: LayoutList },
  { id: "teams", label: "Team Splitter", icon: Users },
  { id: "coinDice", label: "Coin & Dice", icon: Dice5 },
  { id: "truthDare", label: "Truth or Dare", icon: Flame },
  { id: "wyr", label: "Would You Rather", icon: HelpCircle },
  { id: "trivia", label: "Trivia Quiz", icon: Brain },
  { id: "bingo", label: "Bingo", icon: Grid3x3 },
  { id: "rps", label: "Rock Paper Scissors", icon: Swords },
  { id: "sticky", label: "Sticky Wall", icon: StickyNote },
  { id: "notepad", label: "Notepad", icon: NotebookPen },
] as const;

export type ToolId = (typeof tools)[number]["id"];

interface Props {
  active: ToolId;
  onSelect: (id: ToolId) => void;
  collapsed: boolean;
  onToggle: () => void;
  deviceType: DeviceType;
  mobileOpen: boolean;
  onMobileToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: (v: boolean) => void;
}

export default function AppSidebar({
  active,
  onSelect,
  collapsed,
  onToggle,
  deviceType,
  mobileOpen,
  onMobileToggle,
  soundEnabled,
  onSoundToggle,
}: Props) {
  const isMobile = deviceType === "mobile";

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30 rounded-none flex items-center justify-between px-4 py-3">
          <span className="font-display font-bold text-lg tracking-tight gradient-text">Randomizr</span>
          <button onClick={onMobileToggle} className="text-foreground p-1">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="fixed top-14 left-0 right-0 z-40 glass-card border-b border-border/30 rounded-none p-3 space-y-1 animate-fade-in max-h-[80vh] overflow-y-auto">
            {tools.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    if (soundEnabled) sounds.click();
                    onSelect(t.id);
                    onMobileToggle();
                  }}
                  className={`spring-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-primary/15 text-primary neon-glow-cyan"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-border/30">
              <SettingsPanel soundEnabled={soundEnabled} onSoundToggle={onSoundToggle} />
            </div>
          </div>
        )}
      </>
    );
  }

  const isTablet = deviceType === "tablet";
  const sidebarCollapsed = isTablet || collapsed;

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 glass-card border-r border-t-0 border-b-0 border-l-0 ${
        sidebarCollapsed ? "w-16" : "w-56"
      }`}
      style={{ borderColor: "hsla(var(--glass-border) / 0.08)" }}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border/30">
        <button onClick={onToggle} className="spring-btn font-display font-bold text-xl tracking-tight gradient-text">
          {sidebarCollapsed ? "R" : "Randomizr"}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (soundEnabled) sounds.click();
                onSelect(t.id);
              }}
              title={sidebarCollapsed ? t.label : undefined}
              className={`spring-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive
                  ? "bg-primary/15 text-primary neon-glow-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{t.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-2 pb-2 space-y-1 border-t border-border/30 pt-2">
        {!sidebarCollapsed && (
          <SettingsPanel soundEnabled={soundEnabled} onSoundToggle={onSoundToggle} />
        )}
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground font-mono">v{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
}
