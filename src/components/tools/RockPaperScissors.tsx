import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

type Choice = "rock" | "paper" | "scissors";
type Outcome = "win" | "lose" | "draw";

const CHOICES: { id: Choice; emoji: string; label: string }[] = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

function judge(player: Choice, ai: Choice): Outcome {
  if (player === ai) return "draw";
  if (
    (player === "rock" && ai === "scissors") ||
    (player === "paper" && ai === "rock") ||
    (player === "scissors" && ai === "paper")
  )
    return "win";
  return "lose";
}

interface Score {
  wins: number;
  losses: number;
  draws: number;
}

export default function RockPaperScissors() {
  const [score, setScore] = useState<Score>(() =>
    loadFromStorage<Score>("rps_score", { wins: 0, losses: 0, draws: 0 })
  );
  const [history, setHistory] = useState<Choice[]>(() =>
    loadFromStorage<Choice[]>("rps_history", [])
  );
  const [round, setRound] = useState<{
    player: Choice;
    ai: Choice;
    outcome: Outcome;
  } | null>(null);
  const [thinking, setThinking] = useState(false);

  // Tiny "AI": predicts your next move from your most-frequent past move
  // and counters it. Falls back to random.
  const predict = (): Choice => {
    if (history.length < 3 || Math.random() < 0.25) {
      return CHOICES[Math.floor(Math.random() * 3)].id;
    }
    const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
    history.slice(-8).forEach((c) => counts[c]++);
    const guess = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as Choice;
    // counter the guessed move
    if (guess === "rock") return "paper";
    if (guess === "paper") return "scissors";
    return "rock";
  };

  const play = (player: Choice) => {
    if (thinking) return;
    setThinking(true);
    setRound(null);
    sounds.drumroll(600);
    setTimeout(() => {
      const ai = predict();
      const outcome = judge(player, ai);
      setRound({ player, ai, outcome });
      const nextScore: Score = {
        wins: score.wins + (outcome === "win" ? 1 : 0),
        losses: score.losses + (outcome === "lose" ? 1 : 0),
        draws: score.draws + (outcome === "draw" ? 1 : 0),
      };
      const nextHistory = [...history, player].slice(-20);
      setScore(nextScore);
      setHistory(nextHistory);
      saveToStorage("rps_score", nextScore);
      saveToStorage("rps_history", nextHistory);
      setThinking(false);
      sounds.win();
    }, 600);
  };

  const reset = () => {
    const empty: Score = { wins: 0, losses: 0, draws: 0 };
    setScore(empty);
    setHistory([]);
    setRound(null);
    saveToStorage("rps_score", empty);
    saveToStorage("rps_history", []);
  };

  const outcomeColor =
    round?.outcome === "win"
      ? "text-neon-green"
      : round?.outcome === "lose"
        ? "text-destructive"
        : "text-muted-foreground";

  const outcomeLabel =
    round?.outcome === "win" ? "YOU WIN" : round?.outcome === "lose" ? "YOU LOSE" : "DRAW";

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold gradient-text">Rock · Paper · Scissors</h2>
        <p className="text-sm text-muted-foreground">vs. an AI that learns your patterns 🧠</p>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Wins", value: score.wins, color: "text-neon-green" },
          { label: "Draws", value: score.draws, color: "text-muted-foreground" },
          { label: "Losses", value: score.losses, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
            <p className={`font-display font-black text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Arena */}
      <div className="glass-card-highlight glass-card-shimmer min-h-[180px] p-6 flex items-center justify-around">
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">You</p>
          <div className="text-6xl">
            {round ? CHOICES.find((c) => c.id === round.player)!.emoji : "❔"}
          </div>
        </div>

        <div className="text-center">
          {thinking ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          ) : round ? (
            <p className={`font-display font-black text-xl ${outcomeColor}`}>{outcomeLabel}</p>
          ) : (
            <p className="text-xs text-muted-foreground font-mono">VS</p>
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">AI</p>
          <div className="text-6xl">
            {round ? CHOICES.find((c) => c.id === round.ai)!.emoji : "🤖"}
          </div>
        </div>
      </div>

      {/* Choices */}
      <div className="grid grid-cols-3 gap-3">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            onClick={() => play(c.id)}
            disabled={thinking}
            className="spring-btn glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/50 disabled:opacity-50"
          >
            <span className="text-4xl">{c.emoji}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={reset}
          className="spring-btn text-xs text-muted-foreground hover:text-destructive font-mono uppercase tracking-wider"
        >
          Reset Score
        </button>
      </div>
    </div>
  );
}
