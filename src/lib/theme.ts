import { loadFromStorage, saveToStorage } from "./storage";

export type ThemeId =
  | "cyberpunk" | "matrix" | "sunset" | "ocean" | "bloodmoon" | "vaporwave"
  | "forest" | "midnight" | "daylight" | "classic"
  // v6.2 new themes
  | "inferno" | "glacier" | "sakura" | "honey" | "royal" | "mint" | "carbon"
  // v7.1 casino themes
  | "casinoVelvet" | "casinoObsidian" | "casinoGold"
  | "custom";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  description: string;
  emoji: string;
  noNeon?: boolean;
  light?: boolean;
  vars: Record<string, string>;
}

const mk = (
  id: ThemeId, label: string, description: string, emoji: string,
  bgH: number, bgS: number, bgL: number,
  fgH: number, fgL: number,
  primaryH: number, primaryS: number, primaryL: number,
  accentH: number,
  opts: { noNeon?: boolean; light?: boolean } = {},
): ThemeDef => ({
  id, label, description, emoji, ...opts,
  vars: {
    "--background": `${bgH} ${bgS}% ${bgL}%`,
    "--foreground": `${fgH} 50% ${fgL}%`,
    "--card": `${bgH} ${Math.max(15, bgS - 5)}% ${Math.min(100, bgL + 5)}%`,
    "--card-foreground": `${fgH} 50% ${fgL}%`,
    "--popover": `${bgH} ${Math.max(15, bgS - 5)}% ${Math.min(100, bgL + 5)}%`,
    "--popover-foreground": `${fgH} 50% ${fgL}%`,
    "--primary": `${primaryH} ${primaryS}% ${primaryL}%`,
    "--primary-foreground": `${bgH} ${bgS}% ${bgL}%`,
    "--secondary": `${accentH} ${Math.max(50, primaryS - 10)}% ${primaryL - 5}%`,
    "--secondary-foreground": `${fgH} 50% ${fgL}%`,
    "--accent": `${accentH} ${primaryS}% ${primaryL}%`,
    "--accent-foreground": `${bgH} ${bgS}% ${bgL}%`,
    "--muted": `${bgH} ${Math.max(15, bgS - 5)}% ${bgL + 7}%`,
    "--muted-foreground": `${fgH} 25% ${Math.min(75, fgL - 25)}%`,
    "--destructive": `0 84% 60%`,
    "--destructive-foreground": `${fgH} 50% ${fgL}%`,
    "--border": `${bgH} ${bgS - 5}% ${bgL + 12}%`,
    "--input": `${bgH} ${bgS - 5}% ${bgL + 7}%`,
    "--ring": `${primaryH} ${primaryS}% ${primaryL}%`,
    "--neon-cyan": `${primaryH} ${primaryS}% ${primaryL}%`,
    "--neon-violet": `${(accentH + 30) % 360} ${primaryS}% ${primaryL}%`,
    "--neon-pink": `${accentH} ${primaryS}% ${primaryL}%`,
    "--neon-green": `${(primaryH + 60) % 360} 70% 50%`,
    "--glass-bg": `${bgH} ${bgS}% ${bgL + 5}%`,
    "--glass-border": `${primaryH} ${primaryS}% ${primaryL + 15}%`,
    "--gradient-a": `${bgH} ${bgS + 5}% ${bgL}%`,
    "--gradient-b": `${primaryH} ${primaryS - 30}% ${bgL + 5}%`,
    "--gradient-c": `${accentH} ${primaryS - 30}% ${bgL + 3}%`,
    "--gradient-d": `${(bgH + 30) % 360} ${bgS}% ${bgL + 2}%`,
  },
});

