# AnotherMe — Project Plan

Date: 2026-05-09

## Summary

AnotherMe is a health simulation web app where users type a natural-language description of their daily habits and the system simulates what happens to their health across 6 months to 5 years. The experience is driven by a pixel art humanoid silhouette split-screen (now-you vs future-you) alongside animated stat charts — powered by Ollama (gemma4:31b-cloud) with a Next.js backend orchestrating 10 parallel dimension calls.

---

## Core Concept

> "What will happen to me if I sleep only 5 hours every day for the next 5 years?"

Users describe their habits freely. AnotherMe extracts those habits, shows assumptions for review/editing, simulates the long-term impact across 10 health dimensions, and renders the results as a living pixel art humanoid that visibly transforms over time — alongside animated health stats.

---

## Resolved Design Decisions

| Decision                           | Choice                                          | Rationale                                                                 |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| Model                              | Ollama `gemma4:31b-cloud`                       | Per TASK.md — called via standard Ollama client, cloud-hosted            |
| Backend                            | Next.js API routes                              | Stays in JS ecosystem, no separate server, replaces Vite                 |
| Architecture                       | 1 orchestrator call → backend fans out 10 dims   | TASK.md specifies 1 API call with sub-agents; backend handles fan-out   |
| Concurrency                        | 5 parallel calls max (pool)                     | Protects against throttling while staying fast (~15s total)               |
| Error handling                     | Fail gracefully, no retries                      | Return successful dimensions, show "unavailable" for failed               |
| Visual style                       | Hybrid avatar + stat charts                      | Emotional hook (avatar) + analytical depth (charts)                     |
| Avatar style                       | 16×24 CSS div pixel grid, humanoid silhouette    | Abstract pixels suggesting "person" — enables posture expression         |
| Health state visuals               | Posture + color vibrancy + size + particles      | Full expressive range, most intuitive signal for human health            |
| Split screen                        | Side by side, glowing pulsing gap                | Visual separation with feeling of connection, "NOW" / checkpoint labels |
| Input method                       | Single centered text box, minimal, dramatic     | Magical feel — user asks a question, not fills a form                   |
| Assumption review                  | Inline form after extraction, before simulation | Transparency + user control; sliders for numeric, dropdowns for categorical |
| Health score calculation           | Simple average of 10 dimension scores            | Transparent, debuggable, no controversial medical weighting              |
| Timeline scrubber                  | Auto-play (accelerating) + manual step buttons   | Acceleration mirrors compounding; manual override for exploration        |
| Page layout                        | Vertical stack: blobs → charts → scrubber        | Blob commands full-width attention, eye scans naturally down             |
| Dimension charts                   | 2×5 grid of small sparkline charts              | Each dimension gets its own visual space, scannable at a glance         |
| Color palette                      | Dark minimal — near-black, muted grays           | Blob and charts are the only color; health decline feels stark           |
| Recovery path                      | No — out of MVP scope                            | Keep it lean                                                              |
| Healthy habits                     | Render as-is, no special casing                 | Model returns realistic trajectories; Thriving state handles high scores  |

---

## Architecture

### Layer 0 — Frontend Entry

Next.js App Router with three views:

1. **Landing page** — Single centered text box with placeholder question, minimal chrome, dark void background.
2. **Assumption review** — Inline form showing extracted habits with sliders (numeric) and dropdowns (categorical), "Simulate" button below.
3. **Results page** — Vertical stack: split-screen pixel art → 2×5 chart grid → timeline scrubber.

---

### Layer 1 — Input & Extraction

- User types freely: _"I sleep 5 hours, drink 3 coffees, skip lunch, sit for 10 hours"_
- Frontend sends text to `POST /api/extract`
- Backend calls Ollama `gemma4:31b-cloud` to extract structured habits
- Model fills in reasonable defaults for unmentioned habits
- Frontend renders assumption review form for user to inspect/edit

**Extraction output schema:**

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

**Habit field types for review form:**

| Field              | Type     | Slider Range / Dropdown Values            |
| ------------------ | -------- | ----------------------------------------- |
| sleep_hours        | slider   | 0–12                                      |
| exercise_freq      | slider   | 0–7 (days/week)                           |
| diet_quality       | dropdown | poor / fair / good / excellent            |
| stress_level       | dropdown | low / moderate / high                     |
| screen_time_hours  | slider   | 0–16                                      |
| caffeine_intake    | dropdown | none / low / moderate / high              |
| social_activity    | dropdown | very_low / low / moderate / high          |
| water_intake       | dropdown | very_low / low / adequate / high          |

---

### Layer 2 — Simulation Engine (Backend Fan-Out)

After user confirms/edits habits, frontend sends habits to `POST /api/simulate`.

Backend fires **10 simultaneous dimension calls** via Ollama, with **concurrency limit of 5**.

If any dimension call fails, it's omitted from results and marked as `"unavailable"`.

**10 Health Dimensions:**

1. Energy
2. Mood / Emotional State
3. Focus / Concentration
4. Sleep Quality
5. Physical Fitness
6. Stress Level
7. Immune Strength
8. Metabolism
9. Social Drive
10. Longevity Score

**Timeline checkpoints:** 6mo · 1yr · 2yr · 3yr · 5yr

**Agent output schema (per dimension):**

```json
{
  "dimension": "energy",
  "unit": "score_0_to_100",
  "timeline": [
    { "checkpoint": "6mo", "value": 65, "event": "Chronic fatigue setting in" },
    { "checkpoint": "1yr", "value": 52, "event": "Relying heavily on caffeine" },
    { "checkpoint": "2yr", "value": 44, "event": "Burnout cycle begins" },
    { "checkpoint": "3yr", "value": 38, "event": "Persistent low energy baseline" },
    { "checkpoint": "5yr", "value": 30, "event": "Energy debt difficult to reverse" }
  ]
}
```

