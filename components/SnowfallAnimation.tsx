"use client";

import { useEffect, useState } from "react";

type Snowflake = {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  fontSize: number;
  opacity: number;
};

export default function SnowfallAnimation() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Générer 50 flocons de neige avec des propriétés aléatoires
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100, // Position horizontale (0-100%)
      animationDuration: Math.random() * 3 + 5, // Durée de chute (5-8s)
      animationDelay: Math.random() * 5, // Délai avant le début (0-5s)
      fontSize: Math.random() * 10 + 10, // Taille (10-20px)
      opacity: Math.random() * 0.5 + 0.3, // Opacité (0.3-0.8)
    }));
    setSnowflakes(flakes);
  }, []);

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
