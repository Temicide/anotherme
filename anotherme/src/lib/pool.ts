import {
  type Habits,
  type DimensionKey,
  type DimensionResult,
  type DimensionResultOrUnavailable,
  type SimulationResult,
  DIMENSIONS,
  CHECKPOINTS,
} from "./types";

export type SimulateDimensionFn = (
  habits: Habits,
  dimension: DimensionKey
) => Promise<DimensionResult>;

export interface PoolOptions {
  concurrency?: number;
  simulateFn?: SimulateDimensionFn;
}

export function runSimulation(
  habits: Habits,
  options: PoolOptions = {}
): Promise<SimulationResult> {
  const concurrency = options.concurrency ?? 5;
  const simulateFn = options.simulateFn;

  if (!habits || typeof habits !== "object") {
    return Promise.reject(new Error("Invalid input: habits must be an object"));
  }
  if (!simulateFn) {
    return Promise.reject(new Error("Invalid input: simulateFn must be provided"));
  }

  const run = simulateFn;

  return new Promise((resolve, reject) => {
    const results: DimensionResultOrUnavailable[] = new Array(DIMENSIONS.length);
    let completed = 0;
    let failed = 0;
    let index = 0;
    let running = 0;

    function processNext() {
      if (completed + failed === DIMENSIONS.length) {
        const availableResults = results.filter(
          (r): r is DimensionResult => r !== "unavailable"
        );
        if (availableResults.length === 0) {
          reject(new Error("All dimension simulations failed"));
          return;
        }

        const aggregated: Record<string, number> = {};
        for (const cp of CHECKPOINTS) {
          let sum = 0;
          let count = 0;
          for (const dim of availableResults) {
            const point = dim.timeline.find((t) => t.checkpoint === cp);
            if (point) {
              sum += point.value;
              count++;
            }
          }
          aggregated[cp] = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
        }

        resolve({
          dimensions: results,
          aggregated: aggregated as SimulationResult["aggregated"],
        });
        return;
      }

      while (running < concurrency && index < DIMENSIONS.length) {
        const currentIndex = index++;
        const dimension = DIMENSIONS[currentIndex];
        running++;

        run(habits, dimension)
          .then((result) => {
            results[currentIndex] = result;
            completed++;
            running--;
            processNext();
          })
          .catch(() => {
            results[currentIndex] = "unavailable";
            failed++;
            running--;
            processNext();
          });
      }
    }

    processNext();
  });
}
