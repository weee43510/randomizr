import { DEV_NOTES } from "@/lib/devNotes";
import { Coffee } from "lucide-react";

export default function DevNotesPanel() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Coffee className="w-3.5 h-3.5" /> Developer Notes
        </p>
        <p className="text-[11px] text-muted-foreground">
          Behind-the-scenes thoughts from Elias on what's been built and why.
        </p>
      </div>
      <ul className="space-y-2">
        {DEV_NOTES.slice().reverse().map((n, i) => (
          <li key={i} className="glass-card p-3 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xl">{n.mood}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{n.date}</span>
            </div>
            <p className="font-display font-bold text-sm">{n.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
