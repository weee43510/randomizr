import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { TRIVIA, type TriviaQuestion } from "@/data/trivia";
import { pickNoRepeat, resetNoRepeat, noRepeatStats } from "@/lib/noRepeat";
import { RotateCcw, Check, X } from "lucide-react";

type Cat = TriviaQuestion["category"] | "All";
const CATS: Cat[] = ["All", "General", "Science", "History", "Pop Culture", "Geography", "Sports"];

export default function TriviaQuiz() {
  const [cat, setCat] = useState<Cat>("All");
  const [q, setQ] = useState<TriviaQuestion | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [, setTick] = useState(0);

  const pool = cat === "All" ? TRIVIA : TRIVIA.filter((t) => t.category === cat);
  const key = `trivia_${cat}`;
  const stats = noRepeatStats(key, pool.length);

  const next = () => {
    if (pool.length === 0) return;
    const { item } = pickNoRepeat(key, pool);
    setQ(item);
    setPicked(null);
    setTick((t) => t + 1);
  };

  const answer = (idx: number) => {
    if (picked !== null || !q) return;
    setPicked(idx);
    const correct = idx === q.answer;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) sounds.tada();
    else sounds.flip();
  };

  const reset = () => {
    CATS.forEach((c) => resetNoRepeat(`trivia_${c}`));
    setQ(null);
    setPicked(null);
    setScore({ correct: 0, total: 0 });
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">QUIZ · NO REPEATS</p>
        <h2 className="text-4xl font-display font-black gradient-text">Trivia</h2>
        <p className="text-xs text-muted-foreground">
          Score {score.correct}/{score.total} · {stats.remaining} questions left in {cat}
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {CATS.map((c) => {
          const active = cat === c;
          return (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setQ(null);
                setPicked(null);
              }}
              className={`spring-btn px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                active
                  ? "bg-primary/25 border-primary/60 text-primary"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {!q ? (
        <div className="glass-card-highlight p-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">Pick a category and start the quiz.</p>
          <button
            onClick={next}
            className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 neon-glow-cyan"
          >
            START
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card-highlight glass-card-shimmer p-6 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] neon-text-cyan">{q.category}</span>
            <p className="text-lg font-display font-semibold leading-snug">{q.question}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            {q.choices.map((c, i) => {
              const isCorrect = picked !== null && i === q.answer;
              const isWrong = picked === i && i !== q.answer;
              const cls =
                picked === null
                  ? "glass-card hover:border-neon-cyan/40"
                  : isCorrect
                    ? "border-neon-green/60 bg-neon-green/10 text-foreground"
                    : isWrong
                      ? "border-destructive/60 bg-destructive/10 text-foreground"
                      : "glass-card opacity-60";
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  disabled={picked !== null}
                  className={`spring-btn p-4 text-left rounded-xl border flex items-center justify-between gap-3 ${cls}`}
                >
                  <span className="text-sm font-medium">{c}</span>
                  {isCorrect && <Check className="w-4 h-4 text-neon-green" />}
                  {isWrong && <X className="w-4 h-4 text-destructive" />}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={next}
              disabled={picked === null}
              className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 disabled:opacity-40 neon-glow-cyan"
            >
              NEXT
            </button>
            <button
              onClick={reset}
              title="Reset all decks + score"
              className="spring-btn px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
