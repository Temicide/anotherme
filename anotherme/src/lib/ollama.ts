import {
  type ExtractionResult,
  type Habits,
  type DimensionKey,
  type DimensionResult,
  CHECKPOINTS,
} from "./types";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "gemma4:31b-cloud";

interface OllamaResponse {
  response: string;
}

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama API returned ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as OllamaResponse;
  return data.response;
}

export function cleanJsonResponse(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    return lines.join("\n").trim();
  }
  return trimmed;
}

function parseJsonResponse<T>(text: string): T {
  const cleaned = cleanJsonResponse(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new Error(
      `Failed to parse Ollama response as JSON: ${e instanceof Error ? e.message : String(e)}. Response: ${cleaned.slice(0, 500)}`
    );
  }
}

const HABITS_SCHEMA = `{
  "sleep_hours": number (0-12),
  "exercise_freq": number (0-7 days/week),
  "diet_quality": "poor" | "fair" | "good" | "excellent",
  "stress_level": "low" | "moderate" | "high",
  "screen_time_hours": number (0-16),
  "caffeine_intake": "none" | "low" | "moderate" | "high",
  "social_activity": "very_low" | "low" | "moderate" | "high",
  "water_intake": "very_low" | "low" | "adequate" | "high"
}`;

const EXTRACTION_PROMPT_TEMPLATE = `You are a health habit extraction engine. Extract structured habits from the following user text. If any habit field is missing, infer a reasonable value based on the text and mark it as an assumption.

Return ONLY valid JSON in this exact format:
{
  "habits": ${HABITS_SCHEMA},
  "assumptions_filled": string[] // list field names you had to assume
}

User text:
"""
{{TEXT}}
"""`;

const SIMULATION_PROMPT_TEMPLATE = `You are a health simulation engine. Given a person's habits, simulate the trajectory of ONE specific health dimension over 5 checkpoints (6mo, 1yr, 2yr, 3yr, 5yr). Each checkpoint must have a score 0-100 and a brief event description.

Habits: {{HABITS}}

Dimension to simulate: {{DIMENSION}}

Return ONLY valid JSON in this exact format:
{
  "dimension": "{{DIMENSION}}",
  "unit": "score_0_to_100",
  "timeline": [
    { "checkpoint": "6mo", "value": number, "event": string },
    { "checkpoint": "1yr", "value": number, "event": string },
    { "checkpoint": "2yr", "value": number, "event": string },
    { "checkpoint": "3yr", "value": number, "event": string },
    { "checkpoint": "5yr", "value": number, "event": string }
  ]
}`;

export async function extractHabits(text: string): Promise<ExtractionResult> {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: text must be a non-empty string");
  }

  const prompt = EXTRACTION_PROMPT_TEMPLATE.replace("{{TEXT}}", text);
  const raw = await callOllama(prompt);
  const parsed = parseJsonResponse<{
    habits: Habits;
    assumptions_filled: string[];
  }>(raw);

  if (!parsed.habits || typeof parsed.habits !== "object") {
    throw new Error("Invalid extraction response: missing habits object");
  }
  if (!Array.isArray(parsed.assumptions_filled)) {
    throw new Error("Invalid extraction response: assumptions_filled must be an array");
  }

  return {
    habits: parsed.habits,
    assumptions_filled: parsed.assumptions_filled,
  };
}

export async function simulateDimension(
  habits: Habits,
  dimension: DimensionKey
): Promise<DimensionResult> {
  if (!habits || typeof habits !== "object") {
    throw new Error("Invalid input: habits must be an object");
  }
  if (!dimension) {
    throw new Error("Invalid input: dimension must be provided");
  }

  const prompt = SIMULATION_PROMPT_TEMPLATE
    .replace("{{HABITS}}", JSON.stringify(habits))
    .replace(/\{\{DIMENSION\}\}/g, dimension);

  const raw = await callOllama(prompt);
  const parsed = parseJsonResponse<DimensionResult>(raw);

  if (parsed.dimension !== dimension) {
    throw new Error(
      `Invalid simulation response: expected dimension '${dimension}', got '${parsed.dimension}'`
    );
  }
  if (parsed.unit !== "score_0_to_100") {
    throw new Error(`Invalid simulation response: unexpected unit '${parsed.unit}'`);
  }
  if (!Array.isArray(parsed.timeline) || parsed.timeline.length !== CHECKPOINTS.length) {
    throw new Error(
      `Invalid simulation response: timeline must have exactly ${CHECKPOINTS.length} checkpoints`
    );
  }

  for (let i = 0; i < CHECKPOINTS.length; i++) {
    const point = parsed.timeline[i];
    if (point.checkpoint !== CHECKPOINTS[i]) {
      throw new Error(
        `Invalid simulation response: expected checkpoint '${CHECKPOINTS[i]}' at index ${i}, got '${point.checkpoint}'`
      );
    }
    if (typeof point.value !== "number" || point.value < 0 || point.value > 100) {
      throw new Error(
        `Invalid simulation response: value at ${point.checkpoint} must be a number 0-100`
      );
    }
    if (!point.event || typeof point.event !== "string") {
      throw new Error(
        `Invalid simulation response: event at ${point.checkpoint} must be a non-empty string`
      );
    }
  }

  return parsed;
}
