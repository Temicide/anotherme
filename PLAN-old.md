# AnotherMe — Project Plan

Date: 2026-05-08

## Summary

AnotherMe is a health simulation web app where users type a natural-language description of their
daily habits and the system simulates what happens to their health across 6 months to 5 years.
The experience is driven by a pixel art split-screen (now-you vs future-you) alongside animated
stat charts — all powered by 10 parallel Claude API agents returning structured JSON timelines.

---

## Core Concept

> "What will happen to me if I sleep only 5 hours every day for the next 5 years?"

Users describe their habits freely. AnotherMe extracts those habits, simulates the long-term
impact across 10 health dimensions, and renders the results as a living pixel art character
that visibly transforms over time — alongside animated health stats.

---

## Design Decisions

| Decision         | Choice                             | Rationale                                               |
| ---------------- | ---------------------------------- | ------------------------------------------------------- |
| Visual style     | Hybrid avatar + stat charts        | Emotional hook (avatar) + analytical depth (charts)     |
| Input method     | Free-text natural language         | Feels magical, Claude interprets and fills gaps         |
| Avatar style     | Pixel art (CSS grid), split-screen | Retro-game charm, code-driven (no assets needed)        |
| Split-screen     | "Now You" vs "Future You"          | Most emotionally impactful, shareable moment            |
| Tech stack       | React + CSS pixel grid + Recharts  | Approachable, no asset pipeline, fully hackable         |
| Simulation range | Long-term: 6 months → 5 years      | Shows real compounding effects, dramatic transformation |

---

## Architecture

### Layer 1 — Input & Extraction

- User types freely: _"I sleep 5 hours, drink 3 coffees, skip lunch, sit for 10 hours"_
- Orchestrator API call to Claude extracts structured habits
- Claude fills in reasonable defaults for unmentioned habits

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

---

### Layer 2 — Simulation Engine (10 Parallel Agents)

After extraction, fire **10 simultaneous Anthropic API calls** via `Promise.all()`.
Each call simulates one health dimension independently and returns a timeline.

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
  "agent_id": 1,
  "unit": "score_0_to_100",
  "timeline": [
    { "checkpoint": "6mo", "value": 65, "event": "Chronic fatigue setting in" },
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
```

---

### Layer 3 — Render Layer

Two UI panels updating together as the user scrubs through the timeline:

#### Panel A — Pixel Art Split-Screen

- **Left:** "Now You" — static baseline pixel character
- **Right:** "Future You" — character whose color map, posture arrangement, and aura
  shift based on the aggregated health score at each checkpoint
- Built with a **CSS div pixel grid** (2D array of colored divs)
- Each health score range maps to a character state:

| Score  | State     | Visual                                   |
| ------ | --------- | ---------------------------------------- |
| 80–100 | Thriving  | Bright colors, glowing aura, upright     |
| 60–79  | Stable    | Normal palette, neutral posture          |
| 40–59  | Declining | Desaturated, slouched arrangement        |
| 20–39  | Critical  | Dark palette, glitch effects, flickering |
| 0–19   | Severe    | Near-monochrome, heavy distortion        |

- Idle animation variants per state (bouncy vs sluggish vs flickering)
- CSS transitions handle the morph between checkpoints

#### Panel B — Animated Stat Charts

- One line per health dimension rendered with **Recharts**
- All 10 lines animate simultaneously when checkpoint changes
- Color-coded per dimension (energy = yellow, mood = purple, etc.)
- Hovering a line shows the event description from the agent JSON

---

## Tech Stack

```
Frontend:     React (Vite)
Pixel Art:    CSS div grid — pure code, no image assets
Charts:       Recharts (animated LineChart)
API:          Anthropic API — claude-sonnet-4-20250514
Styling:      Tailwind CSS
State:        useState / useReducer (all in-memory, no backend needed for MVP)
```

---

## User Flow

```
1. Landing page — tagline + text input box
        ↓
2. User types their daily habits freely
        ↓
3. Orchestrator call → extracts habits JSON (with assumption transparency)
        ↓
4. 10 parallel agent calls fire simultaneously (Promise.all)
        ↓
5. Loading screen — pixel art character "loading" animation
        ↓
6. Simulation result renders:
   - Split-screen pixel art (now vs future)
   - 10 animated stat charts
   - Timeline scrubber (6mo → 5yr)
        ↓
7. User scrubs timeline → both panels update in sync
        ↓
8. User can re-run with a different habit description
```

---

## MVP Scope

**In scope:**

- Free-text habit input
- Orchestrator extraction call
- 10 parallel dimension agents
- Split-screen pixel art character (5 health states)
- Animated stat charts with timeline scrubber
- 5 time checkpoints (6mo, 1yr, 2yr, 3yr, 5yr)

**Out of scope for MVP:**

- User accounts / saved simulations
- Comparison between two different habit scenarios
- Personalization beyond the text input (age, gender, baseline health)
- Mobile-optimized layout
- Sharing / screenshot export

---

## Open Questions

- What does the pixel art character look like at baseline? (Design the sprite first)
- Should the orchestrator reveal what assumptions it filled in, so the user can correct them?
- Should bad outcomes show a "recovery path" — i.e., what to change to reverse the damage?
- What happens if the user describes already-healthy habits? (Need a "thriving" arc, not just decline)
- Rate limiting strategy for 10 parallel API calls per simulation run?
