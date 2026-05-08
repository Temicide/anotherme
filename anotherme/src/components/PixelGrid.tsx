"use client";

import React from "react";
import {
  AnimationState,
  Posture,
  PixelGridData,
} from "@/lib/types";

interface PixelGridProps {
  grid: PixelGridData;
  size: number;
  animState: AnimationState;
  particleType?: "warm_glow" | "none" | "glitch" | "distortion";
  posture?: Posture;
}

const ROWS = 24;
const COLS = 16;

function getBaselineSilhouette(): Set<string> {
  const cells = new Set<string>();

  const add = (r: number, cStart: number, cEnd: number) => {
    for (let c = cStart; c <= cEnd; c++) {
      cells.add(`${r},${c}`);
    }
  };

  // Head
  add(1, 6, 9);
  add(2, 5, 10);
  add(3, 5, 10);
  add(4, 6, 9);

  // Neck
  add(5, 7, 8);

  // Shoulders
  add(6, 4, 11);

  // Arms
  for (let r = 7; r <= 13; r++) {
    add(r, 2, 3);
    add(r, 12, 13);
  }

  // Torso
  for (let r = 7; r <= 14; r++) {
    add(r, 5, 10);
  }

  // Hips
  add(15, 5, 10);

  // Legs
  for (let r = 16; r <= 23; r++) {
    add(r, 5, 7);
    add(r, 8, 10);
  }

  return cells;
}

function applyPosture(
  baseline: Set<string>,
  posture: Posture
): Set<string> {
  if (posture === "upright" || posture === "neutral") {
    return baseline;
  }

  const result = new Set<string>();
  const shift =
    posture === "slight_slouch"
      ? 1
      : posture === "hunched"
      ? 2
      : 3;

  baseline.forEach((key) => {
    const [rStr, cStr] = key.split(",");
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);

    if (r >= 15) {
      result.add(key);
      return;
    }

    let newR = r + shift;
    let newC = c;

    if (posture === "hunched" && r === 6) {
      if (c === 4 || c === 11) return;
    }

    if (posture === "collapsed") {
      if (r === 6) {
        if (c <= 5 || c >= 10) return;
      }
      if (r >= 7 && r <= 14) {
        if (c === 5 || c === 10) return;
      }
    }

    if (newR < ROWS) {
      result.add(`${newR},${newC}`);
    }
  });

  return result;
}

function getAnimationCSS(animState: AnimationState): string {
  switch (animState) {
    case "bouncy":
      return `
        @keyframes bouncy {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .anim-grid { animation: bouncy 2s ease-in-out infinite; }
      `;
    case "steady":
      return `
        @keyframes steady {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        .anim-grid { animation: steady 4s ease-in-out infinite; }
      `;
    case "sluggish":
      return `
        @keyframes sluggish {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(-3px, -2px); }
          50% { transform: translate(0px, -1px); }
          75% { transform: translate(3px, -2px); }
        }
        .anim-grid { animation: sluggish 5s ease-in-out infinite; }
      `;
    case "erratic":
      return `
        @keyframes erratic {
          0%, 100% { transform: translate(0px, 0px); }
          10% { transform: translate(-2px, 1px); }
          20% { transform: translate(2px, -1px); }
          30% { transform: translate(-1px, -2px); }
          40% { transform: translate(1px, 2px); }
          50% { transform: translate(-2px, -1px); }
          60% { transform: translate(2px, 1px); }
          70% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -2px); }
          90% { transform: translate(-2px, -1px); }
        }
        .anim-grid { animation: erratic 0.8s linear infinite; }
      `;
    case "near-still":
      return `
        @keyframes near-still {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
        }
        .anim-grid { animation: near-still 6s ease-in-out infinite; }
      `;
  }
}

type ParticleConfig = {
  left?: string;
  top?: string;
  width?: string;
  height?: string;
  delay: string;
};

