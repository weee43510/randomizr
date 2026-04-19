import { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { toPng } from "html-to-image";
import { sounds } from "@/lib/sounds";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

interface TierItem {
  id: string;
  label: string;
  image?: string;
}

interface Tier {
  id: string;
  label: string;
  color: string;
  items: TierItem[];
}

const DEFAULT_TIERS: Tier[] = [
  { id: "s", label: "S", color: "hsl(0, 80%, 50%)", items: [] },
  { id: "a", label: "A", color: "hsl(30, 90%, 50%)", items: [] },
  { id: "b", label: "B", color: "hsl(50, 90%, 50%)", items: [] },
  { id: "c", label: "C", color: "hsl(150, 70%, 40%)", items: [] },
  { id: "d", label: "D", color: "hsl(210, 70%, 50%)", items: [] },
  { id: "unranked", label: "Unranked", color: "hsl(230, 15%, 25%)", items: [] },
];

export default function RankingBoard() {
  const [tiers, setTiers] = useState<Tier[]>(() => loadFromStorage("ranking_tiers", DEFAULT_TIERS));
  const [newItem, setNewItem] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);

  const save = (t: Tier[]) => { setTiers(t); saveToStorage("ranking_tiers", t); };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = tiers.map(t => t.id === "unranked" ? { ...t, items: [...t.items, { id: Date.now().toString(), label: newItem.trim() }] } : t);
    save(updated);
    setNewItem("");
    sounds.click();
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const updated = tiers.map(t => t.id === "unranked" ? { ...t, items: [...t.items, { id: Date.now().toString(), label: file.name.split(".")[0], image: e.target?.result as string }] } : t);
      save(updated);
    };
    reader.readAsDataURL(file);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const newTiers = [...tiers];
    const srcTier = newTiers.find(t => t.id === source.droppableId)!;
    const destTier = newTiers.find(t => t.id === destination.droppableId)!;

    const [moved] = srcTier.items.splice(source.index, 1);
    destTier.items.splice(destination.index, 0, moved);

    save(newTiers);
    sounds.click();
  };

  const downloadPng = async () => {
    if (!boardRef.current) return;
    try {
      const url = await toPng(boardRef.current, { backgroundColor: "#0f1420" });
      const a = document.createElement("a");
      a.href = url;
      a.download = "tier-list.png";
      a.click();
      sounds.win();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">DRAG · DROP · EXPORT</p>
          <h2 className="text-3xl font-display font-black gradient-text">Ranking Board</h2>
        </div>
        <button onClick={downloadPng} className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/30 transition-all">
          📥 Download PNG
        </button>
      </div>

      {/* Add items */}
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add item..."
          className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
        <button onClick={addItem} className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-sm font-semibold">+</button>
        <label className="px-3 py-2 rounded-lg bg-accent/20 text-accent text-sm font-semibold cursor-pointer hover:bg-accent/30">
          📷
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
        </label>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div ref={boardRef} className="space-y-1">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex rounded-lg overflow-hidden border border-border/30">
              <div
                className="w-16 sm:w-20 flex items-center justify-center font-bold text-lg shrink-0"
                style={{ backgroundColor: tier.color, color: "white", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {tier.label}
              </div>
              <Droppable droppableId={tier.id} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-wrap gap-1 p-2 min-h-[56px] transition-colors ${snapshot.isDraggingOver ? "bg-muted/40" : "bg-muted/20"}`}
                  >
                    {tier.items.map((item, idx) => (
                      <Draggable key={item.id} draggableId={item.id} index={idx}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className="w-12 h-12 rounded-md flex items-center justify-center text-[10px] font-medium text-foreground overflow-hidden border border-border/30"
                            style={{
                              ...prov.draggableProps.style,
                              backgroundColor: item.image ? "transparent" : "hsl(var(--muted))",
                            }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-center px-0.5 truncate">{item.label}</span>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
