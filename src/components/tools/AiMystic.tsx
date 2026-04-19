import { useState } from "react";
import { sounds, triggerWinHype } from "@/lib/sounds";

const answers = [
  "Absolutely, yes! ✨", "Without a doubt.", "My sources say no. 💀",
  "Ask again... I was napping.", "The stars align — YES!", "Not a chance. 😏",
  "Signs point to maybe... lol.", "100% yes, don't overthink it.",
  "Hard no. Next question.", "Reply hazy, try after coffee ☕",
  "Yasss queen! 👑", "The universe says... meh.",
  "Bold of you to ask. But yes.", "LOL no.", "It is certain!",
  "Don't count on it.", "Better not tell you now 😶",
  "My gut says yes. My brain says run.", "Outlook not so good 💀",
  "Concentrate and ask again..."
];

const EASTER_EGG_QUESTION = "do you know how to get to bells canyon?";
const EASTER_EGG_ANSWER = "OH HELL NO, GET AWAY";

export default function AiMystic() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [isEasterEgg, setIsEasterEgg] = useState(false);

  const ask = () => {
    if (!question.trim() || thinking) return;
    setThinking(true);
    setAnswer(null);
    sounds.mystic();

    const normalized = question.trim().toLowerCase().replace(/\s+/g, " ");
    const easter = normalized === EASTER_EGG_QUESTION;

    setTimeout(() => {
      if (easter) {
        setAnswer(EASTER_EGG_ANSWER);
        setIsEasterEgg(true);
      } else {
        setAnswer(answers[Math.floor(Math.random() * answers.length)]);
        setIsEasterEgg(false);
      }
      setThinking(false);
      sounds.win();
      triggerWinHype();
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-fade-in">
      {/* Orb */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full ${
            isEasterEgg
              ? "bg-gradient-to-br from-destructive/40 to-neon-pink/40"
              : "bg-gradient-to-br from-neon-violet/30 to-neon-cyan/30"
          } ${thinking ? "animate-spin" : "animate-pulse-glow"}`}
          style={{ filter: "blur(20px)" }}
        />
        <div
          className={`relative w-40 h-40 rounded-full glass-card-highlight flex items-center justify-center ${
            isEasterEgg ? "animate-neon-pulse" : "neon-glow-violet"
          }`}
        >
          <div className="text-center p-4">
            {thinking ? (
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            ) : answer ? (
              <p className={`text-sm font-bold ${isEasterEgg ? "text-destructive" : "neon-text-cyan"}`}>{answer}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Ask me anything...</p>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="w-full max-w-md flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Will I win the lottery?"
          className="flex-1 px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={ask}
          disabled={thinking}
          className="spring-btn px-6 py-3 rounded-lg bg-primary/20 border border-primary/40 text-primary font-semibold hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
