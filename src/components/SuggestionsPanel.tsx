import { useState } from "react";
import { Mail, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

const EMAIL = "weee43510@gmail.com";

export default function SuggestionsPanel() {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!text.trim()) {
      toast.error("Type a suggestion first!");
      return;
    }
    const subject = encodeURIComponent("Randomizr suggestion" + (name ? ` from ${name}` : ""));
    const body = encodeURIComponent(`${text.trim()}\n\n— ${name || "anon"}\n(sent from Randomizr)`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    toast.success("📬 Opening your email app…");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Suggestions
        </p>
        <p className="text-[11px] text-muted-foreground">
          Got an idea? Bug? New game request? Send it straight to Elias.
        </p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50"
          maxLength={40}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would make Randomizr better?"
          rows={5}
          maxLength={1000}
          className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50 resize-y"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1">
            <Mail className="w-3 h-3" /> {EMAIL}
          </span>
          <button
            onClick={send}
            className="spring-btn inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold"
          >
            <Send className="w-3.5 h-3.5" /> {sent ? "Sent!" : "Send"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          This opens your email app pre-filled. Hit send there to deliver it.
        </p>
      </div>
    </div>
  );
}
