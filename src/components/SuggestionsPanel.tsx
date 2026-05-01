import { useEffect, useState } from "react";
import { Sparkles, Trash2, ThumbsUp, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

interface WallPost {
  id: string;
  name: string;
  text: string;
  category: string;
  ts: number;
  likes: number;
  likedBy?: string[]; // local user ids
}

const CATEGORIES = ["💡 Idea", "🐛 Bug", "🎮 New game", "🎨 Theme", "❓ Other"] as const;
const KEY = "suggestions_wall_v1";
const ME_KEY = "suggestions_me_v1";

function getMe(): string {
  let me = loadFromStorage<string>(ME_KEY, "");
  if (!me) {
    me = `u_${Math.random().toString(36).slice(2, 10)}`;
    saveToStorage(ME_KEY, me);
  }
  return me;
}

const STARTERS: WallPost[] = [
  { id: "s_starter1", name: "Elias", text: "Welcome to the Suggestions Wall! Drop ideas, vote on others — the most-liked ones get built first. ❤️", category: "💡 Idea", ts: Date.now() - 86400000, likes: 12, likedBy: [] },
  { id: "s_starter2", name: "anon", text: "More casino exclusives please — a Plinko-style game would be amazing!", category: "🎮 New game", ts: Date.now() - 43200000, likes: 7, likedBy: [] },
  { id: "s_starter3", name: "anon", text: "Add a 'pastel' theme that's softer on the eyes for long sessions.", category: "🎨 Theme", ts: Date.now() - 7200000, likes: 4, likedBy: [] },
];

function loadWall(): WallPost[] {
  const w = loadFromStorage<WallPost[]>(KEY, []);
  if (w.length === 0) {
    saveToStorage(KEY, STARTERS);
    return STARTERS;
  }
  return w;
}

export default function SuggestionsPanel() {
  const me = getMe();
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [posts, setPosts] = useState<WallPost[]>(loadWall);
  const [sort, setSort] = useState<"new" | "top">("top");

  useEffect(() => { saveToStorage(KEY, posts); }, [posts]);

  const post = () => {
    if (!text.trim()) { toast.error("Type something first!"); return; }
    const p: WallPost = {
      id: `s_${Date.now()}`,
      name: name.trim() || "anon",
      text: text.trim().slice(0, 500),
      category, ts: Date.now(), likes: 0, likedBy: [],
    };
    setPosts((cur) => [p, ...cur].slice(0, 200));
    setText("");
    toast.success("📌 Posted to the wall!");
  };

  const like = (id: string) => {
    setPosts((cur) => cur.map((p) => {
      if (p.id !== id) return p;
      const liked = p.likedBy || [];
      if (liked.includes(me)) {
        return { ...p, likes: Math.max(0, p.likes - 1), likedBy: liked.filter((x) => x !== me) };
      }
      return { ...p, likes: p.likes + 1, likedBy: [...liked, me] };
    }));
  };

  const remove = (id: string) => {
    setPosts((cur) => cur.filter((p) => p.id !== id));
  };

  const sorted = [...posts].sort((a, b) =>
    sort === "top" ? (b.likes - a.likes) || (b.ts - a.ts) : b.ts - a.ts
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" /> Suggestions Wall
        </p>
        <p className="text-[11px] text-muted-foreground">
          Public board · post ideas, vote on others. Most-liked rise to the top.
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
          onChange={(e) => setText(e.target.value.slice(0, 500))}
          placeholder="Share an idea, bug, or vibe…"
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50 resize-y"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">{500 - text.length} chars left</span>
          <button onClick={post} className="spring-btn inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Post to wall
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{posts.length} posts</p>
        <div className="flex gap-1">
          {(["top", "new"] as const).map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`spring-btn text-[10px] font-mono uppercase px-2 py-1 rounded ${
              sort === s ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}>{s === "top" ? "🔥 Top" : "🕐 New"}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((p) => {
          const mine = (p.likedBy || []).includes(me);
          return (
            <div key={p.id} className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
                <span>{p.category} · <span className="text-foreground">{p.name}</span> · {new Date(p.ts).toLocaleString()}</span>
                <button onClick={() => remove(p.id)} className="spring-btn p-1 hover:text-destructive" aria-label="Remove">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{p.text}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => like(p.id)}
                  className={`spring-btn inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                    mine ? "bg-neon-pink/20 text-neon-pink border-neon-pink/40" : "bg-muted/30 text-muted-foreground border-border/40 hover:text-foreground"
                  }`}
                >
                  <ThumbsUp className={`w-3 h-3 ${mine ? "fill-current" : ""}`} /> {p.likes}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
