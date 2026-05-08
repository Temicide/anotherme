"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  type ExtractionResult,
  type SimulationResult,
  type Checkpoint,
  type Habits,
  type AppView,
  type PixelGridData,
  type AnimationState,
  type Posture,
  CHECKPOINTS,
  DIMENSIONS,
  DIMENSION_COLORS,
  DIMENSION_LABELS,
} from "@/lib/types";
import { getHealthState } from "@/lib/health";
import PixelGrid from "@/components/PixelGrid";
import DimensionChart from "@/components/DimensionChart";
import TimelineScrubber from "@/components/TimelineScrubber";
import HabitReviewForm from "@/components/HabitReviewForm";

function makeGrid(palette: string[]): PixelGridData {
  const grid: PixelGridData = {};
  for (let r = 0; r < 24; r++) {
    for (let c = 0; c < 16; c++) {
      grid[`${r},${c}`] = palette[(r + c) % palette.length];
    }
  }
  return grid;
}

function mapStateToAnim(stateName: string): AnimationState {
  switch (stateName) {
    case "Thriving":
      return "bouncy";
    case "Stable":
      return "steady";
    case "Declining":
      return "sluggish";
    case "Critical":
      return "erratic";
    case "Severe":
      return "near-still";
    default:
      return "steady";
  }
}

export default function Home() {
  const [view, setView] = useState<AppView>("idle");
  const [inputText, setInputText] = useState("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint>("6mo");
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setError(null);
    setView("reviewing");

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Extraction failed (${res.status})`);
      }

      const data = (await res.json()) as ExtractionResult;
      setExtraction(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
      setView("idle");
    }
  };

  const handleSimulate = async (habits: Habits) => {
    setError(null);
    setView("loading");

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Simulation failed (${res.status})`);
      }

      const data = (await res.json()) as SimulationResult;
      setSimulation(data);
      setActiveCheckpoint("6mo");
      setView("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed");
      setView("reviewing");
    }
  };

  const handleCheckpointChange = useCallback((cp: Checkpoint) => {
    setActiveCheckpoint(cp);
  }, []);

  const nowYouState = useMemo(() => getHealthState(100), []);
  const nowYouGrid = useMemo(
    () => makeGrid(nowYouState.colorPalette),
    [nowYouState.colorPalette]
  );

  const futureScore = simulation?.aggregated[activeCheckpoint] ?? 50;
  const futureState = useMemo(() => getHealthState(futureScore), [futureScore]);
  const futureGrid = useMemo(
    () => makeGrid(futureState.colorPalette),
    [futureState.colorPalette]
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0a]">
      {/* Error banner */}
      {error && (
        <div className="w-full bg-red-900/30 px-4 py-2 text-center text-sm text-red-200">
          {error}
        </div>
      )}

      {/* IDLE */}
      {view === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#e5e5e5]">
            AnotherMe
          </h1>
          <p className="mb-8 text-sm text-[#737373]">
            See what your daily habits do to your future self.
          </p>

          <div className="w-full max-w-xl">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleExtract();
                }
              }}
              placeholder="What will happen to me if I sleep only 5 hours every day for the next 5 years?"
              className="h-32 w-full resize-none rounded-lg border border-[#1a1a1a] bg-[#111111] p-4 text-[#e5e5e5] placeholder-[#404040] outline-none transition-colors focus:border-[#737373]"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleExtract}
                disabled={!inputText.trim()}
                className="rounded bg-[#e5e5e5] px-5 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEWING */}
      {view === "reviewing" && extraction && (
        <div className="flex w-full max-w-xl flex-1 flex-col px-4 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#e5e5e5]">
              Review your habits
            </h2>
            <p className="text-sm text-[#737373]">
              Adjust any values before simulating.
            </p>
          </div>
          <HabitReviewForm
            habits={extraction.habits}
            assumptions={extraction.assumptions_filled}
            onSubmit={handleSimulate}
          />
        </div>
      )}

      {/* LOADING */}
      {view === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-6">
            <PixelGrid
              grid={nowYouGrid}
              size={1.0}
              animState="steady"
              particleType="warm_glow"
              posture="upright"
            />
          </div>
          <p className="text-sm text-[#737373]">Simulating your future...</p>
        </div>
      )}

      {/* RESULTS */}
      {view === "results" && simulation && (
        <div className="flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
          {/* Split-screen */}
          <div className="flex items-center justify-center gap-8">
            {/* Now You */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                Now You
              </span>
              <PixelGrid
                grid={nowYouGrid}
                size={nowYouState.sizeMultiplier}
                animState={mapStateToAnim(nowYouState.name)}
                particleType={nowYouState.particleType}
                posture={nowYouState.postureGridRef as Posture}
              />
            </div>

            {/* Glowing gap */}
            <div className="glow-gap h-48 w-px bg-white/10" />

            {/* Future You */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                Future You — {activeCheckpoint}
              </span>
              <PixelGrid
                grid={futureGrid}
                size={futureState.sizeMultiplier}
                animState={mapStateToAnim(futureState.name)}
                particleType={futureState.particleType}
                posture={futureState.postureGridRef as Posture}
              />
              <div className="text-center">
                <span className="text-lg font-bold text-[#e5e5e5]">
                  {futureState.name}
                </span>
                <span className="ml-2 text-sm text-[#737373]">
                  ({futureScore})
                </span>
              </div>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {simulation.dimensions.map((dim, i) => {
              const key =
                dim === "unavailable" ? `unavailable-${i}` : dim.dimension;
              const color = DIMENSION_COLORS[DIMENSIONS[i]];
              const label = DIMENSION_LABELS[DIMENSIONS[i]];
              return (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[#737373]">
                    {label}
                  </span>
                  <DimensionChart
                    dimension={dim}
                    color={color}
                    activeCheckpoint={activeCheckpoint}
                  />
                </div>
              );
            })}
          </div>

          {/* Timeline scrubber */}
          <div className="flex flex-col items-center gap-4">
            <TimelineScrubber
              onCheckpointChange={handleCheckpointChange}
              autoPlay={true}
            />
            <button
              onClick={() => {
                setView("idle");
                setInputText("");
                setExtraction(null);
                setSimulation(null);
                setError(null);
              }}
              className="rounded border border-[#1a1a1a] bg-[#111111] px-4 py-2 text-xs font-medium text-[#737373] transition-colors hover:border-[#737373] hover:text-[#e5e5e5]"
            >
              Try another scenario
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
