import { useEffect, useState } from "react";
import AppSidebar, { type ToolId } from "@/components/AppSidebar";
import AiMystic from "@/components/tools/AiMystic";
import FingerRoulette from "@/components/tools/FingerRoulette";
import PhotoWheel from "@/components/tools/PhotoWheel";
import RankingBoard from "@/components/tools/RankingBoard";
import TeamSplitter from "@/components/tools/TeamSplitter";
import CoinDice from "@/components/tools/CoinDice";
import TruthOrDare from "@/components/tools/TruthOrDare";
import WouldYouRather from "@/components/tools/WouldYouRather";
import TriviaQuiz from "@/components/tools/TriviaQuiz";
import BingoCaller from "@/components/tools/BingoCaller";
import RockPaperScissors from "@/components/tools/RockPaperScissors";
import TicTacToe from "@/components/tools/TicTacToe";
import BingoTournament from "@/components/tools/BingoTournament";
import Dashboard from "@/components/tools/Dashboard";
import StickyCanvas from "@/components/tools/StickyCanvas";
import Notepad from "@/components/tools/Notepad";
import ReactionTime from "@/components/tools/ReactionTime";
import MemorySequence from "@/components/tools/MemorySequence";
import WordChain from "@/components/tools/WordChain";
import SpeedTap from "@/components/tools/SpeedTap";
import NumberHunt from "@/components/tools/NumberHunt";
import EmojiStory from "@/components/tools/EmojiStory";
import ColorMatch from "@/components/tools/ColorMatch";
import RhythmTap from "@/components/tools/RhythmTap";
import BalloonPop from "@/components/tools/BalloonPop";
import MathSprint from "@/components/tools/MathSprint";
import SeasonHub from "@/components/tools/SeasonHub";
import FlipDuel from "@/components/tools/casino/FlipDuel";
import NeonRoulette from "@/components/tools/casino/NeonRoulette";
import DealersBluff from "@/components/tools/casino/DealersBluff";
import ChipCascade from "@/components/tools/casino/ChipCascade";
import MindArena from "@/components/tools/casino/MindArena";
import ChipShop from "@/components/tools/casino/ChipShop";
import GenericSeasonGame from "@/components/tools/season1/GenericSeasonGame";
import PageTransition from "@/components/PageTransition";
import DevicePicker, { getStoredDevice, type DeviceType } from "@/components/DevicePicker";
import VoiceCommandButton from "@/components/VoiceCommandButton";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { useKonamiCode } from "@/lib/easterEggs";
import { trackToolUsage } from "@/lib/achievements";
import { recordToolEvent } from "@/lib/discovery";
import { checkUnlocks, getCurrentSeason, ALL_SEASONS } from "@/lib/seasons";
import { recordNonCasinoToolUsed, checkTierUnlocks, addTierXP } from "@/lib/casino";

const CASINO_TOOL_IDS = new Set<ToolId>([
  "season", "flipduel", "neonRoulette", "dealersBluff", "chipCascade", "mindArena", "chipShop",
]);

const toolComponents: Record<ToolId, React.FC<any>> = {
  dashboard: Dashboard as any,
  season: SeasonHub as any,
  mystic: AiMystic, roulette: FingerRoulette, wheel: PhotoWheel, ranking: RankingBoard,
  teams: TeamSplitter, coinDice: CoinDice, truthDare: TruthOrDare, wyr: WouldYouRather,
  trivia: TriviaQuiz, bingo: BingoCaller, bingoTourney: BingoTournament, rps: RockPaperScissors,
  tictactoe: TicTacToe, reaction: ReactionTime, memory: MemorySequence, wordchain: WordChain,
  speedtap: SpeedTap, numhunt: NumberHunt, emoji: EmojiStory, colormatch: ColorMatch,
  rhythmtap: RhythmTap, balloonpop: BalloonPop, mathsprint: MathSprint,
  sticky: StickyCanvas, notepad: Notepad,
  flipduel: FlipDuel, neonRoulette: NeonRoulette, dealersBluff: DealersBluff,
  chipCascade: ChipCascade, mindArena: MindArena, chipShop: ChipShop,
};

export default function Index() {
  const [deviceType, setDeviceType] = useState<DeviceType | null>(getStoredDevice);
  const [activeTool, setActiveTool] = useState<ToolId>("dashboard");
  const [exclusiveGame, setExclusiveGame] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => loadFromStorage("sound_enabled", true));
  const [, setRainbowTick] = useState(0);

  useKonamiCode(() => { setRainbowTick((t) => t + 1); });

  useEffect(() => {
    checkUnlocks();
    checkTierUnlocks();
  }, []);

  const handleSoundToggle = (v: boolean) => { setSoundEnabled(v); saveToStorage("sound_enabled", v); };
  const handleDeviceChange = (d: DeviceType) => { setDeviceType(d); saveToStorage("device_type", d); };

  const handleSelectTool = (id: ToolId) => {
    setExclusiveGame(null);
    setActiveTool(id);
    trackToolUsage(id);
    recordToolEvent(id);
    if (!CASINO_TOOL_IDS.has(id) && id !== "dashboard") {
      recordNonCasinoToolUsed(id);
    }
    addTierXP(2); // small passive XP for being active
    setTimeout(() => { checkUnlocks(); checkTierUnlocks(); }, 100);
  };

  const handleSelectExclusive = (gameId: string) => {
    setExclusiveGame(gameId);
    setActiveTool("season");
    recordToolEvent(`season:${gameId}`);
  };

  const handleVoice = (cmd: string) => {
    const btns = Array.from(document.querySelectorAll<HTMLButtonElement>("button, [role='button']"));
    const target = btns.find((b) => b.textContent?.toLowerCase().includes(cmd));
    target?.click();
  };

  if (!deviceType) return <DevicePicker onSelect={handleDeviceChange} />;

  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const sidebarCollapsed = isTablet || collapsed;

  let body: React.ReactNode;
  if (exclusiveGame) {
    const season = ALL_SEASONS.find((s) => s.id === getCurrentSeason()?.season.id);
    const game = season?.exclusiveGames.find((g) => g.id === exclusiveGame);
    if (game && season) {
      body = (
        <div className="space-y-3">
          <button
            onClick={() => setExclusiveGame(null)}
            className="spring-btn text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            ← Back to Season Hub
          </button>
          <GenericSeasonGame game={game} season={season} />
        </div>
      );
    }
  } else if (activeTool === "dashboard") {
    body = <Dashboard onPick={handleSelectTool} />;
  } else if (activeTool === "season") {
    body = <SeasonHub onPickMain={handleSelectTool} onPickExclusive={handleSelectExclusive} />;
  } else {
    const ActiveComponent = toolComponents[activeTool];
    body = <ActiveComponent />;
  }

  return (
    <div className="gradient-bg-animated min-h-screen">
      <AppSidebar
        active={activeTool}
        onSelect={handleSelectTool}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        deviceType={deviceType}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
        onDeviceChange={handleDeviceChange}
        onPickExclusive={handleSelectExclusive}
      />
      <main
        className={`relative z-10 transition-all duration-300 min-h-screen ${
          isMobile ? "pt-16 p-4" : sidebarCollapsed ? "ml-16 p-6" : "ml-60 p-6"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <PageTransition activeKey={`${activeTool}:${exclusiveGame ?? ""}`}>{body}</PageTransition>
        </div>
      </main>
      <VoiceCommandButton onCommand={handleVoice} />
    </div>
  );
}
