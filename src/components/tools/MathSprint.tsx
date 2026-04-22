import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Calculator, Play, RotateCcw } from "lucide-react";

type Op = "+" | "-" | "×";

interface Problem { a: number; b: number; op: Op; answer: number; choices: number[]; }

function makeProblem(level: number): Problem {
  const ops: Op[] = level < 5 ? ["+", "-"] : ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const cap = op === "×" ? 12 : 20 + level * 3;
  const a = 1 + Math.floor(Math.random() * cap);
  const b = 1 + Math.floor(Math.random() * cap);
  const [x, y] = op === "-" && b > a ? [b, a] : [a, b];
  const answer = op === "+" ? x + y : op === "-" ? x - y : x * y;
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const delta = Math.floor((Math.random() - 0.5) * 12) || 1;
    const c = answer + delta;
    if (c >= 0) choices.add(c);
  }
  return { a: x, b: y, op, answer, choices: Array.from(choices).sort(() => Math.random() - 0.5) };
}

export default function MathSprint() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [problem, setProblem] = useState<Problem>(() => makeProblem(1));
  const [picked, setPicked] = useState<number | null>(null);
  const [best, setBest] = useState<number>(() => loadFromStorage("mathsprint_best", 0));

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      if (score > best) { setBest(score); saveToStorage("mathsprint_best", score); celebrate("medium"); }
      sounds.win();
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, running]);

  const answer = (val: number) => {
    if (picked !== null) return;
    setPicked(val);
    if (val === problem.answer) {
      sounds.click();
      setScore((s) => s + 1 + Math.floor(streak / 3));
      setStreak((s) => s + 1);
      setTime((t) => Math.min(60, t + 1)); // +1s per correct
    } else {
      sounds.flip();
      setStreak(0);
    }
    setTimeout(() => {
      setPicked(null);
      setProblem(makeProblem(Math.min(10, 1 + Math.floor(score / 5))));
    }, 250);
  };

  const start = () => {
    setRunning(true); setScore(0); setStreak(0); setTime(60);
    setProblem(makeProblem(1)); setPicked(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground inline-flex items-center gap-2">
          <Calculator className="w-3 h-3" /> +1S PER CORRECT
        </p>
        <h2 className="text-4xl font-display font-black gradient-text">Math Sprint</h2>
        <p className="text-xs text-muted-foreground">Solve as many as you can. Difficulty ramps with score.</p>
      </header>

      <div className="flex justify-center gap-6 text-sm font-mono">
        <span>⏱ <b>{time}s</b></span>
        <span>Score: <b className="neon-text-cyan">{score}</b></span>
        <span>Streak: <b>{streak}</b></span>
        <span className="text-muted-foreground">Best: {best}</span>
      </div>

      {!running ? (
        <div className="glass-card-highlight p-10 text-center">
          <button
            onClick={start}
            className="spring-btn px-8 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold neon-glow-cyan inline-flex items-center gap-2"
          >
            {time === 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {time === 0 ? "AGAIN" : "START"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card-highlight p-8 text-center">
            <p className="text-5xl font-display font-black tracking-tight">
              {problem.a} <span className="text-muted-foreground">{problem.op}</span> {problem.b}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {problem.choices.map((c) => {
              const isCorrect = picked !== null && c === problem.answer;
              const isWrong = picked === c && c !== problem.answer;
              return (
                <button
                  key={c}
                  onClick={() => answer(c)}
                  disabled={picked !== null}
                  className={`spring-btn p-4 rounded-xl border text-xl font-bold ${
                    picked === null ? "glass-card hover:border-neon-cyan/40"
                    : isCorrect ? "border-neon-green/60 bg-neon-green/10"
                    : isWrong ? "border-destructive/60 bg-destructive/10"
                    : "glass-card opacity-50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