export const THEMES: ThemeDef[] = [
  // ─── Originals ───
  mk("cyberpunk", "Cyberpunk", "Pink × Blue · the OG", "🌆", 230, 25, 7, 210, 96, 330, 90, 60, 200),
  mk("matrix", "Matrix", "Green × Black · jack in", "🟢", 140, 30, 4, 140, 90, 140, 90, 50, 140),
  mk("sunset", "Sunset", "Orange × Purple · golden hour", "🌅", 280, 30, 8, 30, 95, 25, 95, 60, 280),
  mk("ocean", "Ocean", "Deep Blue × Teal · dive in", "🌊", 215, 60, 6, 190, 92, 180, 90, 50, 210),
  mk("bloodmoon", "Blood Moon", "Red × Crimson · be afraid", "🩸", 0, 30, 5, 10, 92, 0, 90, 55, 350),
  mk("vaporwave", "Vaporwave", "Pink × Cyan · A E S T H E T I C", "🌸", 270, 50, 10, 320, 95, 320, 90, 70, 180),
  mk("forest", "Forest", "Emerald × Lime · go touch grass", "🌲", 150, 30, 6, 100, 92, 100, 80, 55, 80),
  mk("midnight", "Midnight", "Pure dark · no neon", "🌑", 0, 0, 6, 0, 92, 0, 0, 90, 0, { noNeon: true }),
  mk("daylight", "Daylight", "Light mode · clean & quiet", "☀️", 0, 0, 98, 0, 12, 0, 0, 15, 0, { noNeon: true, light: true }),
  mk("classic", "Classic Blue", "Just blue · no glow", "🔵", 215, 30, 12, 210, 95, 210, 85, 55, 215, { noNeon: true }),

  // ─── v6.2 NEW THEMES ───
  mk("inferno", "Inferno", "Lava red × charcoal", "🔥", 15, 40, 6, 30, 95, 15, 95, 55, 0),
  mk("glacier", "Glacier", "Ice blue × frost white", "🧊", 200, 35, 10, 200, 95, 195, 85, 65, 220),
  mk("sakura", "Sakura", "Cherry blossom × cream", "🌸", 340, 25, 96, 340, 18, 340, 75, 55, 320, { noNeon: true, light: true }),
  mk("honey", "Honey", "Amber × warm brown", "🍯", 35, 40, 8, 40, 95, 40, 95, 60, 25),
  mk("royal", "Royal", "Purple × gold · regal", "👑", 270, 40, 8, 45, 95, 280, 90, 65, 45),
  mk("mint", "Mint", "Soft mint × charcoal", "🌿", 160, 25, 10, 150, 92, 160, 75, 60, 175),
  mk("carbon", "Carbon", "Pure tech · matte black", "⬛", 220, 8, 8, 220, 92, 220, 70, 60, 200, { noNeon: true }),

  // ─── v7.1 CASINO THEMES ───
  mk("casinoVelvet",   "Casino Velvet",   "Deep purple felt + gold trim", "🟣", 280, 35, 8,  45, 92, 280, 65, 55, 45),
  mk("casinoObsidian", "Casino Obsidian", "Pitch black + neon gold",      "⚫", 0,   0,  4,  45, 95, 45,  95, 55, 0),
  mk("casinoGold",     "Casino Gold",     "Gilded high-roller suite",     "🥇", 35,  35, 7,  40, 95, 40,  95, 60, 25),
];

export function getStoredTheme(): ThemeId {
  return loadFromStorage<ThemeId>("theme", "cyberpunk");
}

export function applyTheme(id: ThemeId) {
  if (id === "custom") {
    import("@/components/ThemeEditor").then((m) => m.applyCustomFromStorage()).catch(() => {});
    saveToStorage("theme", id);
    document.documentElement.removeAttribute("data-no-neon");
    document.documentElement.removeAttribute("data-light");
    return;
  }
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  if (theme.noNeon) root.setAttribute("data-no-neon", "true");
  else root.removeAttribute("data-no-neon");
  if (theme.light) root.setAttribute("data-light", "true");
  else root.removeAttribute("data-light");
  saveToStorage("theme", id);
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