**Aggregation:** Overall health score = simple average of all available dimension scores at each checkpoint.

---

### Layer 3 — Render Layer

#### Panel A — Pixel Art Split-Screen

- **Left:** "Now You" — static baseline humanoid silhouette at full health
- **Right:** "Future You" — silhouette whose properties shift based on aggregated health score
- Separated by a **glowing pulsing gap**
- Built with a **16×24 CSS div pixel grid** (2D array of colored divs)
- Transitions between states use CSS transitions

**Health state mapping:**

| Score  | State     | Size      | Color Vibrancy | Posture        | Particles          |
| ------ | --------- | --------- | -------------- | -------------- | ------------------ |
| 80–100 | Thriving  | Full      | Bright, vivid  | Upright, open  | Warm glow, rising  |
| 60–79  | Stable    | 95%       | Normal palette  | Neutral        | None               |
| 40–59  | Declining | 85%       | Desaturated     | Slight slouch  | None               |
| 20–39  | Critical  | 75%       | Dark, muted     | Hunched        | Flicker, glitch    |
| 0–19   | Severe    | 65%       | Near-monochrome | Collapsed      | Distortion, static |

**Idle animations:** Bouncy (thriving), steady (stable), sluggish (declining), erratic (critical), near-still (severe).

#### Panel B — Animated Stat Charts

- 2×5 grid of small sparkline-style charts
- One line per dimension, rendered with **Recharts**
- All 10 charts animate when checkpoint changes
- Color-coded per dimension
- Hovering a line shows the event description from the agent JSON
- Unavailable dimensions show a muted "data unavailable" placeholder

#### Timeline Scrubber

- **Auto-play animation** that accelerates through checkpoints (starts slow, speeds up)
  - 6mo: 4s, 1yr: 3s, 2yr: 2.5s, 3yr: 2s, 5yr: 1.5s
- **Manual step buttons** (6mo, 1yr, 2yr, 3yr, 5yr) for direct control
- Both panels (split-screen + charts) update in sync with scrubber

---

## Tech Stack

```
Framework:    Next.js (App Router, TypeScript)
Styling:      Tailwind CSS
Pixel Art:    16×24 CSS div grid — pure code, no image assets
Charts:       Recharts (animated sparkline LineCharts)
LLM:          Ollama — gemma4:31b-cloud (cloud-hosted)
State:        React useState / useReducer — all in-memory, no database for MVP
```

---

## User Flow

```
1. Landing page — dark void, centered text box, placeholder question
        ↓
2. User types their daily habits freely
        ↓
3. POST /api/extract → extracts habits JSON
        ↓
4. Assumption review form — sliders + dropdowns, user edits if needed
        ↓
5. POST /api/simulate → backend fans out 10 dimension calls (concurrency 5)
        ↓
6. Loading screen — pixel silhouette "processing" animation
        ↓
7. Simulation result renders:
   - Split-screen pixel art (now vs future, glowing gap separator)
   - 2×5 grid of dimension sparkline charts
   - Auto-play timeline scrubber (accelerating) with manual override
        ↓
8. Auto-play animates through checkpoints, user can manually step
        ↓
9. User can re-run with a different habit description
```

---

## API Routes

### `POST /api/extract`

- **Input:** `{ "text": "I sleep 5 hours, drink 3 coffees..." }`
- **Output:** Extraction schema (habits + assumptions_filled)
- **Single Ollama call** to gemma4:31b-cloud

### `POST /api/simulate`

- **Input:** `{ "habits": { ... } }` (possibly edited by user)
- **Output:** Array of 10 dimension schemas (some may be `"unavailable"`)
- **Backend fan-out:** 10 calls to gemma4:31b-cloud, concurrency limit 5, no retries

---

## Color Palette

```
Background:     #0a0a0a (near-black void)
Surface:        #111111 (cards, panels)
Border:         #1a1a1a (subtle separators)
Text primary:   #e5e5e5 (off-white)
Text secondary: #737373 (muted gray)
Accent:         varies per dimension (the only color on screen)
Glow gap:       #ffffff10 — pulsing white with low opacity
```

**Dimension colors:**

| Dimension         | Color   |
| ----------------- | ------- |
| Energy            | #FACC15 |
| Mood              | #A855F7 |
| Focus             | #3B82F6 |
| Sleep Quality     | #6366F1 |
| Physical Fitness  | #22C55E |
| Stress Level      | #EF4444 |
| Immune Strength   | #14B8A6 |
| Metabolism        | #F97316 |
| Social Drive      | #EC4899 |
| Longevity Score   | #EAB308 |

---

## MVP Scope

**In scope:**

- Free-text habit input
- Ollama extraction call
- Assumption review/edit form (sliders + dropdowns)
- 10 parallel dimension calls via backend fan-out (concurrency 5)
- Split-screen pixel art humanoid (5 health states: posture + color + size + particles)
- 2×5 sparkline chart grid
- Auto-play timeline scrubber (accelerating) with manual override
- 5 time checkpoints (6mo, 1yr, 2yr, 3yr, 5yr)
- Dark minimal visual theme
- Graceful degradation for failed dimension calls

**Out of scope for MVP:**

- Recovery path / "what if I changed?" feature
- User accounts / saved simulations
- Comparison between two different habit scenarios
- Personalization beyond the text input (age, gender, baseline health)
- Mobile-optimized layout
- Sharing / screenshot export
- Retry logic for failed API calls