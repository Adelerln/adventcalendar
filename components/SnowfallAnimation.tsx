"use client";

import { useMemo } from "react";

type Snowflake = {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  fontSize: number;
  opacity: number;
};

const SNOWFLAKE_COUNT = 50;

export default function SnowfallAnimation() {
  const snowflakes = useMemo(() => createSnowflakes(SNOWFLAKE_COUNT), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white animate-fall"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.fontSize}px`,
            opacity: flake.opacity,
            top: '-20px',
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

function createSnowflakes(count: number): Snowflake[] {
  return Array.from({ length: count }, (_, index) => {
    const base = index + 1;
    return {
      id: index,
      left: pseudoRandom(base) * 100,
      animationDuration: pseudoRandom(base * 1.3) * 3 + 5,
      animationDelay: pseudoRandom(base * 1.7) * 5,
      fontSize: pseudoRandom(base * 2) * 10 + 10,
      opacity: pseudoRandom(base * 2.3) * 0.5 + 0.3
    };
  });
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
