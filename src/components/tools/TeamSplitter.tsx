import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { Sliders } from "lucide-react";

const TEAM_COLORS = [
  "hsl(187 94% 43%)", "hsl(263 70% 58%)", "hsl(330 80% 60%)",
  "hsl(150 80% 50%)", "hsl(40 90% 55%)", "hsl(0 80% 58%)",
  "hsl(210 90% 55%)", "hsl(280 80% 65%)",
];

interface Entry { name: string; skill: number; }

export default function TeamSplitter() {
  const [input, setInput] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Entry[][]>([]);
  const [balanced, setBalanced] = useState(false);

  const parse = (): Entry[] => {
    return input
      .split(/[\n,]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // optional :skill suffix, e.g. "Alex:8"
        const m = line.match(/^(.+?):(\d+)$/);
        if (m) return { name: m[1].trim(), skill: Math.min(10, Math.max(1, +m[2])) };
        return { name: line, skill: 5 };
      });
  };

  const split = () => {
    const entries = parse();
    if (entries.length < 2) return;
    if (teamCount > entries.length) return;

    const result: Entry[][] = Array.from({ length: teamCount }, () => []);

    if (balanced) {
      // Sort high → low, snake-draft into teams
      const sorted = [...entries].sort((a, b) => b.skill - a.skill);
      let dir = 1;
      let team = 0;
      for (const e of sorted) {
        result[team].push(e);
        if (dir === 1) {
          if (team === teamCount - 1) dir = -1;
          else team++;
        } else {
          if (team === 0) dir = 1;
          else team--;
        }
      }
    } else {
      const shuffled = [...entries];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      shuffled.forEach((e, i) => result[i % teamCount].push(e));
    }
    setTeams(result);
    sounds.win();
    celebrate("medium");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">SHUFFLE OR BALANCE</p>
        <h2 className="text-4xl font-display font-black gradient-text">Team Splitter</h2>
        <p className="text-xs text-muted-foreground">Tip: add <code className="text-neon-cyan">:skill</code> after a name (e.g. <code className="text-neon-cyan">Alex:8</code>) for balanced mode.</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={"Alex:8\nJordan:5\nSam\nTaylor:9"}
        rows={6}
        className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none font-mono text-sm"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground">Teams:</label>
        <input
          type="number"
          min={2}
          max={20}
          value={teamCount}
          onChange={(e) => setTeamCount(Math.max(2, Math.min(20, +e.target.value || 2)))}
          className="w-16 px-2 py-1.5 rounded-lg bg-muted/50 border border-border/40 text-center font-mono text-sm"
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={balanced}
            onChange={(e) => setBalanced(e.target.checked)}
            className="accent-primary"
          />
          <Sliders className="w-3 h-3" /> Balanced by skill
        </label>
        <button
          onClick={split}
          className="spring-btn ml-auto px-6 py-2.5 rounded-lg bg-primary/20 border border-primary/40 text-primary font-semibold hover:bg-primary/30 neon-glow-cyan"
        >
          Split!
        </button>
      </div>

      {teams.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, i) => {
            const total = team.reduce((a, e) => a + e.skill, 0);
            const color = TEAM_COLORS[i % TEAM_COLORS.length];
            return (
              <div
                key={i}
                className="glass-card p-4 rounded-xl space-y-2 animate-pop-in"
                style={{ borderColor: `${color}40`, boxShadow: `0 0 15px ${color}20` }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold" style={{ color }}>Team {i + 1}</h3>
                  {balanced && <span className="text-[10px] font-mono text-muted-foreground">⚡ {total}</span>}
                </div>
                <ul className="space-y-1">
                  {team.map((e, j) => (
                    <li key={j} className="text-sm text-foreground flex justify-between">
                      <span>{e.name}</span>
                      {balanced && <span className="text-[10px] text-muted-foreground font-mono">{e.skill}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
