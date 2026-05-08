import { describe, it } from "node:test";
import assert from "node:assert";
import { getHealthState, aggregateScore } from "./health";
import { type DimensionResult } from "./types";

describe("getHealthState", () => {
  it("returns Severe for score 0", () => {
    const state = getHealthState(0);
    assert.strictEqual(state.name, "Severe");
    assert.deepStrictEqual(state.colorPalette, ["#262626", "#404040", "#171717"]);
    assert.strictEqual(state.postureGridRef, "collapsed");
    assert.strictEqual(state.sizeMultiplier, 0.65);
    assert.strictEqual(state.particleType, "distortion");
  });

  it("returns Severe for score 19", () => {
    const state = getHealthState(19);
    assert.strictEqual(state.name, "Severe");
  });

  it("returns Critical for score 20", () => {
    const state = getHealthState(20);
    assert.strictEqual(state.name, "Critical");
    assert.deepStrictEqual(state.colorPalette, ["#525252", "#737373", "#404040"]);
    assert.strictEqual(state.postureGridRef, "hunched");
    assert.strictEqual(state.sizeMultiplier, 0.75);
    assert.strictEqual(state.particleType, "glitch");
  });

  it("returns Critical for score 39", () => {
    const state = getHealthState(39);
    assert.strictEqual(state.name, "Critical");
  });

  it("returns Declining for score 40", () => {
    const state = getHealthState(40);
    assert.strictEqual(state.name, "Declining");
    assert.deepStrictEqual(state.colorPalette, ["#A3A3A3", "#D4D4D4", "#E5E5E5"]);
    assert.strictEqual(state.postureGridRef, "slight_slouch");
    assert.strictEqual(state.sizeMultiplier, 0.85);
    assert.strictEqual(state.particleType, "none");
  });

  it("returns Declining for score 59", () => {
    const state = getHealthState(59);
    assert.strictEqual(state.name, "Declining");
  });

  it("returns Stable for score 60", () => {
    const state = getHealthState(60);
    assert.strictEqual(state.name, "Stable");
    assert.deepStrictEqual(state.colorPalette, ["#A3E635", "#D9F99D", "#BEF264"]);
    assert.strictEqual(state.postureGridRef, "neutral");
    assert.strictEqual(state.sizeMultiplier, 0.95);
    assert.strictEqual(state.particleType, "none");
  });

  it("returns Stable for score 79", () => {
    const state = getHealthState(79);
    assert.strictEqual(state.name, "Stable");
  });

  it("returns Thriving for score 80", () => {
    const state = getHealthState(80);
    assert.strictEqual(state.name, "Thriving");
    assert.deepStrictEqual(state.colorPalette, ["#FACC15", "#FDE047", "#FEF08A"]);
    assert.strictEqual(state.postureGridRef, "upright");
    assert.strictEqual(state.sizeMultiplier, 1.0);
    assert.strictEqual(state.particleType, "warm_glow");
  });

  it("returns Thriving for score 100", () => {
    const state = getHealthState(100);
    assert.strictEqual(state.name, "Thriving");
  });

  it("throws for negative score", () => {
    assert.throws(() => getHealthState(-1), /Score must be between 0 and 100/);
  });

  it("throws for score above 100", () => {
    assert.throws(() => getHealthState(101), /Score must be between 0 and 100/);
  });
});

describe("aggregateScore", () => {
  it("returns zeros for empty array", () => {
    const result = aggregateScore([]);
    assert.deepStrictEqual(result, { "6mo": 0, "1yr": 0, "2yr": 0, "3yr": 0, "5yr": 0 });
  });

  it("computes simple average across dimensions", () => {
    const dimensions: DimensionResult[] = [
      {
        dimension: "energy",
        unit: "score_0_to_100",
        timeline: [
          { checkpoint: "6mo", value: 80, event: "A" },
          { checkpoint: "1yr", value: 70, event: "B" },
          { checkpoint: "2yr", value: 60, event: "C" },
          { checkpoint: "3yr", value: 50, event: "D" },
          { checkpoint: "5yr", value: 40, event: "E" },
        ],
      },
      {
        dimension: "mood",
        unit: "score_0_to_100",
        timeline: [
          { checkpoint: "6mo", value: 60, event: "F" },
          { checkpoint: "1yr", value: 50, event: "G" },
          { checkpoint: "2yr", value: 40, event: "H" },
          { checkpoint: "3yr", value: 30, event: "I" },
          { checkpoint: "5yr", value: 20, event: "J" },
        ],
      },
    ];

    const result = aggregateScore(dimensions);
    assert.strictEqual(result["6mo"], 70);
    assert.strictEqual(result["1yr"], 60);
    assert.strictEqual(result["2yr"], 50);
    assert.strictEqual(result["3yr"], 40);
    assert.strictEqual(result["5yr"], 30);
  });

  it("handles single dimension", () => {
    const dimensions: DimensionResult[] = [
      {
        dimension: "energy",
        unit: "score_0_to_100",
        timeline: [
          { checkpoint: "6mo", value: 50, event: "A" },
          { checkpoint: "1yr", value: 55, event: "B" },
          { checkpoint: "2yr", value: 60, event: "C" },
          { checkpoint: "3yr", value: 65, event: "D" },
          { checkpoint: "5yr", value: 70, event: "E" },
        ],
      },
    ];

    const result = aggregateScore(dimensions);
    assert.strictEqual(result["6mo"], 50);
    assert.strictEqual(result["1yr"], 55);
    assert.strictEqual(result["2yr"], 60);
    assert.strictEqual(result["3yr"], 65);
    assert.strictEqual(result["5yr"], 70);
  });
});
