import { Sparkles, Hand, Image, LayoutList, Users, Dice5, Menu, X, Flame, Grid3x3, Swords, HelpCircle, Brain, StickyNote, NotebookPen, Zap, Layers, Type, MousePointerClick, Hash, Smile } from "lucide-react";
import { sounds } from "@/lib/sounds";
import SettingsPanel from "@/components/SettingsPanel";
import { APP_VERSION } from "@/lib/version";
import type { DeviceType } from "@/components/DevicePicker";

const tools = [
  { id: "mystic", label: "AI Mystic", icon: Sparkles, group: "Random" },
  { id: "roulette", label: "Finger Roulette", icon: Hand, group: "Random" },
  { id: "wheel", label: "Photo Wheel", icon: Image, group: "Random" },
  { id: "ranking", label: "Ranking Board", icon: LayoutList, group: "Random" },
  { id: "teams", label: "Team Splitter", icon: Users, group: "Random" },
  { id: "coinDice", label: "Coin & Dice", icon: Dice5, group: "Random" },
  { id: "truthDare", label: "Truth or Dare", icon: Flame, group: "Party" },
  { id: "wyr", label: "Would You Rather", icon: HelpCircle, group: "Party" },
  { id: "trivia", label: "Trivia Quiz", icon: Brain, group: "Party" },
  { id: "bingo", label: "Bingo", icon: Grid3x3, group: "Party" },
  { id: "rps", label: "Rock Paper Scissors", icon: Swords, group: "Party" },
  { id: "reaction", label: "Reaction Time", icon: Zap, group: "Mini-Games" },
  { id: "memory", label: "Memory Sequence", icon: Layers, group: "Mini-Games" },
  { id: "wordchain", label: "Word Chain", icon: Type, group: "Mini-Games" },
  { id: "speedtap", label: "Speed Tap", icon: MousePointerClick, group: "Mini-Games" },
  { id: "numhunt", label: "Number Hunt", icon: Hash, group: "Mini-Games" },
  { id: "emoji", label: "Emoji Story", icon: Smile, group: "Mini-Games" },
  { id: "sticky", label: "Sticky Wall", icon: StickyNote, group: "Tools" },
  { id: "notepad", label: "Notepad", icon: NotebookPen, group: "Tools" },
] as const;

export type ToolId = (typeof tools)[number]["id"];

const GROUPS = ["Random", "Party", "Mini-Games", "Tools"] as const;

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
  onDeviceChange: (d: DeviceType) => void;
}

export default function AppSidebar({
  active, onSelect, collapsed, onToggle, deviceType, mobileOpen, onMobileToggle,
  soundEnabled, onSoundToggle, onDeviceChange,
}: Props) {
  const isMobile = deviceType === "mobile";

  const renderTool = (t: typeof tools[number], showLabel: boolean) => {
    const Icon = t.icon;
    const isActive = active === t.id;
    return (
      <button
        key={t.id}
        onClick={() => {
          if (soundEnabled) sounds.click();
          onSelect(t.id);
          if (isMobile) onMobileToggle();
        }}
        title={!showLabel ? t.label : undefined}
        className={`spring-btn w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
          isActive
            ? "bg-primary/15 text-primary neon-glow-cyan"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        }`}
      >
        <Icon className="w-4.5 h-4.5 shrink-0" />
        {showLabel && <span className="truncate text-[13px]">{t.label}</span>}
      </button>
    );
  };

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
          <div className="fixed top-14 left-0 right-0 z-40 glass-card border-b border-border/30 rounded-none p-3 space-y-3 animate-fade-in max-h-[80vh] overflow-y-auto">
            {GROUPS.map((g) => (
              <div key={g} className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2">{g}</p>
                {tools.filter((t) => t.group === g).map((t) => renderTool(t, true))}
              </div>
            ))}
            <div className="pt-2 border-t border-border/30">
              <SettingsPanel
                soundEnabled={soundEnabled}
                onSoundToggle={onSoundToggle}
                deviceType={deviceType}
                onDeviceChange={onDeviceChange}
              />
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
        sidebarCollapsed ? "w-16" : "w-60"
      }`}
      style={{ borderColor: "hsla(var(--glass-border) / 0.08)" }}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border/30">
        <button onClick={onToggle} className="spring-btn font-display font-bold text-xl tracking-tight gradient-text">
          {sidebarCollapsed ? "R" : "Randomizr"}
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-3 px-2 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g} className="space-y-0.5">
            {!sidebarCollapsed && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mb-1">{g}</p>
            )}
            {tools.filter((t) => t.group === g).map((t) => renderTool(t, !sidebarCollapsed))}
          </div>
        ))}
      </nav>

      <div className="px-2 pb-2 space-y-1 border-t border-border/30 pt-2">
        {!sidebarCollapsed && (
          <SettingsPanel
            soundEnabled={soundEnabled}
            onSoundToggle={onSoundToggle}
            deviceType={deviceType}
            onDeviceChange={onDeviceChange}
          />
        )}
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground font-mono">v{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
}
