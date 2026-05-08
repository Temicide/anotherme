import { describe, it } from "node:test";
import assert from "node:assert";
import { runSimulation, type SimulateDimensionFn } from "./pool";
import { type Habits, type DimensionResult, type DimensionKey } from "./types";

const validHabits: Habits = {
  sleep_hours: 7,
  exercise_freq: 3,
  diet_quality: "good",
  stress_level: "low",
  screen_time_hours: 5,
  caffeine_intake: "low",
  social_activity: "moderate",
  water_intake: "adequate",
};

function createMockResult(dimension: DimensionKey): DimensionResult {
  return {
    dimension,
    unit: "score_0_to_100",
    timeline: [
      { checkpoint: "6mo", value: 70, event: "Event 1" },
      { checkpoint: "1yr", value: 65, event: "Event 2" },
      { checkpoint: "2yr", value: 60, event: "Event 3" },
      { checkpoint: "3yr", value: 55, event: "Event 4" },
      { checkpoint: "5yr", value: 50, event: "Event 5" },
    ],
  };
}

describe("runSimulation", () => {
  it("fans out all 10 dimensions and returns aggregated scores", async () => {
    const simulateFn: SimulateDimensionFn = async (_habits, dimension) => {
      return createMockResult(dimension);
    };

    const result = await runSimulation(validHabits, { simulateFn });

    assert.strictEqual(result.dimensions.length, 10);
    for (const dim of result.dimensions) {
      assert.notStrictEqual(dim, "unavailable");
    }
    assert.strictEqual(result.aggregated["6mo"], 70);
    assert.strictEqual(result.aggregated["1yr"], 65);
    assert.strictEqual(result.aggregated["2yr"], 60);
    assert.strictEqual(result.aggregated["3yr"], 55);
    assert.strictEqual(result.aggregated["5yr"], 50);
  });

  it("marks failed dimensions as unavailable and still aggregates available ones", async () => {
    const simulateFn: SimulateDimensionFn = async (_habits, dimension) => {
      if (dimension === "energy" || dimension === "mood") {
        throw new Error("Simulated failure");
      }
      return createMockResult(dimension);
    };

    const result = await runSimulation(validHabits, { simulateFn });

    assert.strictEqual(result.dimensions.length, 10);
    const unavailableCount = result.dimensions.filter((d) => d === "unavailable").length;
    assert.strictEqual(unavailableCount, 2);

    // 8 remaining dimensions with value 70 at 6mo => avg = 70
    assert.strictEqual(result.aggregated["6mo"], 70);
  });

  it("throws if all dimensions fail", async () => {
    const simulateFn: SimulateDimensionFn = async () => {
      throw new Error("Simulated failure");
    };

    await assert.rejects(
      async () => runSimulation(validHabits, { simulateFn }),
      /All dimension simulations failed/
    );
  });

  it("respects concurrency limit of 5", async () => {
    let maxRunning = 0;
    let currentRunning = 0;

    const simulateFn: SimulateDimensionFn = async (_habits, dimension) => {
      currentRunning++;
      if (currentRunning > maxRunning) {
        maxRunning = currentRunning;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
      currentRunning--;
      return createMockResult(dimension);
    };

    await runSimulation(validHabits, { concurrency: 5, simulateFn });
    assert.strictEqual(maxRunning <= 5, true, `Expected maxRunning <= 5, got ${maxRunning}`);
  });

  it("throws for invalid habits input", async () => {
    await assert.rejects(
      async () => runSimulation(null as unknown as Habits, { simulateFn: createMockResult as unknown as SimulateDimensionFn }),
      /Invalid input: habits must be an object/
    );
  });

  it("throws for missing simulateFn", async () => {
    await assert.rejects(
      async () => runSimulation(validHabits, {}),
      /Invalid input: simulateFn must be provided/
    );
  });
});
