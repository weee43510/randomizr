import { useState } from "react";
import { Mail, Send, Sparkles, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const EMAIL = "weee43510@gmail.com";

interface Suggestion { id: string; name: string; text: string; category: string; ts: number; sent: boolean; }

const CATEGORIES = ["💡 Idea", "🐛 Bug", "🎮 New game", "🎨 Theme", "❓ Other"] as const;

export default function SuggestionsPanel() {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [list, setList] = useState<Suggestion[]>(() => loadFromStorage<Suggestion[]>("suggestions_local", []));

  const remaining = 1000 - text.length;

  const save = () => {
    if (!text.trim()) { toast.error("Type something first!"); return; }
    const s: Suggestion = {
      id: `s_${Date.now()}`,
      name: name.trim() || "anon",
      text: text.trim(),
      category,
      ts: Date.now(),
      sent: false,
    };
    const next = [s, ...list].slice(0, 20);
    setList(next);
    saveToStorage("suggestions_local", next);
    setText("");
    toast.success("💾 Saved locally — now hit 'Send via email' or 'Copy' to deliver it.");
  };

  const sendEmail = (s: Suggestion) => {
    const subject = encodeURIComponent(`[${s.category}] Randomizr — from ${s.name}`);
    const body = encodeURIComponent(`${s.text}\n\n— ${s.name}\nSent: ${new Date(s.ts).toLocaleString()}`);
    window.open(`mailto:${EMAIL}?subject=${subject}&body=${body}`, "_blank");
    markSent(s.id);
  };

  const copy = async (s: Suggestion) => {
    const txt = `[${s.category}] from ${s.name}\n\n${s.text}\n\n→ paste to ${EMAIL}`;
    try {
      await navigator.clipboard.writeText(txt);
      toast.success("📋 Copied — paste it into your email or DM");
      markSent(s.id);
    } catch {
      toast.error("Couldn't copy. Try the email button.");
    }
  };

  const markSent = (id: string) => {
    const next = list.map((s) => s.id === id ? { ...s, sent: true } : s);
    setList(next);
    saveToStorage("suggestions_local", next);
  };

  const remove = (id: string) => {
    const next = list.filter((s) => s.id !== id);
    setList(next);
    saveToStorage("suggestions_local", next);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Suggestions
        </p>
        <p className="text-[11px] text-muted-foreground">
          Save your ideas here. Use <span className="font-mono text-foreground">Send</span> to email, or <span className="font-mono text-foreground">Copy</span> if email's broken.
        </p>
      </div>

      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50"
            maxLength={40}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          placeholder="What would make Randomizr better?"
          rows={5}
          className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50 resize-y"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1">
            <Mail className="w-3 h-3" /> {EMAIL} · {remaining} left
          </span>
          <button
            onClick={save}
            className="spring-btn inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {list.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Your saved suggestions ({list.length})
          </p>
          {list.map((s) => (
            <div key={s.id} className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                <span>{s.category} · {s.name} · {new Date(s.ts).toLocaleString()}</span>
                {s.sent && <span className="text-neon-green inline-flex items-center gap-1"><Check className="w-3 h-3" />sent</span>}
              </div>
              <p className="text-sm whitespace-pre-wrap">{s.text}</p>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => sendEmail(s)} className="spring-btn inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40">
                  <Send className="w-3 h-3" /> Email
                </button>
                <button onClick={() => copy(s)} className="spring-btn inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-muted/40 border border-border/40">
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button onClick={() => remove(s.id)} className="spring-btn text-[11px] px-2.5 py-1 rounded text-destructive hover:bg-destructive/10">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
