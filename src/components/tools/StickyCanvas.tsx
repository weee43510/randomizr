import { useEffect, useRef, useState } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { sounds } from "@/lib/sounds";
import { Trash2, Move } from "lucide-react";

interface StickyNote {
  id: string;
  x: number; // canvas-space coords
  y: number;
  color: string;
  text: string;
  createdAt: number;
}

const COLORS = ["#fde68a", "#fca5a5", "#a7f3d0", "#bfdbfe", "#ddd6fe", "#fbcfe8"];
const NOTE_W = 180;
const NOTE_H = 180;

export default function StickyCanvas() {
  // pan offset
  const [pan, setPan] = useState<{ x: number; y: number }>(() => loadFromStorage("sticky_pan", { x: 0, y: 0 }));
  const [notes, setNotes] = useState<StickyNote[]>(() => loadFromStorage<StickyNote[]>("sticky_notes", []));
  const [myNoteId, setMyNoteId] = useState<string | null>(() => loadFromStorage<string | null>("sticky_my_id", null));
  const [draftText, setDraftText] = useState("");
  const [draftColor, setDraftColor] = useState(COLORS[0]);

  const containerRef = useRef<HTMLDivElement>(null);
  const panState = useRef<{ panning: boolean; startX: number; startY: number; origX: number; origY: number }>({
    panning: false, startX: 0, startY: 0, origX: 0, origY: 0,
  });
  const dragState = useRef<{ id: string | null; offX: number; offY: number }>({ id: null, offX: 0, offY: 0 });

  // persist
  useEffect(() => { saveToStorage("sticky_notes", notes); }, [notes]);
  useEffect(() => { saveToStorage("sticky_pan", pan); }, [pan]);
  useEffect(() => { saveToStorage("sticky_my_id", myNoteId); }, [myNoteId]);

  const myNote = notes.find((n) => n.id === myNoteId) || null;

  const placeNote = () => {
    if (myNoteId) return; // only one
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // place near center of current view
    const x = rect.width / 2 - pan.x - NOTE_W / 2;
    const y = rect.height / 2 - pan.y - NOTE_H / 2;
    const note: StickyNote = {
      id: crypto.randomUUID(),
      x, y,
      color: draftColor,
      text: draftText || "Hello!",
      createdAt: Date.now(),
    };
    setNotes((n) => [...n, note]);
    setMyNoteId(note.id);
    sounds.tada();
  };

  const deleteMine = () => {
    if (!myNoteId) return;
    setNotes((n) => n.filter((x) => x.id !== myNoteId));
    setMyNoteId(null);
    setDraftText("");
  };

  const updateMine = (patch: Partial<StickyNote>) => {
    if (!myNoteId) return;
    setNotes((n) => n.map((x) => (x.id === myNoteId ? { ...x, ...patch } : x)));
  };

  // pan handlers
  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-note]")) return;
    panState.current = {
      panning: true,
      startX: e.clientX, startY: e.clientY,
      origX: pan.x, origY: pan.y,
    };
  };
  const onCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragState.current.id) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - pan.x - dragState.current.offX;
      const y = e.clientY - rect.top - pan.y - dragState.current.offY;
      updateMine({ x, y });
      return;
    }
    if (panState.current.panning) {
      const dx = e.clientX - panState.current.startX;
      const dy = e.clientY - panState.current.startY;
      setPan({ x: panState.current.origX + dx, y: panState.current.origY + dy });
    }
  };
  const onCanvasMouseUp = () => {
    panState.current.panning = false;
    dragState.current.id = null;
  };

  const startDragNote = (e: React.MouseEvent, n: StickyNote) => {
    if (n.id !== myNoteId) return;
    e.stopPropagation();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offX = e.clientX - rect.left - pan.x - n.x;
    const offY = e.clientY - rect.top - pan.y - n.y;
    dragState.current = { id: n.id, offX, offY };
  };

  const recenter = () => setPan({ x: 0, y: 0 });

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">CANVAS · ONE NOTE EACH</p>
        <h2 className="text-4xl font-display font-black gradient-text">Sticky Wall</h2>
        <p className="text-xs text-muted-foreground">
          Drag to pan · You get exactly 1 sticky · {notes.length} on the wall
        </p>
      </header>

      {!myNote && (
        <div className="glass-card p-4 max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Color</span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setDraftColor(c)}
                className={`w-6 h-6 rounded-md spring-btn border-2 ${draftColor === c ? "border-foreground" : "border-transparent"}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value.slice(0, 140))}
            placeholder="Write your note (max 140 chars)…"
            className="w-full min-h-[80px] bg-muted/30 rounded-lg p-3 text-sm outline-none border border-border/40 focus:border-neon-cyan/40 resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground font-mono">{draftText.length}/140</span>
            <button
              onClick={placeNote}
              className="spring-btn px-6 py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold hover:bg-primary/30 neon-glow-cyan"
            >
              PLACE STICKY
            </button>
          </div>
        </div>
      )}

      {myNote && (
        <div className="glass-card p-3 max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Move className="w-3 h-3" />
            <span>Your sticky is on the wall — drag to move, edit inline.</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={recenter}
              className="spring-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground"
            >
              Recenter
            </button>
            <button
              onClick={deleteMine}
              className="spring-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/20 border border-destructive/40 text-destructive hover:bg-destructive/30 flex items-center gap-1.5"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onMouseLeave={onCanvasMouseUp}
        className="relative w-full h-[60vh] min-h-[420px] glass-card overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          backgroundImage:
            "radial-gradient(hsla(var(--glass-border) / 0.10) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        >
          {notes.map((n) => {
            const mine = n.id === myNoteId;
            return (
              <div
                key={n.id}
                data-note
                onMouseDown={(e) => startDragNote(e, n)}
                className={`absolute rounded-md p-3 shadow-lg ${mine ? "cursor-move ring-2 ring-neon-cyan/60" : "cursor-default"}`}
                style={{
                  left: n.x,
                  top: n.y,
                  width: NOTE_W,
                  height: NOTE_H,
                  background: n.color,
                  transform: "rotate(-1deg)",
                  boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
                }}
              >
                {mine ? (
                  <textarea
                    value={n.text}
                    onChange={(e) => updateMine({ text: e.target.value.slice(0, 140) })}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full h-full bg-transparent text-neutral-900 text-sm font-medium outline-none resize-none"
                  />
                ) : (
                  <p className="text-neutral-900 text-sm font-medium whitespace-pre-wrap break-words leading-snug">
                    {n.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">Empty wall — place your sticky to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
