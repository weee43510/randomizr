import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { sounds } from "@/lib/sounds";
import SettingsPanel from "@/components/SettingsPanel";
import { APP_VERSION } from "@/lib/version";
import type { DeviceType } from "@/components/DevicePicker";
import { TOOLS, TOOL_GROUPS, type ToolId } from "@/lib/toolMeta";

export type { ToolId };

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
  onPickExclusive?: (gameId: string) => void;
}

export default function AppSidebar({
  active, onSelect, collapsed, onToggle, deviceType, mobileOpen, onMobileToggle,
  soundEnabled, onSoundToggle, onDeviceChange, onPickExclusive,
}: Props) {
  const [search, setSearch] = useState("");
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const sidebarCollapsed = isTablet || collapsed;

  const filtered = search.trim()
    ? TOOLS.filter((t) => t.label.toLowerCase().includes(search.toLowerCase()))
    : TOOLS;

  const renderTool = (t: typeof TOOLS[number], showLabel: boolean) => {
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
        className={`spring-btn relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
          isActive
            ? "bg-primary/15 text-primary neon-glow-cyan"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        }`}
      >
        <Icon className="w-4.5 h-4.5 shrink-0" />
        {showLabel && <span className="truncate text-[13px] flex-1 text-left">{t.label}</span>}
        {showLabel && t.isNew && (
          <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-neon-pink/20 text-neon-pink border border-neon-pink/40">
            NEW
          </span>
        )}
        {!showLabel && t.isNew && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
        )}
      </button>
    );
  };

  if (isMobile) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30 rounded-none flex items-center justify-between px-4 py-3">
          <span className="font-display font-bold text-lg tracking-tight gradient-text">Randomizr</span>
          <button onClick={onMobileToggle} className="text-foreground p-1 spring-btn">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="fixed top-14 left-0 right-0 z-40 glass-card border-b border-border/30 rounded-none p-3 space-y-3 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools…"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/30 border border-border/40 text-xs outline-none focus:border-primary/50"
              />
            </div>
            {TOOL_GROUPS.map((g) => {
              const inGroup = filtered.filter((t) => t.group === g);
              if (inGroup.length === 0) return null;
              return (
                <div key={g} className="space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2">{g}</p>
                  {inGroup.map((t) => renderTool(t, true))}
                </div>
              );
            })}
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

      {!sidebarCollapsed && (
        <div className="px-2 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-muted/30 border border-border/40 text-xs outline-none focus:border-primary/50"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 py-3 space-y-3 px-2 overflow-y-auto">
        {TOOL_GROUPS.map((g) => {
          const inGroup = filtered.filter((t) => t.group === g);
          if (inGroup.length === 0) return null;
          return (
            <div key={g} className="space-y-0.5">
              {!sidebarCollapsed && (
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mb-1">{g}</p>
              )}
              {inGroup.map((t) => renderTool(t, !sidebarCollapsed))}
            </div>
          );
        })}
      </nav>

      <div className="px-2 pb-2 space-y-1 border-t border-border/30 pt-2">
        <SettingsPanel
          soundEnabled={soundEnabled}
          onSoundToggle={onSoundToggle}
          deviceType={deviceType}
          onDeviceChange={onDeviceChange}
          compact={sidebarCollapsed}
        />
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground font-mono">v{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
}
