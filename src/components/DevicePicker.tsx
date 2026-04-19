import { Monitor, Tablet, Smartphone } from "lucide-react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

export type DeviceType = "desktop" | "tablet" | "mobile";

const devices = [
  { id: "desktop" as DeviceType, label: "Desktop", icon: Monitor, desc: "Full sidebar navigation" },
  { id: "tablet" as DeviceType, label: "Tablet", icon: Tablet, desc: "Compact sidebar" },
  { id: "mobile" as DeviceType, label: "Mobile", icon: Smartphone, desc: "Bottom navigation" },
];

export function getStoredDevice(): DeviceType | null {
  return loadFromStorage<DeviceType | null>("device_type", null);
}

interface Props {
  onSelect: (device: DeviceType) => void;
}

export default function DevicePicker({ onSelect }: Props) {
  const handleSelect = (device: DeviceType) => {
    saveToStorage("device_type", device);
    onSelect(device);
  };

  return (
    <div className="gradient-bg-animated min-h-screen flex items-center justify-center p-6">
      <div className="glass-card-highlight p-8 max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="neon-text-cyan font-serif text-4xl font-extrabold my-0 mx-0 px-0 border-4 border-solid">Randomizr</h1>
          <p className="text-sm text-muted-foreground">Choose your device for the best experience</p>
        </div>

        <div className="grid gap-3">
          {devices.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => handleSelect(d.id)}
                className="spring-btn glass-card flex items-center gap-4 p-4 hover:border-neon-cyan/30 group text-left"
              >
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground">You can change this later in Settings</p>
      </div>
    </div>
  );
}
