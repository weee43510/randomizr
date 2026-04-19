import { useState } from "react";
import { sounds } from "@/lib/sounds";

export default function TeamSplitter() {
  const [input, setInput] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);

  const split = () => {
    const names = input.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
    if (names.length < 2) return;

    // Shuffle
    for (let i = names.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [names[i], names[j]] = [names[j], names[i]];
    }

    const result: string[][] = Array.from({ length: teamCount }, () => []);
    names.forEach((name, i) => result[i % teamCount].push(name));
    setTeams(result);
    sounds.win();
  };

  const TEAM_COLORS = ["hsl(187 94% 43%)", "hsl(263 70% 58%)", "hsl(330 80% 60%)", "hsl(150 80% 50%)", "hsl(40 90% 55%)"];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold neon-text-cyan">Smart Team Splitter</h2>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter names (one per line, or comma-separated)..."
        rows={5}
        className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
      />

      <div className="flex items-center gap-4">
        <label className="text-sm text-muted-foreground">Teams:</label>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setTeamCount(n)}
              className={`spring-btn w-9 h-9 rounded-lg text-sm font-bold ${
                teamCount === n ? "bg-primary/30 text-primary border border-primary/50 neon-glow-cyan" : "bg-muted/40 text-muted-foreground border border-border/30 hover:bg-muted/60"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={split}
          className="spring-btn ml-auto px-6 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary font-semibold hover:bg-primary/30 neon-glow-cyan"
        >
          Split!
        </button>
      </div>

      {teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {teams.map((team, i) => (
            <div
              key={i}
              className="glass-card p-4 rounded-xl space-y-2 animate-scale-in"
              style={{ borderColor: `${TEAM_COLORS[i % TEAM_COLORS.length]}40`, boxShadow: `0 0 15px ${TEAM_COLORS[i % TEAM_COLORS.length]}20` }}
            >
              <h3 className="text-sm font-bold" style={{ color: TEAM_COLORS[i % TEAM_COLORS.length] }}>
                Team {i + 1}
              </h3>
              <ul className="space-y-1">
                {team.map((name, j) => (
                  <li key={j} className="text-sm text-foreground">{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
