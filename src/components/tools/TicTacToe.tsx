import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { RotateCcw, Bot, User } from "lucide-react";

type Cell = "X" | "O" | null;
type Difficulty = "easy" | "normal" | "impossible";

const LINES: number[][] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function winner(b: Cell[]): Cell | "draw" | null {
  for (const l of LINES) {
    const [a,c,d] = l;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(Boolean)) return "draw";
  return null;
}

function minimax(b: Cell[], turn: "X"|"O", me: "X"|"O"): { score: number; idx: number } {
  const w = winner(b);
  if (w === me) return { score: 10, idx: -1 };
  if (w && w !== "draw") return { score: -10, idx: -1 };
  if (w === "draw") return { score: 0, idx: -1 };
  let best = { score: turn === me ? -Infinity : Infinity, idx: -1 };
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    const next = b.slice();
    next[i] = turn;
    const r = minimax(next, turn === "X" ? "O" : "X", me);
    if (turn === me ? r.score > best.score : r.score < best.score) best = { score: r.score, idx: i };
  }
  return best;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [diff, setDiff] = useState<Difficulty>(() => loadFromStorage("ttt_diff", "normal" as Difficulty));
  const [score, setScore] = useState(() => loadFromStorage("ttt_score", { w: 0, l: 0, d: 0 }));
  const [turn, setTurn] = useState<"X"|"O">("X");

  const w = winner(board);

  useEffect(() => { saveToStorage("ttt_diff", diff); }, [diff]);
  useEffect(() => { saveToStorage("ttt_score", score); }, [score]);

  // AI move
  useEffect(() => {
    if (turn !== "O" || w) return;
    const t = setTimeout(() => {
      const open = board.map((c, i) => c ? -1 : i).filter((i) => i >= 0);
      if (!open.length) return;
      let pick: number;
      if (diff === "easy" || (diff === "normal" && Math.random() < 0.4)) {
        pick = open[Math.floor(Math.random() * open.length)];
      } else {
        pick = minimax(board, "O", "O").idx;
        if (pick < 0) pick = open[0];
      }
      const next = board.slice();
      next[pick] = "O";
      setBoard(next);
      setTurn("X");
      sounds.click();
    }, 350);
    return () => clearTimeout(t);
  }, [turn, board, w, diff]);

  // Result
  useEffect(() => {
    if (!w) return;
    if (w === "X") { setScore((s) => ({ ...s, w: s.w + 1 })); celebrate("medium"); sounds.win(); }
    else if (w === "O") { setScore((s) => ({ ...s, l: s.l + 1 })); sounds.lose(); }
    else { setScore((s) => ({ ...s, d: s.d + 1 })); }
  }, [w]);

  const tap = (i: number) => {
    if (board[i] || w || turn !== "X") return;
    const next = board.slice();
    next[i] = "X";
    setBoard(next);
    setTurn("O");
    sounds.click();
  };

  const reset = () => { setBoard(Array(9).fill(null)); setTurn("X"); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">PARTY · NEW</p>
        <h1 className="font-display font-black text-4xl gradient-text">Tic-Tac-Toe</h1>
        <p className="text-sm text-muted-foreground mt-1">You're <span className="text-neon-cyan font-bold">X</span>. Beat the bot.</p>
      </div>

      <div className="flex gap-2">
        {(["easy","normal","impossible"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => { setDiff(d); reset(); }}
            className={`spring-btn px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
              diff === d ? "bg-primary/20 text-primary border-2 border-primary/50" : "bg-muted/30 text-muted-foreground border-2 border-transparent"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="glass-card p-4 max-w-sm mx-auto">
        <div className="grid grid-cols-3 gap-2">
          {board.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              className="aspect-square spring-btn rounded-xl bg-muted/30 border border-border/40 text-5xl font-display font-black flex items-center justify-center hover:bg-muted/50"
            >
              <span className={c === "X" ? "text-neon-cyan" : c === "O" ? "text-neon-pink" : ""}>
                {c}
              </span>
            </button>
          ))}
        </div>

        {w && (
          <div className="mt-4 text-center space-y-2 animate-pop-in">
            <p className="font-display font-bold text-2xl">
              {w === "X" ? "🎉 You win!" : w === "O" ? "🤖 Bot wins" : "🤝 Draw"}
            </p>
            <button onClick={reset} className="spring-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 text-sm font-bold">
              <RotateCcw className="w-4 h-4" /> Play again
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto text-center">
        <div className="glass-card p-2"><User className="w-4 h-4 mx-auto text-neon-cyan" /><p className="text-[10px] font-mono uppercase mt-1">You</p><p className="font-display font-bold text-xl">{score.w}</p></div>
        <div className="glass-card p-2"><span className="text-base">🤝</span><p className="text-[10px] font-mono uppercase mt-1">Draws</p><p className="font-display font-bold text-xl">{score.d}</p></div>
        <div className="glass-card p-2"><Bot className="w-4 h-4 mx-auto text-neon-pink" /><p className="text-[10px] font-mono uppercase mt-1">Bot</p><p className="font-display font-bold text-xl">{score.l}</p></div>
      </div>
    </div>
  );
}
