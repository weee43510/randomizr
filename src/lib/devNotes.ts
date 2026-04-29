/** Developer notes restored & expanded across the v4.0 → v7.0 journey. */

export interface DevNote {
  date: string;
  title: string;
  body: string;
  mood:
    | "💭" // thinking
    | "🚀" // major release
    | "🐛" // bug fix
    | "✨" // polish / feature
    | "😅" // casual / funny
    | "🔥" // hype / big change
    | "🎯" // focused improvement
    | "🛠️" // fixing / addressing issues
    | "⚠️" // warning / problems
    | "🙏"; // gratitude
}

export const DEV_NOTES: DevNote[] = [
  {
    date: "2026-04-19",
    title: "The whole point",
    body: "I made this in study hall because I was bored. Then I kept adding stuff. Then I couldn't stop. Send help.",
    mood: "😅",
  },
  {
    date: "2026-04-20",
    title: "v4.0 — Themes everywhere",
    body: "Shipped 10 themes today. The HSL editor is honestly the most fun thing in the app. Next up: streaks, mini-games, and the 30-day roadmap.",
    mood: "🎯",
  },
  {
    date: "2026-04-20",
    title: "Easter eggs are addictive",
    body: "Added the Konami code, secret words, and the matrix overlay. Spent way more time on rainbow mode than I should have. Worth it.",
    mood: "✨",
  },
  {
    date: "2026-04-21",
    title: "v5.0 — Settings glow-up",
    body: "Fullscreen settings, tabs, a mini-game inside settings. The Konami code listener was busted — captured key.length === 1 instead of the actual key. Fixed.",
    mood: "🐛",
  },
  {
    date: "2026-04-21",
    title: "v6.0 — Roadmap v1 done",
    body: "All 9 unshipped roadmap stops in one drop. Bingo Tournament, Achievements, Sound Studio, Voice Commands, Pixel Pet — full send. The 3D device picker came out really clean.",
    mood: "🚀",
  },
  {
    date: "2026-04-22",
    title: "v6.1 — Polish day",
    body: "Three new games (Rhythm Tap, Balloon Pop, Math Sprint), Game of the Week rotates by ISO week, suggestions box wired to my email.",
    mood: "✨",
  },
  {
    date: "2026-04-22",
    title: "Pets were a mistake",
    body: "The pixel pet was cute for like a day. Then it just sat there draining stats. Removing it in v6.2 — sorry Pip.",
    mood: "💭",
  },
  {
    date: "2026-04-23",
    title: "v6.2 — Seasons begin",
    body: "First season: The Casino. Four core games + ten exclusives that lock forever once the season ends. FOMO is a feature.",
    mood: "🔥",
  },
  {
    date: "2026-04-23",
    title: "Discovery > pets",
    body: "Replaced the pet with Trending / Hot / Most Replayed sections. Way more useful. Streaks are gone too — they made people feel bad for missing a day.",
    mood: "🎯",
  },
  {
    date: "2026-04-24",
    title: "v7 — Casino Rework",
    body: "Tore down the seasonal placeholders and built a real casino layer: 5 brand-new core games, 12 fresh exclusives with clear unlock panels, persistent chips, a chip shop for cosmetics, Casino Membership, and 14 daily events. Killed the rollback system — nobody used it and it muddied the codebase.",
    mood: "🚀",
  },
  {
    date: "2026-04-24",
    title: "Addressing the Casino Update",
    body: `🎰 So, The Casino Season has been out for 1-2 days now, and I just want to say — I've been hearing a lot of your guys' problems, and yes, I AM currently working on fixing them.

📛 The main issues that even I experienced myself are:
• Chips running out  
• Exclusive games not feeling fun  
• Bugs  
• Membership pass issues  
• Bad shop  
• Toolbar problems  

…and you're not crazy 😅

🛠️ I can't fix all of these instantly, but an update IS coming May 1st or 2nd. Here's what I'm working on:

• Chip recovery system (no more getting stuck at 0)  
• Interactive exclusive games  
• Membership progression + rewards  
• Better shop with actually good rewards  
• Casino visuals + live countdown  
• Casino Membership / Season Pass rework  
• Toolbar rework  
• More fixes 🤫  

📅 Just a reminder — this won't release until May 1st (around 6 days).

🤷 For Season 2… expectations are high. It should be way better, with more content and more exciting features.

P.S. This is NOT the final version — it's basically a live beta.

🙏 Thanks for being patient — more updates May 1st.`,
    mood: "🛠️",
  },
];
