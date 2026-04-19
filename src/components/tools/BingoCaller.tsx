import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { Bot, User, Trophy } from "lucide-react";

const MAX = 75;

function letterFor(n: number) {
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}

const COLORS: Record<string, string> = {
  B: "hsl(var(--neon-cyan))",
  I: "hsl(var(--neon-violet))",
  N: "hsl(var(--neon-pink))",
  G: "hsl(var(--neon-green))",
  O: "hsl(40 90% 55%)",
};

const ANNOUNCER_LINES = [
  "Eyes on the board!",
  "Here we go…",
  "Lucky number coming up!",
  "Could be the winner!",
  "Mark it if you got it!",
  "The crowd holds its breath…",
];

interface Card {
  // 5x5 grid of numbers, center is 0 (free)
  grid: number[];
  marked: boolean[];
  name: string;
  isHuman: boolean;
}

function makeCard(name: string, isHuman: boolean): Card {
  const cols: number[][] = [];
  for (let c = 0; c < 5; c++) {
    const min = c * 15 + 1;
    const pool: number[] = [];
    for (let i = 0; i < 15; i++) pool.push(min + i);
    // pick 5
    const picks: number[] = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    cols.push(picks);
  }
  // flatten row-major
  const grid: number[] = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) grid.push(cols[c][r]);
  // free center
  grid[12] = 0;
  const marked = grid.map((n) => n === 0);
  return { grid, marked, name, isHuman };
}

function checkBingo(marked: boolean[]): boolean {
  // 5 rows
  for (let r = 0; r < 5; r++) {
    if ([0, 1, 2, 3, 4].every((c) => marked[r * 5 + c])) return true;
  }
  // 5 cols
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every((r) => marked[r * 5 + c])) return true;
  }
  // diagonals
  if ([0, 6, 12, 18, 24].every((i) => marked[i])) return true;
  if ([4, 8, 12, 16, 20].every((i) => marked[i])) return true;
  return false;
}

const BOT_NAMES = ["Nova", "Echo", "Pixel", "Volt", "Zara"];

