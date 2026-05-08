// Shared types for AnotherMe

export type Checkpoint = "6mo" | "1yr" | "2yr" | "3yr" | "5yr";

export const CHECKPOINTS: Checkpoint[] = ["6mo", "1yr", "2yr", "3yr", "5yr"];

export interface Habits {
  sleep_hours: number; // 0–12
  exercise_freq: number; // 0–7 (days/week)
  diet_quality: "poor" | "fair" | "good" | "excellent";
  stress_level: "low" | "moderate" | "high";
  screen_time_hours: number; // 0–16
  caffeine_intake: "none" | "low" | "moderate" | "high";
  social_activity: "very_low" | "low" | "moderate" | "high";
  water_intake: "very_low" | "low" | "adequate" | "high";
}

export interface ExtractionResult {
  habits: Habits;
  assumptions_filled: string[];
}

export type DimensionKey =
  | "energy"
  | "mood"
  | "focus"
  | "sleep_quality"
  | "physical_fitness"
  | "stress_level"
  | "immune_strength"
  | "metabolism"
  | "social_drive"
  | "longevity_score";

export const DIMENSIONS: DimensionKey[] = [
  "energy",
  "mood",
  "focus",
  "sleep_quality",
  "physical_fitness",
  "stress_level",
  "immune_strength",
  "metabolism",
  "social_drive",
  "longevity_score",
];

export interface TimelinePoint {
  checkpoint: Checkpoint;
  value: number; // 0–100
  event: string;
}

export interface DimensionResult {
  dimension: DimensionKey;
  unit: "score_0_to_100";
  timeline: TimelinePoint[];
}

export type DimensionResultOrUnavailable = DimensionResult | "unavailable";

export interface SimulationResult {
  dimensions: DimensionResultOrUnavailable[];
  aggregated: Record<Checkpoint, number>;
}

export type AnimationState =
  | "bouncy"
  | "steady"
  | "sluggish"
  | "erratic"
  | "near-still";

export type Posture =
  | "upright"
  | "neutral"
  | "slight_slouch"
  | "hunched"
  | "collapsed";

export type PixelGridData = Record<string, string>;

export type HealthStateName = "Thriving" | "Stable" | "Declining" | "Critical" | "Severe";

export interface HealthState {
  name: HealthStateName;
  colorPalette: string[];
  postureGridRef: string;
  sizeMultiplier: number;
  particleType: "warm_glow" | "none" | "glitch" | "distortion";
}

export type AppView = "idle" | "reviewing" | "loading" | "results";

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  energy: "#FACC15",
  mood: "#A855F7",
  focus: "#3B82F6",
  sleep_quality: "#6366F1",
  physical_fitness: "#22C55E",
  stress_level: "#EF4444",
  immune_strength: "#14B8A6",
  metabolism: "#F97316",
  social_drive: "#EC4899",
  longevity_score: "#EAB308",
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  energy: "Energy",
  mood: "Mood / Emotional State",
  focus: "Focus / Concentration",
  sleep_quality: "Sleep Quality",
  physical_fitness: "Physical Fitness",
  stress_level: "Stress Level",
  immune_strength: "Immune Strength",
  metabolism: "Metabolism",
  social_drive: "Social Drive",
  longevity_score: "Longevity Score",
};