function getParticles(
  particleType: NonNullable<PixelGridProps["particleType"]>
): ParticleConfig[] {
  if (particleType === "none") return [];
  if (particleType === "warm_glow") {
    return [
      { left: "20%", top: "30%", delay: "0s" },
      { left: "70%", top: "20%", delay: "0.5s" },
      { left: "40%", top: "60%", delay: "1s" },
      { left: "80%", top: "50%", delay: "1.5s" },
      { left: "10%", top: "70%", delay: "2s" },
    ];
  }
  if (particleType === "glitch") {
    return [
      { left: "10%", top: "15%", width: "30px", height: "4px", delay: "0s" },
      { left: "60%", top: "25%", width: "20px", height: "3px", delay: "0.2s" },
      { left: "30%", top: "45%", width: "40px", height: "5px", delay: "0.4s" },
      { left: "70%", top: "65%", width: "25px", height: "4px", delay: "0.6s" },
      { left: "20%", top: "80%", width: "35px", height: "3px", delay: "0.8s" },
    ];
  }
  if (particleType === "distortion") {
    return [{ delay: "0s" }];
  }
  return [];
}

function getParticleCSS(
  particleType: NonNullable<PixelGridProps["particleType"]>
): string {
  if (particleType === "none") return "";

  if (particleType === "warm_glow") {
    return `
      @keyframes float-up {
        0% { transform: translateY(0) scale(1); opacity: 0.6; }
        100% { transform: translateY(-40px) scale(0.3); opacity: 0; }
      }
      .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(250, 204, 21, 0.8);
        box-shadow: 0 0 8px 2px rgba(250, 204, 21, 0.5);
        animation: float-up 3s ease-out infinite;
      }
    `;
  }

  if (particleType === "glitch") {
    return `
      @keyframes glitch-flicker {
        0%, 100% { opacity: 0; }
        10% { opacity: 0.8; transform: translateX(0); }
        15% { opacity: 0; }
        20% { opacity: 0.6; transform: translateX(4px); }
        25% { opacity: 0; }
        30% { opacity: 0.9; transform: translateX(-3px); }
        35% { opacity: 0; }
        40% { opacity: 0.5; transform: translateX(2px); }
        45% { opacity: 0; }
      }
      .particle {
        position: absolute;
        background: rgba(239, 68, 68, 0.7);
        animation: glitch-flicker 1.2s linear infinite;
      }
    `;
  }

  if (particleType === "distortion") {
    return `
      @keyframes distort {
        0% { filter: blur(0px) contrast(1); opacity: 0.3; }
        25% { filter: blur(1px) contrast(1.2); opacity: 0.5; }
        50% { filter: blur(0px) contrast(1.1); opacity: 0.3; }
        75% { filter: blur(2px) contrast(1.3); opacity: 0.6; }
        100% { filter: blur(0px) contrast(1); opacity: 0.3; }
      }
      .particle {
        position: absolute;
        inset: -10px;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255,255,255,0.03) 2px,
          rgba(255,255,255,0.03) 4px
        );
        animation: distort 2s linear infinite;
        pointer-events: none;
      }
    `;
  }

  return "";
}

export default function PixelGrid({
  grid,
  size,
  animState,
  particleType = "none",
  posture = "neutral",
}: PixelGridProps) {
  const baseline = getBaselineSilhouette();
  const silhouette = applyPosture(baseline, posture);

  const cellSize = 8;
  const gap = 1;

  const particles = getParticles(particleType);

  return (
    <div
      className="relative inline-block"
      style={{
        transform: `scale(${size})`,
        transformOrigin: "top center",
        transition: "transform 0.6s ease-out",
      }}
    >
      <style>{getAnimationCSS(animState)}</style>
      {particleType !== "none" && (
        <style>{getParticleCSS(particleType)}</style>
      )}

      <div className="relative">
        <div
          className="anim-grid grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
            gap: `${gap}px`,
          }}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const key = `${r},${c}`;
              const isFilled = silhouette.has(key);
              const color = grid[key];
              return (
                <div
                  key={key}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: isFilled
                      ? color || "#e5e5e5"
                      : "transparent",
                    transition: "background-color 0.3s ease",
                    borderRadius: "1px",
                  }}
                />
              );
            })
          )}
        </div>

        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
