# Task Plan: AnotherMe Health Simulation MVP

## Goal
Implement the AnotherMe MVP — a Next.js health simulation web app with Ollama-powered habit extraction, 10-dimension parallel simulation, pixel-art split-screen avatar, animated sparkline charts, and accelerating timeline scrubber.

## Current Phase
Phase 1

## Phases

### Phase 1: Requirements & Discovery
- [x] Read GitHub issue #1 (PRD)
- [x] Read existing PLAN.md and project structure
- [x] Understand constraints: Next.js App Router, Tailwind v4, Ollama gemma4:31b-cloud, no DB, no auth
- [x] Document findings in findings.md
- **Status:** complete

### Phase 2: Setup & Shared Types
- [x] Install dependencies: recharts, tsx
- [x] Create shared TypeScript types/schemas in src/lib/types.ts
- [x] Configure next.config.ts for App Router API routes
- [x] Build passes
- **Status:** complete

### Phase 3: Backend Implementation
- [x] Ollama Client Module — extractHabits + simulateDimension
- [x] Concurrency Pool Module — fan-out 10 calls with limit 5
- [x] Health State Module — score→state mapping, aggregation
- [x] API Routes: POST /api/extract, POST /api/simulate
- [x] Tests for Health State, Concurrency Pool, Ollama Client parsing
- **Status:** complete

### Phase 4: Frontend Components
- [x] PixelGrid component (16×24 CSS div grid, 5 states, idle animations, particles)
- [x] DimensionChart component (Recharts sparkline, hover events, unavailable state)
- [x] TimelineScrubber component (auto-play accelerating + manual buttons)
- [x] HabitReviewForm component (sliders + dropdowns, assumptions highlighted)
- **Status:** complete

### Phase 5: Main App Integration
- [x] globals.css dark minimal theme (#0a0a0a bg)
- [x] layout.tsx with dark theme
- [x] Landing page (centered text input)
- [x] Review page/state (editable habits form)
- [x] Results page/state (split-screen + charts + scrubber)
- [x] State machine: idle → reviewing → loading → results
- **Status:** complete

### Phase 6: Testing & Verification
- [x] Run unit tests (Health State, Concurrency Pool, Ollama Client)
- [x] Build passes (`npm run build`)
- [x] Manual verification of all user stories
- [x] Graceful degradation for failed dimension calls
- **Status:** complete

## Key Questions
1. Is Ollama running locally or via cloud endpoint? → PRD says `gemma4:31b-cloud` via standard Ollama API; assume `http://localhost:11434/api/generate` for dev
2. Should tests use a specific runner? → Next.js doesn't include Jest by default; will add vitest or use node:test for backend modules
3. Are there existing assets in public/? → No relevant ones; pixel art is pure CSS

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use `node:test` + `tsx` for backend tests | No need to add Jest/Vitest complexity for 3 pure modules; native Node test runner is sufficient |
| Keep all state in-memory (useState/useReducer) | PRD explicitly says no DB or persistence for MVP |
| Auto-play acceleration: 4000→3000→2500→2000→1500ms | Per PRD exact values |
| Pixel grid: 16 cols × 24 rows divs | PRD specification |
| Concurrency limit 5, no retries | PRD specification |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| GitHub issue fetch 404 via webfetch | 1 | Used `gh issue view` CLI successfully — repo is private but authenticated |

## Notes
- Project root: `/Users/temicide/Documents/superai-anotherme`
- Next.js app root: `/Users/temicide/Documents/superai-anotherme/anotherme`
- No node_modules installed yet
- Tailwind v4 is already configured
- Recharts must be installed
- All API routes go under `src/app/api/`
