# AnotherMe

> "What will happen to me if I sleep only 5 hours every day for the next 5 years?"

AnotherMe is a health simulation web app that turns your daily habits into a visceral, visual experience. Type a free-form description of your lifestyle, review the extracted habits, and watch a pixel-art avatar transform over time — alongside animated sparkline charts showing your trajectory across 10 health dimensions.

Built as a Next.js application powered by OpenRouter (Gemma 4), AnotherMe makes the long-term consequences of daily habits feel immediate and emotionally real.

---

## Features

- **Natural language input** — Describe your habits in plain text; no forms to fill out
- **Habit extraction & review** — See what the model extracted and which habits were assumed. Edit values with sliders and dropdowns before simulating
- **10-dimension parallel simulation** — Energy, Mood, Focus, Sleep Quality, Physical Fitness, Stress, Immune Strength, Metabolism, Social Drive, and Longevity Score
- **Pixel-art split-screen** — "Now You" vs "Future You" rendered as a 16×24 CSS pixel grid that changes posture, color, size, and particles based on health state
- **Animated sparkline charts** — A 2×5 grid of Recharts sparklines, one per dimension, color-coded and hoverable for event descriptions
- **Accelerating timeline scrubber** — Auto-play through checkpoints (6mo → 1yr → 2yr → 3yr → 5yr) with increasing speed, plus manual step buttons
- **Dark minimal theme** — Near-black void background so the avatar and charts are the only color on screen
- **Graceful degradation** — Failed dimension calls show "Data unavailable" instead of crashing the experience

---

## Tech Stack

| Layer       | Technology                                         |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 16 (App Router, TypeScript)                |
| Styling     | Tailwind CSS v4                                    |
| Charts      | Recharts                                           |
| LLM Backend | OpenRouter — `google/gemma-4-31b-it`               |
| State       | React `useState` / `useReducer` (in-memory, no DB) |
| Testing     | Node.js built-in test runner + `tsx`               |

---

## Architecture

```
User text
    → POST /api/extract
        → OpenRouter (gemma-4-31b-it) extracts structured habits
    → Assumption review form (sliders + dropdowns)
    → POST /api/simulate
        → Backend fans out 10 dimension calls
        → Concurrency limit: 5 parallel calls max
        → Failed calls marked as "unavailable"
        → Aggregated health score = simple average per checkpoint
    → Results view
        → PixelGrid (Now You vs Future You)
        → DimensionChart grid (2×5)
        → TimelineScrubber (auto-play + manual)
```

### Health States

| Score  | State     | Size | Color           | Posture       | Particles  |
| ------ | --------- | ---- | --------------- | ------------- | ---------- |
| 80–100 | Thriving  | 100% | Bright vivid    | Upright       | Warm glow  |
| 60–79  | Stable    | 95%  | Normal palette  | Neutral       | None       |
| 40–59  | Declining | 85%  | Desaturated     | Slight slouch | None       |
| 20–39  | Critical  | 75%  | Dark muted      | Hunched       | Glitch     |
| 0–19   | Severe    | 65%  | Near-monochrome | Collapsed     | Distortion |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

### Installation

```bash
cd anotherme
npm install
```

### Environment Variables

Create a `.env.local` file in the `anotherme/` directory:

```env
OPENROUTER_API_KEY=sk-or-v1-...
```

> `.env.local` is already gitignored. Never commit your API key.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## API Routes

### `POST /api/extract`

Extract structured habits from free-form text.

**Request:**

```json
{
  "text": "I sleep 5 hours, drink 3 coffees, skip lunch, sit for 10 hours"
}
```

**Response:**

```json
{
  "habits": {
    "sleep_hours": 5,
    "exercise_freq": 0,
    "diet_quality": "poor",
    "stress_level": "high",
    "screen_time_hours": 10,
    "caffeine_intake": "high",
    "social_activity": "low",
    "water_intake": "low"
  },
  "assumptions_filled": ["exercise_freq", "social_activity"]
}
```

### `POST /api/simulate`

