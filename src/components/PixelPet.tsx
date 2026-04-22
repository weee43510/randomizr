import { useEffect, useRef, useState } from "react";
import { getPet, tickPet, petAction, petEmoji, setPetPosition, renamePet, type PetState } from "@/lib/pet";
import { Heart, Drumstick, Gamepad2, Pencil, X } from "lucide-react";

/** Floating mascot — drag, feed, pet, play. Persistent stats. */
export default function PixelPet() {
  const [pet, setPet] = useState<PetState>(getPet);
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [editName, setEditName] = useState(false);
  const [draft, setDraft] = useState(pet.name);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; ox: number; oy: number; moved: boolean }>({
    active: false, startX: 0, startY: 0, ox: 0, oy: 0, moved: false,
  });

  // Passive tick every 30s
  useEffect(() => {
    setPet(tickPet());
    const id = setInterval(() => setPet(tickPet()), 30_000);
    return () => clearInterval(id);
  }, []);

  const doAction = (a: "pet" | "feed" | "play") => {
    setPet(petAction(a));
    setBounce(true);
    setTimeout(() => setBounce(false), 400);
  };

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    dragRef.current = {
      active: true, startX: e.clientX, startY: e.clientY,
      ox: pet.pos.x, oy: pet.pos.y, moved: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragRef.current.moved = true;
    const newX = Math.max(8, Math.min(window.innerWidth - 64, dragRef.current.ox - dx));
    const newY = Math.max(8, Math.min(window.innerHeight - 64, dragRef.current.oy - dy));
    setPet((p) => ({ ...p, pos: { x: newX, y: newY } }));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const { moved } = dragRef.current;
    if (moved) setPet(setPetPosition(pet.pos.x, pet.pos.y));
    dragRef.current.active = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (!moved) {
      setOpen((o) => !o);
      doAction("pet");
    }
  };

  const saveName = () => {
    setPet(renamePet(draft));
    setEditName(false);
  };

  return (
    <div
      className="fixed z-40"
      style={{ right: `${pet.pos.x}px`, bottom: `${pet.pos.y}px` }}
    >
      {/* Stats popover */}
      {open && (
        <div className="absolute bottom-14 right-0 w-60 glass-card p-3 space-y-2.5 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            {editName ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="flex-1 px-2 py-1 rounded bg-muted/40 border border-border/50 text-sm font-bold outline-none"
                maxLength={12}
              />
            ) : (
              <button
                onClick={() => { setDraft(pet.name); setEditName(true); }}
                className="text-sm font-display font-bold inline-flex items-center gap-1.5 spring-btn"
              >
                {pet.name} <Pencil className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-muted-foreground spring-btn p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] font-mono text-muted-foreground flex items-center justify-between">
            <span>Level {pet.level}</span>
            <span className="capitalize">{pet.mood}</span>
          </div>
          {/* XP bar */}
          <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-all" style={{ width: `${pet.xp}%` }} />
          </div>

          <Stat label="❤️ Affection" value={pet.affection} color="hsl(var(--neon-pink))" />
          <Stat label="⚡ Energy" value={pet.energy} color="hsl(var(--neon-cyan))" />
          <Stat label="🍽️ Hunger" value={pet.hunger} color="hsl(var(--neon-green))" inverse />

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <ActionBtn icon={<Heart className="w-3.5 h-3.5" />} label="Pet" onClick={() => doAction("pet")} />
            <ActionBtn icon={<Drumstick className="w-3.5 h-3.5" />} label="Feed" onClick={() => doAction("feed")} />
            <ActionBtn icon={<Gamepad2 className="w-3.5 h-3.5" />} label="Play" onClick={() => doAction("play")} />
          </div>
          <p className="text-[9px] text-muted-foreground text-center">drag the pet to move it · click to interact</p>
        </div>
      )}

      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title={`${pet.name} · Lvl ${pet.level} · ${pet.mood}`}
        className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-2xl spring-btn shadow-lg touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ animation: bounce ? "pop-in 0.4s" : undefined }}
        aria-label="Pixel pet"
      >
        <span className={pet.mood === "hyped" ? "animate-bounce" : pet.mood === "sleepy" ? "opacity-60" : ""}>
          {petEmoji(pet)}
        </span>
      </button>
    </div>
  );
}

function Stat({ label, value, color, inverse }: { label: string; value: number; color: string; inverse?: boolean }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${value}%`, background: color, opacity: inverse && value > 70 ? 0.5 : 1 }}
        />
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="spring-btn flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-muted/40 hover:bg-muted/60 text-[10px] font-mono"
    >
      {icon}
      {label}
    </button>
  );
}
