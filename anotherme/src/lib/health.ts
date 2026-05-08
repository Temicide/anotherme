import {
  type HealthState,
  type DimensionResult,
  type Checkpoint,
} from "./types";

export function getHealthState(score: number): HealthState {
  if (score < 0 || score > 100) {
    throw new Error("Score must be between 0 and 100");
  }

  if (score >= 80) {
    return {
      name: "Thriving",
      colorPalette: ["#FACC15", "#FDE047", "#FEF08A"],
      postureGridRef: "upright",
      sizeMultiplier: 1.0,
      particleType: "warm_glow",
    };
  }
  if (score >= 60) {
    return {
      name: "Stable",
      colorPalette: ["#A3E635", "#D9F99D", "#BEF264"],
      postureGridRef: "neutral",
      sizeMultiplier: 0.95,
      particleType: "none",
    };
  }
  if (score >= 40) {
    return {
      name: "Declining",
      colorPalette: ["#A3A3A3", "#D4D4D4", "#E5E5E5"],
      postureGridRef: "slight_slouch",
      sizeMultiplier: 0.85,
      particleType: "none",
    };
  }
  if (score >= 20) {
    return {
      name: "Critical",
      colorPalette: ["#525252", "#737373", "#404040"],
      postureGridRef: "hunched",
      sizeMultiplier: 0.75,
      particleType: "glitch",
    };
  }
  return {
    name: "Severe",
    colorPalette: ["#262626", "#404040", "#171717"],
    postureGridRef: "collapsed",
    sizeMultiplier: 0.65,
    particleType: "distortion",
  };
}

export function aggregateScore(
  dimensions: DimensionResult[]
): Record<Checkpoint, number> {
  if (!Array.isArray(dimensions) || dimensions.length === 0) {
    return { "6mo": 0, "1yr": 0, "2yr": 0, "3yr": 0, "5yr": 0 };
  }

  const aggregated: Partial<Record<Checkpoint, number>> = {};
  const checkpoints: Checkpoint[] = ["6mo", "1yr", "2yr", "3yr", "5yr"];

  for (const cp of checkpoints) {
    let sum = 0;
    let count = 0;
    for (const dim of dimensions) {
      const point = dim.timeline.find((t) => t.checkpoint === cp);
      if (point) {
        sum += point.value;
        count++;
      }
    }
    aggregated[cp] = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
  }

  return aggregated as Record<Checkpoint, number>;
}
