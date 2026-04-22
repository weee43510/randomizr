import { useState, useRef, useCallback, useEffect } from "react";
import { sounds, triggerWinHype } from "@/lib/sounds";

interface Touch {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = [
  "hsl(187 94% 43%)", "hsl(263 70% 58%)", "hsl(330 80% 60%)",
  "hsl(150 80% 50%)", "hsl(40 90% 55%)", "hsl(0 80% 58%)",
  "hsl(210 90% 55%)", "hsl(120 60% 50%)", "hsl(280 80% 65%)", "hsl(60 80% 55%)",
];

export default function FingerRoulette() {
  const [touches, setTouches] = useState<Touch[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateTouches = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const t: Touch[] = [];
    for (let i = 0; i < e.touches.length && i < 10; i++) {
      const touch = e.touches[i];
      const rect = containerRef.current!.getBoundingClientRect();
      t.push({
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        color: COLORS[i % COLORS.length],
      });
    }
    setTouches(t);
  }, []);

  const startCountdown = useCallback((touchList: Touch[]) => {
    if (touchList.length < 2) return;
    setWinner(null);
    setCountdown(3);
    sounds.drumroll(3000);
    let count = 3;
    timerRef.current = setInterval(() => {
      count--;
      sounds.countdown();
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setCountdown(null);
        const w = Math.floor(Math.random() * touchList.length);
        setWinner(touchList[w].id);
        sounds.win();
        triggerWinHype();
        if (navigator.vibrate) navigator.vibrate(200);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    updateTouches(e);
    if (e.touches.length >= 2 && countdown === null && winner === null) {
      const t: Touch[] = [];
      for (let i = 0; i < e.touches.length && i < 10; i++) {
        const touch = e.touches[i];
        const rect = containerRef.current!.getBoundingClientRect();
        t.push({ id: touch.identifier, x: touch.clientX - rect.left, y: touch.clientY - rect.top, color: COLORS[i % COLORS.length] });
      }
      startCountdown(t);
    }
  };

  const reset = () => {
    setTouches([]);
    setCountdown(null);
    setWinner(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="text-center space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">MULTI-TOUCH · INSTANT PICK</p>
        <h2 className="text-3xl font-display font-black gradient-text">Finger Roulette</h2>
      </div>
      <p className="text-sm text-muted-foreground">Place 2+ fingers on the screen — fate picks one.</p>

      <div
        ref={containerRef}
        className="relative w-full rounded-2xl glass-card-highlight overflow-hidden select-none"
        style={{ height: "60vh", touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchMove={updateTouches}
        onTouchEnd={(e) => { if (e.touches.length === 0) reset(); else updateTouches(e); }}
      >
        {/* Touch indicators */}
        {touches.map((t) => (
          <div
            key={t.id}
            className="absolute w-16 h-16 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-150 flex items-center justify-center"
            style={{
              left: t.x,
              top: t.y,
              background: winner === t.id ? t.color : `${t.color}40`,
              border: `2px solid ${t.color}`,
              boxShadow: winner === t.id ? `0 0 30px ${t.color}, 0 0 60px ${t.color}` : `0 0 10px ${t.color}50`,
              transform: `translate(-50%, -50%) scale(${winner === t.id ? 1.4 : 1})`,
            }}
          >
            {winner === t.id && <span className="text-xl">👑</span>}
          </div>
        ))}

        {/* Countdown */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-black neon-text-cyan animate-scale-in">{countdown}</span>
          </div>
        )}

        {/* Desktop fallback */}
        {touches.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Use a touch screen with 2+ fingers
          </div>
        )}
      </div>
    </div>
  );
}
