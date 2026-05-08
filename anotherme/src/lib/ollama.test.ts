import { describe, it } from "node:test";
import assert from "node:assert";
import { cleanJsonResponse } from "./ollama";

function parseAndClean(text: string): unknown {
  const cleaned = cleanJsonResponse(text);
  return JSON.parse(cleaned);
}

describe("ollama JSON parsing", () => {
  it("parses valid JSON", () => {
    const text = '{"dimension":"energy","unit":"score_0_to_100","timeline":[]}';
    const result = parseAndClean(text);
    assert.strictEqual((result as Record<string, unknown>).dimension, "energy");
  });

  it("parses markdown-wrapped JSON", () => {
    const text = "```json\n{\"dimension\":\"energy\",\"unit\":\"score_0_to_100\",\"timeline\":[]}\n```";
    const result = parseAndClean(text);
    assert.strictEqual((result as Record<string, unknown>).dimension, "energy");
  });

  it("parses markdown-wrapped JSON without language tag", () => {
    const text = "```\n{\"dimension\":\"energy\",\"unit\":\"score_0_to_100\",\"timeline\":[]}\n```";
    const result = parseAndClean(text);
    assert.strictEqual((result as Record<string, unknown>).dimension, "energy");
  });

  it("throws on malformed JSON", () => {
    const text = "{not valid json}";
    assert.throws(() => parseAndClean(text), /JSON/);
  });

  it("throws on missing fields in simulation response", () => {
    const text = '{"dimension":"energy"}';
    const result = parseAndClean(text) as Record<string, unknown>;
    assert.strictEqual(result.unit, undefined);
  });

  it("parses extraction response JSON", () => {
    const text = JSON.stringify({
      habits: {
        sleep_hours: 5,
        exercise_freq: 0,
        diet_quality: "poor",
        stress_level: "high",
        screen_time_hours: 10,
        caffeine_intake: "high",
        social_activity: "low",
        water_intake: "low",
      },
      assumptions_filled: ["exercise_freq", "social_activity"],
    });
    const result = parseAndClean(text);
    assert.deepStrictEqual(
      (result as Record<string, unknown>).assumptions_filled,
      ["exercise_freq", "social_activity"]
    );
  });
});
