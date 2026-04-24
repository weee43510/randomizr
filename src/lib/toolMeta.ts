import { Sparkles, Hand, Image as ImageIcon, LayoutList, Users, Dice5, Flame, Grid3x3, Swords, HelpCircle, Brain, StickyNote, NotebookPen, Zap, Layers, Type, MousePointerClick, Hash, Smile, Hash as HashIcon, Target as TargetIcon, Trophy, Home, Music2, Rocket, Calculator, Crown, Coins, CircleDot, Spade, Cherry, BrainCircuit, ShoppingBag } from "lucide-react";

export type ToolId =
  | "dashboard" | "season"
  | "mystic" | "roulette" | "wheel" | "ranking" | "teams" | "coinDice"
  | "truthDare" | "wyr" | "trivia" | "bingo" | "rps" | "tictactoe" | "bingoTourney"
  | "reaction" | "memory" | "wordchain" | "speedtap" | "numhunt" | "emoji" | "colormatch"
  | "rhythmtap" | "balloonpop" | "mathsprint"
  | "sticky" | "notepad"
  // Casino core (permanent)
  | "flipduel" | "neonRoulette" | "dealersBluff" | "chipCascade" | "mindArena"
  | "chipShop";

export interface ToolMeta {
  id: ToolId;
  label: string;
  icon: any;
  group: "Home" | "Casino" | "Random" | "Party" | "Mini-Games" | "Tools" | "Season";
  color: string;
  isNew?: boolean;
}

export const TOOLS: ToolMeta[] = [
  { id: "dashboard", label: "Home", icon: Home, group: "Home", color: "hsl(var(--neon-cyan))" },

  // ── 🎰 The Casino — Core hub (always permanent) ──
  { id: "season",       label: "Season Hub",       icon: Crown,         group: "Casino", color: "hsl(45 95% 55%)", isNew: true },
  { id: "flipduel",     label: "Flip Duel",        icon: Coins,         group: "Casino", color: "hsl(45 95% 55%)", isNew: true },
  { id: "neonRoulette", label: "Neon Roulette",    icon: CircleDot,     group: "Casino", color: "hsl(0 80% 55%)",  isNew: true },
  { id: "dealersBluff", label: "Dealer's Bluff",   icon: Spade,         group: "Casino", color: "hsl(160 70% 45%)",isNew: true },
  { id: "chipCascade",  label: "Chip Cascade",     icon: Cherry,        group: "Casino", color: "hsl(40 95% 55%)", isNew: true },
  { id: "mindArena",    label: "Mind Arena",       icon: BrainCircuit,  group: "Casino", color: "hsl(280 80% 60%)",isNew: true },
  { id: "chipShop",     label: "Chip Shop",        icon: ShoppingBag,   group: "Casino", color: "hsl(45 95% 55%)" },

  { id: "mystic", label: "AI Mystic", icon: Sparkles, group: "Random", color: "hsl(var(--neon-violet))" },
  { id: "roulette", label: "Finger Roulette", icon: Hand, group: "Random", color: "hsl(var(--neon-pink))" },
  { id: "wheel", label: "Photo Wheel", icon: ImageIcon, group: "Random", color: "hsl(var(--neon-cyan))" },
  { id: "ranking", label: "Ranking Board", icon: LayoutList, group: "Random", color: "hsl(var(--neon-green))" },
  { id: "teams", label: "Team Splitter", icon: Users, group: "Random", color: "hsl(var(--neon-violet))" },
  { id: "coinDice", label: "Coin & Dice", icon: Dice5, group: "Random", color: "hsl(40 90% 55%)" },

  { id: "truthDare", label: "Truth or Dare", icon: Flame, group: "Party", color: "hsl(15 90% 55%)" },
  { id: "wyr", label: "Would You Rather", icon: HelpCircle, group: "Party", color: "hsl(var(--neon-cyan))" },
  { id: "trivia", label: "Trivia Quiz", icon: Brain, group: "Party", color: "hsl(var(--neon-violet))" },
  { id: "bingo", label: "Bingo", icon: Grid3x3, group: "Party", color: "hsl(var(--neon-pink))" },
  { id: "bingoTourney", label: "Bingo Tournament", icon: Trophy, group: "Party", color: "hsl(40 90% 55%)" },
  { id: "rps", label: "Rock Paper Scissors", icon: Swords, group: "Party", color: "hsl(var(--neon-green))" },
  { id: "tictactoe", label: "Tic-Tac-Toe", icon: HashIcon, group: "Party", color: "hsl(var(--neon-cyan))" },

  { id: "reaction", label: "Reaction Time", icon: Zap, group: "Mini-Games", color: "hsl(var(--neon-cyan))" },
  { id: "memory", label: "Memory Sequence", icon: Layers, group: "Mini-Games", color: "hsl(var(--neon-violet))" },
  { id: "wordchain", label: "Word Chain", icon: Type, group: "Mini-Games", color: "hsl(var(--neon-pink))" },
  { id: "speedtap", label: "Speed Tap", icon: MousePointerClick, group: "Mini-Games", color: "hsl(var(--neon-green))" },
  { id: "numhunt", label: "Number Hunt", icon: Hash, group: "Mini-Games", color: "hsl(40 90% 55%)" },
  { id: "emoji", label: "Emoji Story", icon: Smile, group: "Mini-Games", color: "hsl(var(--neon-violet))" },
  { id: "colormatch", label: "Color Match", icon: TargetIcon, group: "Mini-Games", color: "hsl(var(--neon-cyan))" },
  { id: "rhythmtap", label: "Rhythm Tap", icon: Music2, group: "Mini-Games", color: "hsl(var(--neon-pink))" },
  { id: "balloonpop", label: "Balloon Pop", icon: Rocket, group: "Mini-Games", color: "hsl(var(--neon-green))" },
  { id: "mathsprint", label: "Math Sprint", icon: Calculator, group: "Mini-Games", color: "hsl(var(--neon-violet))" },

  { id: "sticky", label: "Sticky Wall", icon: StickyNote, group: "Tools", color: "hsl(var(--neon-pink))" },
  { id: "notepad", label: "Notepad", icon: NotebookPen, group: "Tools", color: "hsl(var(--neon-cyan))" },
];

export const TOOL_GROUPS = ["Home", "Casino", "Random", "Party", "Mini-Games", "Tools"] as const;
