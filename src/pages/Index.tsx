import { useState } from "react";
import AppSidebar, { type ToolId } from "@/components/AppSidebar";
import AiMystic from "@/components/tools/AiMystic";
import FingerRoulette from "@/components/tools/FingerRoulette";
import PhotoWheel from "@/components/tools/PhotoWheel";
import RankingBoard from "@/components/tools/RankingBoard";
import TeamSplitter from "@/components/tools/TeamSplitter";
import CoinDice from "@/components/tools/CoinDice";
import TruthOrDare from "@/components/tools/TruthOrDare";
import BingoCaller from "@/components/tools/BingoCaller";
import RockPaperScissors from "@/components/tools/RockPaperScissors";
import PageTransition from "@/components/PageTransition";
import DevicePicker, { getStoredDevice, type DeviceType } from "@/components/DevicePicker";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const toolComponents: Record<ToolId, React.FC> = {
  mystic: AiMystic,
  roulette: FingerRoulette,
  wheel: PhotoWheel,
  ranking: RankingBoard,
  teams: TeamSplitter,
  coinDice: CoinDice,
  truthDare: TruthOrDare,
  bingo: BingoCaller,
  rps: RockPaperScissors,
};

export default function Index() {
  const [deviceType, setDeviceType] = useState<DeviceType | null>(getStoredDevice);
  const [activeTool, setActiveTool] = useState<ToolId>("mystic");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => loadFromStorage("sound_enabled", true));

  const handleSoundToggle = (v: boolean) => {
    setSoundEnabled(v);
    saveToStorage("sound_enabled", v);
  };

  if (!deviceType) {
    return <DevicePicker onSelect={setDeviceType} />;
  }

  const ActiveComponent = toolComponents[activeTool];
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const sidebarCollapsed = isTablet || collapsed;

  return (
    <div className="gradient-bg-animated min-h-screen">
      <AppSidebar
        active={activeTool}
        onSelect={setActiveTool}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        deviceType={deviceType}
        mobileOpen={mobileOpen}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
        soundEnabled={soundEnabled}
        onSoundToggle={handleSoundToggle}
      />
      <main
        className={`relative z-10 transition-all duration-300 min-h-screen ${
          isMobile
            ? "pt-16 p-4"
            : sidebarCollapsed
              ? "ml-16 p-6"
              : "ml-56 p-6"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <PageTransition activeKey={activeTool}>
            <ActiveComponent />
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
