import confetti from "canvas-confetti";

/** Quick win burst from the bottom-center. */
export function celebrate(intensity: "small" | "medium" | "big" = "medium") {
  const counts = { small: 50, medium: 120, big: 220 }[intensity];
  confetti({
    particleCount: counts,
    spread: 90,
    origin: { y: 0.7 },
    colors: ["#00f0ff", "#ff00ea", "#ffe600", "#7cff00", "#ff7a00"],
  });
}

/** Side cannons — for big wins. */
export function cannons() {
  const end = Date.now() + 800;
  const colors = ["#00f0ff", "#ff00ea", "#ffe600"];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Rain a single emoji, used by easter eggs. */
export function emojiRain(emoji: string, count = 60) {
  const scalar = 2;
  const shape = confetti.shapeFromText({ text: emoji, scalar });
  confetti({
    particleCount: count,
    spread: 360,
    startVelocity: 35,
    origin: { y: 0.2 },
    shapes: [shape],
    scalar,
  });
}
