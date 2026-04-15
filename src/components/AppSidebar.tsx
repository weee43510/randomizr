import { Sparkles, Hand, Image, LayoutList, Users, Dice5 } from "lucide-react";
import { sounds } from "@/lib/sounds";

const tools = [
  { id: "mystic", label: "AI Mystic", icon: Sparkles },
  { id: "roulette", label: "Finger Roulette", icon: Hand },
  { id: "wheel", label: "Photo Wheel", icon: Image },
  { id: "ranking", label: "Ranking Board", icon: LayoutList },
  { id: "teams", label: "Team Splitter", icon: Users },
  { id: "coinDice", label: "Coin & Dice", icon: Dice5 },
] as const;

export type ToolId = (typeof tools)[number]["id"];

interface Props {
  active: ToolId;
  onSelect: (id: ToolId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppSidebar({ active, onSelect, collapsed, onToggle }: Props) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 glass-card border-r border-t-0 border-b-0 border-l-0 ${
        collapsed ? "w-16" : "w-56"
      }`}
      style={{ borderColor: "hsla(var(--glass-border) / 0.08)" }}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border/30">
        <button onClick={onToggle} className="text-neon-cyan font-bold text-xl tracking-tight">
          {collapsed ? "P" : "Pickr"}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { sounds.click(); onSelect(t.id); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary neon-glow-cyan"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{t.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
