import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";

type Card = { rank: number; suit: "♠" | "♥" | "♦" | "♣" };

const SUITS: Card["suit"][] = ["♠", "♥", "♦", "♣"];
const draw = (): Card => ({
  rank: Math.floor(Math.random() * 13) + 1,
  suit: SUITS[Math.floor(Math.random() * 4)],
});

const value = (c: Card) => (c.rank === 1 ? 11 : Math.min(10, c.rank));
const rankLabel = (r: number) => (r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : `${r}`);

function score(cards: Card[]) {
  let total = cards.reduce((s, c) => s + value(c), 0);
  let aces = cards.filter((c) => c.rank === 1).length;
  while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
  return total;
}

export default function Blackjack() {
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<"idle" | "play" | "done">("idle");
  const [result, setResult] = useState<string>("");
  const [chips, setChips] = useState(100);

  const deal = () => {
    if (chips < 10) { setResult("You're out of chips. Restart!"); return; }
    setChips((c) => c - 10);
    const p = [draw(), draw()];
    const d = [draw(), draw()];
    setPlayer(p); setDealer(d); setResult("");
    setPhase("play");
    sounds.click();
    if (score(p) === 21) finish(p, d);
  };

  const hit = () => {
    const next = [...player, draw()];
    setPlayer(next);
    sounds.click();
    if (score(next) > 21) finish(next, dealer);
  };

  const stand = () => finish(player, dealer);

  const finish = (p: Card[], d: Card[]) => {
    let dealerHand = [...d];
    while (score(dealerHand) < 17) dealerHand.push(draw());
    setDealer(dealerHand);
    const ps = score(p), ds = score(dealerHand);
    let msg = "";
    if (ps > 21) msg = "Bust. House wins.";
    else if (ds > 21 || ps > ds) { msg = "You win! +20 chips"; setChips((c) => c + 20); celebrate("small"); sounds.win(); }
    else if (ps === ds) { msg = "Push. Bet returned."; setChips((c) => c + 10); }
    else msg = "House wins.";
    setResult(`${msg} (you: ${ps}, dealer: ${ds})`);
    setPhase("done");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Casino · Exclusive</p>
          <h1 className="font-display font-black text-4xl">♠️ Blackjack</h1>
        </div>
        <div className="glass-card px-4 py-2 text-right">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Chips</p>
          <p className="text-2xl font-display font-black text-amber-400">💰 {chips}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Hand label="Dealer" cards={dealer} hidden={phase === "play"} score={phase === "play" ? value(dealer[0] ?? { rank: 0, suit: "♠" }) : score(dealer)} />
        <Hand label="You" cards={player} score={score(player)} />
      </div>

      {result && (
        <div className="glass-card p-4 text-center">
          <p className="text-lg font-bold">{result}</p>
        </div>
      )}

      <div className="flex gap-2 justify-center flex-wrap">
        {phase !== "play" && (
          <button onClick={deal} className="spring-btn px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold">
            Deal · Bet 10
          </button>
        )}
        {phase === "play" && (
          <>
            <button onClick={hit} className="spring-btn px-6 py-3 rounded-xl bg-primary/20 border border-primary/40 font-bold">Hit</button>
            <button onClick={stand} className="spring-btn px-6 py-3 rounded-xl bg-muted/40 border border-border font-bold">Stand</button>
          </>
        )}
      </div>
    </div>
  );
}

function Hand({ label, cards, hidden, score }: { label: string; cards: Card[]; hidden?: boolean; score: number }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-amber-400">{cards.length === 0 ? "—" : score}</span>
      </div>
      <div className="flex gap-2 flex-wrap min-h-[80px]">
        {cards.map((c, i) => (
          <div key={i} className={`w-14 h-20 rounded-lg flex flex-col items-center justify-center font-bold text-lg border-2 ${
            hidden && i > 0 ? "bg-muted/60 border-border text-muted-foreground" : "bg-card border-amber-500/40 text-foreground"
          }`}>
            {hidden && i > 0 ? "?" : (
              <>
                <span className={c.suit === "♥" || c.suit === "♦" ? "text-red-400" : ""}>{rankLabel(c.rank)}</span>
                <span className={c.suit === "♥" || c.suit === "♦" ? "text-red-400 text-2xl" : "text-2xl"}>{c.suit}</span>
              </>
            )}
          </div>
        ))}
        {cards.length === 0 && <span className="text-xs text-muted-foreground italic">Press Deal</span>}
      </div>
    </div>
  );
}