Simulate 10 health dimensions in parallel.

**Request:**

```json
{
  "habits": {
    /* Habits object */
  }
}
```

**Response:**

```json
{
  "dimensions": [
    {
      "dimension": "energy",
      "unit": "score_0_to_100",
      "timeline": [
        {
          "checkpoint": "6mo",
          "value": 65,
          "event": "Chronic fatigue setting in"
        },
        {
          "checkpoint": "1yr",
          "value": 52,
          "event": "Relying heavily on caffeine"
        },
        { "checkpoint": "2yr", "value": 44, "event": "Burnout cycle begins" },
        {
          "checkpoint": "3yr",
          "value": 38,
          "event": "Persistent low energy baseline"
        },
        {
          "checkpoint": "5yr",
          "value": 30,
          "event": "Energy debt difficult to reverse"
        }
      ]
    }
    /* ... 9 more dimensions, or "unavailable" for failed calls */
  ],
  "aggregated": {
    "6mo": 62.5,
    "1yr": 51.3,
    "2yr": 43.8,
    "3yr": 37.2,
    "5yr": 29.5
  }
}
```

---

## Testing

Run the backend unit tests:

```bash
npx tsx --test src/lib/*.test.ts
```

Test coverage:

- **Health State** — Boundary tests for all 5 score ranges (0, 19, 20, 39, 40, 59, 60, 79, 80, 100)
- **Concurrency Pool** — Concurrency limit enforcement, partial failure handling, total failure handling
- **Ollama Client** — JSON parsing (valid, markdown-wrapped, malformed, missing fields)

---

## Project Structure

```
anotherme/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── extract/route.ts      # Habit extraction API
│   │   │   └── simulate/route.ts     # Simulation fan-out API
│   │   ├── globals.css               # Dark theme + animations
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main app (idle → review → loading → results)
│   ├── components/
│   │   ├── DimensionChart.tsx        # Recharts sparkline per dimension
│   │   ├── HabitReviewForm.tsx       # Editable sliders + dropdowns
│   │   ├── PixelGrid.tsx             # 16×24 CSS pixel-art humanoid
│   │   └── TimelineScrubber.tsx      # Auto-play + manual checkpoint controls
│   └── lib/
│       ├── health.test.ts            # Health state tests
│       ├── health.ts                 # Score → state mapping & aggregation
│       ├── ollama.test.ts            # JSON parsing tests
│       ├── ollama.ts                 # OpenRouter client (extraction + simulation)
│       ├── pool.test.ts              # Concurrency pool tests
│       ├── pool.ts                   # 10-dimension fan-out with concurrency limit
│       └── types.ts                  # Shared TypeScript types & constants
├── .env.local                         # OpenRouter API key (gitignored)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Design Decisions

| Decision                             | Rationale                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| OpenRouter (`google/gemma-4-31b-it`) | Cloud-hosted Gemma 4 via OpenAI-compatible API; no local GPU required           |
| Native `fetch` for LLM calls         | Simple enough for a single endpoint; no heavy client library needed             |
| Concurrency limit of 5               | Protects against rate limiting while keeping total simulation time ~15s         |
| No retries on failure                | Graceful degradation: show "unavailable" rather than block the whole experience |
| Simple average for aggregation       | Transparent, debuggable, avoids controversial medical weighting                 |
| CSS div grid for pixel art           | Pure code, no image assets; enables smooth posture/color/size transitions       |
| In-memory state only                 | MVP scope — no DB, auth, or persistence needed                                  |
| Node.js built-in test runner         | Lightweight; no Jest/Vitest setup overhead for 3 pure modules                   |

---

## Out of Scope (MVP)

- Recovery path / "what if I changed?" re-simulation
- User accounts, authentication, or saved simulations
- Comparison between two scenarios
- Personalization beyond text input (age, gender, baseline health)
- Mobile-optimized layout
- Sharing / screenshot export
- Retry logic for failed API calls
- Database or persistent storage
- Accessibility beyond basic semantic HTML
- Internationalization

---

## License

MIT
