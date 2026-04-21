import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { applyTheme, type ThemeId } from "@/lib/theme";
import { Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface CustomTheme {
  primaryH: number; primaryS: number; primaryL: number;
  accentH: number;
  bgH: number; bgL: number;
}

const DEFAULT: CustomTheme = { primaryH: 200, primaryS: 95, primaryL: 55, accentH: 320, bgH: 230, bgL: 7 };

function applyCustom(c: CustomTheme) {
  const root = document.documentElement;
  root.style.setProperty("--primary", `${c.primaryH} ${c.primaryS}% ${c.primaryL}%`);
  root.style.setProperty("--ring", `${c.primaryH} ${c.primaryS}% ${c.primaryL}%`);
  root.style.setProperty("--accent", `${c.accentH} ${c.primaryS}% ${c.primaryL}%`);
  root.style.setProperty("--secondary", `${(c.primaryH + 60) % 360} ${c.primaryS}% ${c.primaryL}%`);
  root.style.setProperty("--neon-cyan", `${c.primaryH} 95% ${c.primaryL}%`);
  root.style.setProperty("--neon-violet", `${c.accentH} 95% ${c.primaryL}%`);
  root.style.setProperty("--neon-pink", `${(c.accentH + 20) % 360} 90% 60%`);
  root.style.setProperty("--background", `${c.bgH} 25% ${c.bgL}%`);
  root.style.setProperty("--card", `${c.bgH} 20% ${c.bgL + 5}%`);
  root.style.setProperty("--muted", `${c.bgH} 15% ${c.bgL + 11}%`);
  root.style.setProperty("--border", `${c.bgH} 15% ${c.bgL + 15}%`);
  root.style.setProperty("--gradient-a", `${c.bgH} 30% ${c.bgL + 1}%`);
  root.style.setProperty("--gradient-b", `${c.accentH} 30% ${c.bgL + 7}%`);
  root.style.setProperty("--gradient-c", `${c.primaryH} 30% ${c.bgL + 5}%`);
  root.style.setProperty("--gradient-d", `${c.bgH} 30% ${c.bgL + 1}%`);
}

interface Props {
  active: boolean;
  onActivate: () => void;
}

export default function ThemeEditor({ active, onActivate }: Props) {
  const [c, setC] = useState<CustomTheme>(() => loadFromStorage("custom_theme", DEFAULT));

  useEffect(() => {
    if (active) applyCustom(c);
  }, [c, active]);

  const update = (patch: Partial<CustomTheme>) => setC((prev) => ({ ...prev, ...patch }));

  const save = () => {
    saveToStorage("custom_theme", c);
    saveToStorage("theme", "custom" as ThemeId);
    onActivate();
    toast.success("✨ Custom theme saved!");
  };

  const random = () => {
    setC({
      primaryH: Math.floor(Math.random() * 360),
      primaryS: 80 + Math.floor(Math.random() * 20),
      primaryL: 50 + Math.floor(Math.random() * 15),
      accentH: Math.floor(Math.random() * 360),
      bgH: Math.floor(Math.random() * 360),
      bgL: 5 + Math.floor(Math.random() * 10),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" /> Theme Editor
          </p>
          <p className="text-[11px] text-muted-foreground">Drag sliders to remix. Save to keep it.</p>
        </div>
        <button onClick={random} className="spring-btn text-[11px] font-mono px-2 py-1 rounded bg-muted/40 hover:bg-muted/60">🎲 Random</button>
      </div>

      <div className="space-y-3 glass-card p-3">
        <SliderRow label="Primary Hue" value={c.primaryH} max={360} onChange={(v) => update({ primaryH: v })} />
        <SliderRow label="Primary Saturation" value={c.primaryS} max={100} onChange={(v) => update({ primaryS: v })} />
        <SliderRow label="Primary Lightness" value={c.primaryL} max={80} min={30} onChange={(v) => update({ primaryL: v })} />
        <SliderRow label="Accent Hue" value={c.accentH} max={360} onChange={(v) => update({ accentH: v })} />
        <SliderRow label="Background Hue" value={c.bgH} max={360} onChange={(v) => update({ bgH: v })} />
        <SliderRow label="Background Lightness" value={c.bgL} max={20} onChange={(v) => update({ bgL: v })} />

        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-10 rounded-lg" style={{ background: `hsl(${c.primaryH} ${c.primaryS}% ${c.primaryL}%)` }} />
          <div className="flex-1 h-10 rounded-lg" style={{ background: `hsl(${c.accentH} ${c.primaryS}% ${c.primaryL}%)` }} />
          <div className="flex-1 h-10 rounded-lg border border-border/30" style={{ background: `hsl(${c.bgH} 25% ${c.bgL}%)` }} />
        </div>

        <button
          onClick={save}
          className="spring-btn w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold text-sm"
        >
          <Save className="w-4 h-4" /> Save as Custom Theme
        </button>
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange, max, min = 0 }: { label: string; value: number; onChange: (v: number) => void; max: number; min?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-foreground">{value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

export function applyCustomFromStorage() {
  const c = loadFromStorage<CustomTheme>("custom_theme", DEFAULT);
  applyCustom(c);
}
