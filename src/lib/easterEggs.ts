import { useEffect } from "react";
import { emojiRain } from "./confetti";
import { applyTheme, type ThemeId } from "./theme";
import { saveToStorage, loadFromStorage } from "./storage";
import { toast } from "sonner";

const KONAMI = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];

export function isRainbowUnlocked(): boolean {
  return loadFromStorage<boolean>("rainbow_unlocked", false);
}

export function isDevMode(): boolean {
  return loadFromStorage<boolean>("dev_mode", false);
}

export function setDevMode(v: boolean) {
  saveToStorage("dev_mode", v);
}

/** Listen for the Konami code globally. */
export function useKonamiCode(onUnlock: () => void) {
  useEffect(() => {
    let buf: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      buf.push(key);
      if (buf.length > KONAMI.length) buf = buf.slice(-KONAMI.length);
      if (buf.length === KONAMI.length && buf.every((k, i) => k === KONAMI[i])) {
        if (!isRainbowUnlocked()) {
          saveToStorage("rainbow_unlocked", true);
          toast.success("🌈 RAINBOW THEME UNLOCKED!", { description: "Open Settings to switch." });
          emojiRain("🌈", 40);
          onUnlock();
        } else {
          toast("🌈 Rainbow already unlocked — apply it in Settings.");
        }
        buf = [];
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as any);
  }, [onUnlock]);
}

/** Rainbow theme is special — applied dynamically. */
export function applyRainbowTheme() {
  // Cycle hues fast
  const root = document.documentElement;
  const hue = (Date.now() / 30) % 360;
  root.style.setProperty("--primary", `${hue} 90% 60%`);
  root.style.setProperty("--accent", `${(hue + 120) % 360} 90% 60%`);
  root.style.setProperty("--secondary", `${(hue + 240) % 360} 90% 60%`);
  root.style.setProperty("--neon-cyan", `${hue} 95% 60%`);
  root.style.setProperty("--neon-violet", `${(hue + 90) % 360} 95% 60%`);
  root.style.setProperty("--neon-pink", `${(hue + 180) % 360} 95% 60%`);
  root.style.setProperty("--ring", `${hue} 95% 60%`);
}

/** Trigger fullscreen "matrix" code rain for 5 seconds. */
export function matrixRainOverlay() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;z-index:9999;pointer-events:none;background:rgba(0,0,0,0.85)";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize();
  const fontSize = 18;
  const cols = Math.floor(canvas.width / fontSize);
  const drops = Array(cols).fill(0);
  const chars = "ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789";
  let frame = 0;
  const id = setInterval(() => {
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f0";
    ctx.font = `${fontSize}px monospace`;
    drops.forEach((y, i) => {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
    frame++;
  }, 50);
  setTimeout(() => {
    clearInterval(id);
    canvas.style.transition = "opacity 0.6s";
    canvas.style.opacity = "0";
    setTimeout(() => canvas.remove(), 700);
  }, 5000);
}
