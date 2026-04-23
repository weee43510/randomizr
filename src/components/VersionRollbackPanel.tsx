import { useState } from "react";
import { Clock, RotateCcw, Trash2, Save, History, ArrowDownToLine } from "lucide-react";
import {
  listSnapshots, takeSnapshot, restoreSnapshot, deleteSnapshot, type VersionSnapshot,
  listVersionTargets, rollbackToVersion,
} from "@/lib/versionHistory";
import { APP_VERSION } from "@/lib/version";
import { toast } from "sonner";

export default function VersionRollbackPanel() {
  const [snaps, setSnaps] = useState<VersionSnapshot[]>(listSnapshots);
  const [label, setLabel] = useState("");
  const [tab, setTab] = useState<"versions" | "snapshots">("versions");
  const targets = listVersionTargets();

  const refresh = () => setSnaps(listSnapshots());

  const create = () => {
    const s = takeSnapshot(label || `v${APP_VERSION} · ${new Date().toLocaleString()}`);
    setLabel("");
    refresh();
    toast.success(`📸 Snapshot saved: ${s.label}`);
  };

  const restore = (id: string) => {
    if (!confirm("Restore this snapshot? Your current data will be replaced.")) return;
    if (restoreSnapshot(id)) {
      toast.success("🔁 Restored — reloading…");
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const remove = (id: string) => {
    deleteSnapshot(id);
    refresh();
  };

  const rollback = (version: string) => {
    if (!confirm(`Roll back to v${version}? This removes data added after that version.\n\nA snapshot of right-now will be saved automatically so you can come back.`)) return;
    if (rollbackToVersion(version)) {
      toast.success(`⏪ Rolled back to v${version} — reloading…`);
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error("Couldn't roll back to that version.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Version Rollback
        </p>
        <p className="text-[11px] text-muted-foreground">
          Roll back to any previous release of Randomizr, or restore a snapshot you took.
        </p>
      </div>

      <div className="flex gap-1 glass-card p-1 w-fit">
        <button
          onClick={() => setTab("versions")}
          className={`spring-btn text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded ${
            tab === "versions" ? "bg-primary/20 text-primary" : "text-muted-foreground"
          }`}
        ><History className="w-3 h-3 inline mr-1" />Any version</button>
        <button
          onClick={() => setTab("snapshots")}
          className={`spring-btn text-[11px] font-mono uppercase tracking-wider px-3 py-1.5 rounded ${
            tab === "snapshots" ? "bg-primary/20 text-primary" : "text-muted-foreground"
          }`}
        ><Save className="w-3 h-3 inline mr-1" />Snapshots</button>
      </div>

      {tab === "versions" && (
        <ul className="space-y-2">
          {targets.map((t) => {
            const isCurrent = t.version === APP_VERSION;
            return (
              <li key={t.version} className="glass-card p-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold flex items-center gap-2">
                    v{t.version}
                    {isCurrent && <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neon-green/20 text-neon-green border border-neon-green/40">CURRENT</span>}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    {t.date} · {t.removes === 0 ? "current shape" : `removes ${t.removes} new keys`}
                  </p>
                </div>
                <button
                  onClick={() => rollback(t.version)}
                  disabled={isCurrent}
                  className="spring-btn inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowDownToLine className="w-3 h-3" /> Roll back
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "snapshots" && (
        <>
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
                <Save className="w-3.5 h-3.5" /> Take
              </button>
            </div>
          </div>

          {snaps.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic glass-card p-3">
              No snapshots yet. Take one above.
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
                  <button onClick={() => restore(s.id)} className="spring-btn inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40">
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                  <button onClick={() => remove(s.id)} className="spring-btn p-1.5 rounded text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
