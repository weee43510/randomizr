import { useState } from "react";
import { Camera, RotateCcw, Trash2, Save, Clock } from "lucide-react";
import { listSnapshots, takeSnapshot, restoreSnapshot, deleteSnapshot, type VersionSnapshot } from "@/lib/versionHistory";
import { APP_VERSION } from "@/lib/version";
import { toast } from "sonner";

export default function VersionRollbackPanel() {
  const [snaps, setSnaps] = useState<VersionSnapshot[]>(listSnapshots);
  const [label, setLabel] = useState("");

  const refresh = () => setSnaps(listSnapshots());

  const create = () => {
    const s = takeSnapshot(label || `v${APP_VERSION} · ${new Date().toLocaleString()}`);
    setLabel("");
    refresh();
    toast.success(`📸 Snapshot saved: ${s.label}`);
  };

  const restore = (id: string) => {
    if (!confirm("Restore this snapshot? Your current data will be replaced (unsaved snapshots will be lost).")) return;
    if (restoreSnapshot(id)) {
      toast.success("🔁 Restored — reloading…");
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const remove = (id: string) => {
    deleteSnapshot(id);
    refresh();
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Version Rollback
        </p>
        <p className="text-[11px] text-muted-foreground">
          Save a snapshot of your data and restore it later. Useful before big resets or layout changes. Up to 5 snapshots are kept.
        </p>
      </div>

      <div className="glass-card p-3 space-y-2">
        <div className="flex gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={`Label (e.g. before v${APP_VERSION} updates)`}
            className="flex-1 px-3 py-2 rounded-lg bg-muted/40 border border-border/50 text-sm outline-none focus:border-primary/50"
            maxLength={60}
          />
          <button
            onClick={create}
            className="spring-btn inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 font-bold"
          >
            <Save className="w-3.5 h-3.5" /> Snapshot
          </button>
        </div>
      </div>

      {snaps.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic glass-card p-3">
          No snapshots yet. Take one above to enable rollback.
        </p>
      ) : (
        <ul className="space-y-2">
          {snaps.map((s) => (
            <li key={s.id} className="glass-card p-3 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.label}</p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString()} · {Object.keys(s.data).length} items
                </p>
              </div>
              <button
                onClick={() => restore(s.id)}
                className="spring-btn inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40"
              >
                <RotateCcw className="w-3 h-3" /> Restore
              </button>
              <button
                onClick={() => remove(s.id)}
                className="spring-btn p-1.5 rounded text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
