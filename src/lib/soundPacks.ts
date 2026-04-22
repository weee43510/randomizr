import { loadFromStorage, saveToStorage } from "./storage";

export type SoundPack = "modern" | "retro" | "silly" | "muted";

export interface SoundPackDef {
  id: SoundPack;
  label: string;
  emoji: string;
  desc: string;
}

export const SOUND_PACKS: SoundPackDef[] = [
  { id: "modern", label: "Modern", emoji: "🔊", desc: "Clean, sine-wave clicks (default)" },
  { id: "retro", label: "Retro 8-bit", emoji: "🎮", desc: "Square waves, low-fi crunch" },
  { id: "silly", label: "Silly", emoji: "🤪", desc: "Boings, slide-whistle, cartoon noise" },
  { id: "muted", label: "Muted", emoji: "🔕", desc: "Almost silent (50% volume)" },
];

export function getSoundPack(): SoundPack {
  return loadFromStorage<SoundPack>("sound_pack", "modern");
}

export function setSoundPack(p: SoundPack) {
  saveToStorage("sound_pack", p);
}

/** Returns adjusted oscillator config per pack. */
export function packConfig(): { type: OscillatorType; volumeMul: number; freqMul: number } {
  const p = getSoundPack();
  switch (p) {
    case "retro":  return { type: "square",   volumeMul: 1.0, freqMul: 0.7 };
    case "silly":  return { type: "sawtooth", volumeMul: 1.0, freqMul: 1.4 };
    case "muted":  return { type: "sine",     volumeMul: 0.3, freqMul: 1.0 };
    default:       return { type: "sine",     volumeMul: 1.0, freqMul: 1.0 };
  }
}
