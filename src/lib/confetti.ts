import confetti from "canvas-confetti";

/** Quick win burst from the bottom-center. Lightweight to avoid lag. */
export function celebrate(intensity: "small" | "medium" | "big" = "medium") {
  const counts = { small: 30, medium: 60, big: 100 }[intensity];
  confetti({
    particleCount: counts,
    spread: 80,
    origin: { y: 0.7 },
    ticks: 200,
    colors: ["#00f0ff", "#ff00ea", "#ffe600", "#7cff00", "#ff7a00"],
    disableForReducedMotion: true,
  });
}

/** Side cannons — for big wins. Single short pulse. */
export function cannons() {
  const colors = ["#00f0ff", "#ff00ea", "#ffe600"];
  confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, colors, ticks: 200 });
  confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 }, colors, ticks: 200 });
}

/** Rain a single emoji — for easter eggs. */
export function emojiRain(emoji: string, count = 30) {
  const scalar = 2;
  const shape = confetti.shapeFromText({ text: emoji, scalar });
  confetti({
    particleCount: count,
    spread: 360,
    startVelocity: 30,
    origin: { y: 0.2 },
    shapes: [shape],
    scalar,
    ticks: 200,
  });
}
