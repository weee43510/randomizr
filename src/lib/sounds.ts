const audioCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) ctx = audioCtx();
  return ctx;
};

function isSoundEnabled(): boolean {
  try {
    const stored = localStorage.getItem("pickr_sound_enabled");
    return stored === null ? true : JSON.parse(stored);
  } catch {
    return true;
  }
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  if (!isSoundEnabled()) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sounds = {
  click: () => playTone(800, 0.08, 'sine', 0.1),
  tick: () => playTone(1200, 0.05, 'sine', 0.08),
  win: () => {
    playTone(523, 0.15, 'sine', 0.15);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.15), 100);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.2), 200);
  },
  spin: () => playTone(400, 0.1, 'triangle', 0.08),
  countdown: () => playTone(600, 0.2, 'square', 0.08),
  flip: () => playTone(500, 0.15, 'triangle', 0.1),
  roll: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(300 + Math.random() * 200, 0.08, 'triangle', 0.06), i * 60);
    }
  },
  mystic: () => {
    playTone(220, 0.5, 'sine', 0.1);
    setTimeout(() => playTone(330, 0.5, 'sine', 0.1), 200);
    setTimeout(() => playTone(440, 0.8, 'sine', 0.15), 400);
  },
};
