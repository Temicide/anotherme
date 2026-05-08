# Findings & Decisions

## Requirements
From GitHub issue #1 / PLAN.md:
- Free-text habit input
- ~~Ollama extraction call (`gemma4:31b-cloud`)~~ → **OpenRouter chat completions (`google/gemma-4-27b-it`)**
- Assumption review/edit form with sliders (numeric) and dropdowns (categorical)
- 10 parallel dimension simulations via backend fan-out (concurrency 5)
- 16×24 CSS div pixel art humanoid with 5 health states (posture + color + size + particles)
- 2×5 sparkline chart grid using Recharts
- Auto-play timeline scrubber (accelerating) with manual override
- 5 checkpoints: 6mo, 1yr, 2yr, 3yr, 5yr
- Dark minimal theme (#0a0a0a background)
- Graceful degradation for failed dimension calls

## Research Findings
- Next.js 16.2.6 with App Router is already initialized in `anotherme/`
- Tailwind CSS v4 is configured
- No `node_modules` installed yet
- No existing source files beyond basic layout/page/globals
- Project uses TypeScript

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| `node:test` + `tsx` for testing | Lightweight, no extra test framework needed for pure JS modules |
| Recharts for charts | PRD specifies Recharts; handles sparklines well |
| ~~Ollama client uses fetch directly~~ → **OpenRouter client uses native fetch** | OpenRouter provides OpenAI-compatible chat completions API; native fetch is sufficient |
| All prompt engineering in LLM client module | Single point of contact with the LLM per PRD |
| API key in `.env.local` | Security best practice; keeps secrets out of source control |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| GitHub issue page returned 404 via webfetch | Used `gh issue view` CLI — repo is private but CLI is authenticated |

## Resources
- PRD: `/Users/temicide/Documents/superai-anotherme/PLAN.md`
- Next.js app: `/Users/temicide/Documents/superai-anotherme/anotherme`
- GitHub issue: `https://github.com/Temicide/anotherme/issues/1`

## Visual/Browser Findings
- N/A so far
