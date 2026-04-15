import { useEffect, useState, type ReactNode } from "react";

interface Props {
  activeKey: string;
  children: ReactNode;
}

export default function PageTransition({ activeKey, children }: Props) {
  const [displayKey, setDisplayKey] = useState(activeKey);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (activeKey !== displayKey) {
      setPhase("out");
      const t = setTimeout(() => {
        setDisplayKey(activeKey);
        setPhase("in");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [activeKey, displayKey]);

  return (
    <div
      className={`transition-all duration-200 ease-out ${
        phase === "in"
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-[0.98]"
      }`}
    >
      {children}
    </div>
  );
}
