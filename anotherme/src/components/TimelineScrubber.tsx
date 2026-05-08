"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Checkpoint, CHECKPOINTS } from "@/lib/types";

interface TimelineScrubberProps {
  onCheckpointChange: (cp: Checkpoint) => void;
  autoPlay?: boolean;
}

const INTERVALS: Record<Checkpoint, number> = {
  "6mo": 4000,
  "1yr": 3000,
  "2yr": 2500,
  "3yr": 2000,
  "5yr": 1500,
};

export default function TimelineScrubber({
  onCheckpointChange,
  autoPlay = false,
}: TimelineScrubberProps) {
  const [active, setActive] = useState<Checkpoint>("6mo");
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (currentIndex: number) => {
      const nextIndex = (currentIndex + 1) % CHECKPOINTS.length;
      const nextCp = CHECKPOINTS[nextIndex];
      const delay = INTERVALS[nextCp];

      timeoutRef.current = setTimeout(() => {
        setActive(nextCp);
        onCheckpointChange(nextCp);
        scheduleNext(nextIndex);
      }, delay);
    },
    [onCheckpointChange]
  );

  useEffect(() => {
    if (isPlaying) {
      const currentIndex = CHECKPOINTS.indexOf(active);
      clearCurrentTimeout();
      scheduleNext(currentIndex);
    } else {
      clearCurrentTimeout();
    }

    return () => clearCurrentTimeout();
  }, [isPlaying, active, clearCurrentTimeout, scheduleNext]);

  const handleClick = (cp: Checkpoint) => {
    setIsPlaying(false);
    setActive(cp);
    onCheckpointChange(cp);
  };

  return (
    <div className="flex items-center gap-2">
      {CHECKPOINTS.map((cp) => {
        const isActive = cp === active;
        return (
          <button
            key={cp}
            onClick={() => handleClick(cp)}
            className={[
              "rounded px-3 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-[#e5e5e5] text-[#0a0a0a]"
                : "bg-[#111111] text-[#737373] hover:bg-[#1a1a1a] hover:text-[#e5e5e5]",
            ].join(" ")}
          >
            {cp}
          </button>
        );
      })}

      <button
        onClick={() => setIsPlaying((p) => !p)}
        className="ml-2 rounded bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#737373] transition-all hover:bg-[#1a1a1a] hover:text-[#e5e5e5]"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
