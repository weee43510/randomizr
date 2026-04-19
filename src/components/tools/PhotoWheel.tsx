import { useState, useRef } from "react";
import { sounds } from "@/lib/sounds";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

interface Slice {
  id: string;
  label: string;
  image?: string;
  weight: number;
}

const DEFAULT_SLICES: Slice[] = [
  { id: "1", label: "Pizza 🍕", weight: 1 },
  { id: "2", label: "Sushi 🍣", weight: 1 },
  { id: "3", label: "Tacos 🌮", weight: 1 },
  { id: "4", label: "Burger 🍔", weight: 1 },
  { id: "5", label: "Pasta 🍝", weight: 1 },
  { id: "6", label: "Salad 🥗", weight: 1 },
];

const SLICE_COLORS = [
  "hsl(187, 94%, 35%)", "hsl(263, 70%, 45%)", "hsl(330, 80%, 50%)",
  "hsl(150, 80%, 38%)", "hsl(40, 90%, 45%)", "hsl(210, 90%, 45%)",
  "hsl(0, 70%, 50%)", "hsl(280, 80%, 50%)",
];

export default function PhotoWheel() {
  const [slices, setSlices] = useState<Slice[]>(() => loadFromStorage("wheel_slices", DEFAULT_SLICES));
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [elimination, setElimination] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const wheelRef = useRef<HTMLDivElement>(null);

  const save = (s: Slice[]) => { setSlices(s); saveToStorage("wheel_slices", s); };

  const addSlice = () => {
    if (!newLabel.trim()) return;
    const s = [...slices, { id: Date.now().toString(), label: newLabel.trim(), weight: 1 }];
    save(s);
    setNewLabel("");
  };

  const removeSlice = (id: string) => save(slices.filter(s => s.id !== id));

  const spin = () => {
    if (spinning || slices.length < 2) return;
    setSpinning(true);
    setWinner(null);
    sounds.drumroll(4000);

    const totalWeight = slices.reduce((a, s) => a + s.weight, 0);
    const rand = Math.random() * totalWeight;
    let cumulative = 0;
    let winnerIdx = 0;
    for (let i = 0; i < slices.length; i++) {
      cumulative += slices[i].weight;
      if (rand <= cumulative) { winnerIdx = i; break; }
    }

    const sliceAngle = 360 / slices.length;
    const targetAngle = 360 - (winnerIdx * sliceAngle + sliceAngle / 2);
    const extraSpins = 5 * 360;
    const newRot = rotation + extraSpins + targetAngle - (rotation % 360);

    setRotation(newRot);

    setTimeout(() => {
      setSpinning(false);
      setWinner(slices[winnerIdx].label);
      sounds.win();
      if (elimination) {
        const remaining = slices.filter((_, i) => i !== winnerIdx);
        if (remaining.length > 0) save(remaining);
      }
    }, 4000);
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      save(slices.map(s => s.id === id ? { ...s, image: e.target?.result as string } : s));
    };
    reader.readAsDataURL(file);
  };

  const totalSlices = slices.length;
  const sliceAngle = totalSlices > 0 ? 360 / totalSlices : 360;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Wheel */}
      <div className="flex-1 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold neon-text-cyan">Photo Wheel</h2>

        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-neon-cyan" style={{ filter: "drop-shadow(0 0 6px hsl(187 94% 43%))" }} />

          <div
            ref={wheelRef}
            className="w-full h-full rounded-full overflow-hidden border-2 border-primary/30 neon-glow-cyan"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {slices.map((s, i) => {
                const startAngle = i * sliceAngle;
                const endAngle = startAngle + sliceAngle;
                const startRad = (startAngle - 90) * (Math.PI / 180);
                const endRad = (endAngle - 90) * (Math.PI / 180);
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                const largeArc = sliceAngle > 180 ? 1 : 0;
                const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
                const textX = 100 + 60 * Math.cos(midAngle);
                const textY = 100 + 60 * Math.sin(midAngle);

                return (
                  <g key={s.id}>
                    <path
                      d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                      stroke="hsl(230 25% 7%)"
                      strokeWidth="0.5"
                    />
                    {s.image && (
                      <clipPath id={`clip-${s.id}`}>
                        <path d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`} />
                      </clipPath>
                    )}
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={totalSlices > 8 ? "5" : "7"}
                      fontWeight="bold"
                      transform={`rotate(${(startAngle + endAngle) / 2}, ${textX}, ${textY})`}
                    >
                      {s.label.length > 10 ? s.label.slice(0, 10) + "…" : s.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <button
          onClick={spin}
          disabled={spinning || slices.length < 2}
          className="spring-btn px-8 py-3 rounded-lg bg-primary/20 border border-primary/40 text-primary font-bold hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
        >
          {spinning ? "Spinning..." : "SPIN!"}
        </button>

        {winner && (
          <div className="glass-card-highlight px-6 py-4 rounded-xl text-center animate-scale-in">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Winner</p>
            <p className="text-lg font-bold neon-text-cyan">{winner}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full lg:w-72 glass-card p-4 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Options</h3>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={elimination} onChange={(e) => setElimination(e.target.checked)} className="accent-primary" />
            Elimination
          </label>
        </div>

        <div className="flex gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSlice()}
            placeholder="Add option..."
            className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
          <button onClick={addSlice} className="spring-btn px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm font-semibold">+</button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {slices.map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1 truncate text-foreground">{s.label}</span>
              <input
                type="number"
                value={s.weight}
                min={1}
                max={10}
                onChange={(e) => save(slices.map(sl => sl.id === s.id ? { ...sl, weight: Number(e.target.value) || 1 } : sl))}
                className="w-12 px-1 py-0.5 rounded bg-muted/50 border border-border/50 text-xs text-center text-foreground"
              />
              <label className="cursor-pointer text-xs text-muted-foreground hover:text-primary">
                📷
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(s.id, e.target.files[0])} />
              </label>
              <button onClick={() => removeSlice(s.id)} className="text-destructive hover:text-destructive/80 text-xs">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