export default function BingoCaller() {
  const [botCount, setBotCount] = useState(2);
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [called, setCalled] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [announce, setAnnounce] = useState<string>("Press CALL NEXT to begin");
  const autoTimerRef = useRef<number | null>(null);

  const remaining = Array.from({ length: MAX }, (_, i) => i + 1).filter((n) => !called.includes(n));

  const start = () => {
    const newCards: Card[] = [makeCard("You", true)];
    for (let i = 0; i < botCount; i++) newCards.push(makeCard(BOT_NAMES[i], false));
    setCards(newCards);
    setCalled([]);
    setCurrent(null);
    setWinner(null);
    setStarted(true);
    setAnnounce("Game on! Press CALL NEXT to start drawing numbers.");
  };

  const reset = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setStarted(false);
    setCards([]);
    setCalled([]);
    setCurrent(null);
    setWinner(null);
    setAnnounce("Press CALL NEXT to begin");
  };

  // Bots auto-mark on each call
  useEffect(() => {
    if (current === null || winner) return;
    setCards((prev) => {
      const next = prev.map((card) => {
        if (card.isHuman) return card; // human marks manually
        const idx = card.grid.indexOf(current);
        if (idx === -1) return card;
        const marked = [...card.marked];
        marked[idx] = true;
        return { ...card, marked };
      });
      // check winners (bots only — human declares manually)
      const botWinner = next.find((c) => !c.isHuman && checkBingo(c.marked));
      if (botWinner) {
        setWinner(botWinner.name);
        setAnnounce(`${botWinner.name} shouts BINGO! Game over.`);
        sounds.tada();
      }
      return next;
    });
  }, [current, winner]);

  const callNext = () => {
    if (rolling || remaining.length === 0 || winner) return;
    setRolling(true);
    sounds.drumroll(700);
    setAnnounce(ANNOUNCER_LINES[Math.floor(Math.random() * ANNOUNCER_LINES.length)]);
    let ticks = 0;
    const interval = setInterval(() => {
      const r = remaining[Math.floor(Math.random() * remaining.length)];
      setCurrent(r);
      ticks++;
      if (ticks > 6) {
        clearInterval(interval);
        const final = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrent(final);
        setCalled((c) => [...c, final]);
        setRolling(false);
        sounds.win();
        setAnnounce(`${letterFor(final)} ${final}!`);
      }
    }, 110);
  };

  const toggleHumanMark = (idx: number) => {
    if (winner) return;
    setCards((prev) => {
      const next = [...prev];
      const human = next[0];
      if (human.grid[idx] === 0) return prev;
      // only allow marking if number was called
      if (!called.includes(human.grid[idx])) return prev;
      const marked = [...human.marked];
      marked[idx] = !marked[idx];
      next[0] = { ...human, marked };
      return next;
    });
  };

  const declareBingo = () => {
    if (!cards[0]) return;
    if (checkBingo(cards[0].marked)) {
      setWinner("You");
      setAnnounce("BINGO! You won — clean card.");
      sounds.tada();
    } else {
      setAnnounce("Not a bingo yet — keep going!");
      sounds.flip();
    }
  };

  const letter = current ? letterFor(current) : "—";
  const color = current ? COLORS[letter] : "hsl(var(--muted-foreground))";

  // ===== Setup screen =====
  if (!started) {
    return (
      <div className="max-w-xl mx-auto space-y-7 animate-fade-in">
        <header className="text-center space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">CLASSIC · VS BOTS</p>
          <h2 className="text-4xl font-display font-black gradient-text">Bingo</h2>
          <p className="text-xs text-muted-foreground">Pick how many AI players you want to face.</p>
        </header>
        <div className="glass-card-highlight p-6 space-y-4 text-center">
          <p className="text-sm text-muted-foreground">AI opponents</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setBotCount(n)}
                className={`spring-btn w-12 h-12 rounded-xl border font-display font-bold ${
                  botCount === n
                    ? "bg-primary/25 border-primary/60 text-primary neon-glow-cyan"
                    : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={start}
            className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 neon-glow-cyan"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  // ===== Game screen =====
  const human = cards[0];
  const bots = cards.slice(1);

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-1">
        <h2 className="text-3xl font-display font-black gradient-text">Bingo</h2>
        <p className="text-xs text-muted-foreground">{called.length}/{MAX} called · {bots.length} bot(s)</p>
      </header>

      {/* Big call display */}
      <div className="glass-card-highlight glass-card-shimmer p-6 flex flex-col items-center gap-2">
        <span className="font-mono text-sm tracking-[0.5em] uppercase" style={{ color }}>{letter}</span>
        <div
          className="font-display font-black text-7xl sm:text-8xl leading-none"
          style={{ color, textShadow: `0 0 30px ${color}` }}
        >
          {current ?? "—"}
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mt-2">📢 {announce}</p>
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={callNext}
          disabled={rolling || remaining.length === 0 || !!winner}
          className="spring-btn px-8 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold hover:bg-primary/30 disabled:opacity-40 neon-glow-cyan"
        >
          {winner ? "GAME OVER" : remaining.length === 0 ? "All Called!" : rolling ? "Calling…" : "CALL NEXT"}
        </button>
        <button
          onClick={declareBingo}
          disabled={!!winner}
          className="spring-btn px-6 py-3 rounded-xl bg-neon-green/20 border border-neon-green/40 text-neon-green font-bold hover:bg-neon-green/30 disabled:opacity-40"
          style={{ color: "hsl(var(--neon-green))" }}
        >
          BINGO!
        </button>
        <button
          onClick={reset}
          className="spring-btn px-6 py-3 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground"
        >
          New Game
        </button>
      </div>

      {winner && (
        <div className="glass-card-highlight p-4 text-center flex items-center justify-center gap-2 animate-scale-in">
          <Trophy className="w-5 h-5 text-neon-cyan" />
          <span className="font-display font-bold text-lg">{winner} won!</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Human card */}
        <div className="glass-card-highlight p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neon-cyan" />
              <span className="font-display font-bold">Your Card</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">tap called numbers to mark</span>
          </div>
          <BingoGrid card={human} called={called} current={current} onCellClick={toggleHumanMark} />
        </div>

        {/* Bot cards */}
        <div className="space-y-3">
          {bots.map((bot, i) => (
            <div key={i} className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-neon-violet" />
                  <span className="font-display font-bold text-sm">{bot.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {bot.marked.filter(Boolean).length}/25 marked
                </span>
              </div>
              <BingoGrid card={bot} called={called} current={current} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BingoGrid({
  card, called, current, compact, onCellClick,
}: {
  card: Card; called: number[]; current: number | null; compact?: boolean;
  onCellClick?: (idx: number) => void;
}) {
  const cellSize = compact ? "text-[10px]" : "text-sm";
  const gridSize = compact ? "gap-1" : "gap-1.5";
  return (
    <div className={`grid grid-cols-5 ${gridSize}`}>
      {(["B", "I", "N", "G", "O"] as const).map((L) => (
        <div
          key={L}
          className={`aspect-square flex items-center justify-center font-display font-black ${compact ? "text-xs" : "text-lg"}`}
          style={{ color: COLORS[L] }}
        >
          {L}
        </div>
      ))}
      {card.grid.map((n, i) => {
        const isFree = n === 0;
        const isMarked = card.marked[i];
        const isCurrent = current !== null && n === current;
        const isCalled = called.includes(n);
        const canClick = onCellClick && !isFree && isCalled;
        return (
          <button
            key={i}
            onClick={canClick ? () => onCellClick!(i) : undefined}
            disabled={!canClick}
            className={`aspect-square rounded-md flex items-center justify-center font-mono ${cellSize} transition-all ${
              isFree
                ? "bg-primary/30 text-primary border border-primary/40"
                : isCurrent
                  ? "bg-primary text-primary-foreground neon-glow-cyan scale-105"
                  : isMarked
                    ? "bg-neon-green/25 text-foreground border border-neon-green/40"
                    : isCalled
                      ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 cursor-pointer"
                      : "bg-muted/30 text-muted-foreground border border-border/20"
            }`}
          >
            {isFree ? "★" : n}
          </button>
        );
      })}
    </div>
  );
}
