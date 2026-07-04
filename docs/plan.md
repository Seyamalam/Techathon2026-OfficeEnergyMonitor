# Implementation Plan

## Objective

Build a fast, polished, real-time office energy monitoring system with:

- Shared backend.
- Dynamic simulated IoT device data.
- Animated live dashboard.
- Discord bot using the same backend.
- Clear diagrams and hardware schematic.
- Strong documentation and commit history.

## Assumptions

- The fixed office setup is authoritative: 3 rooms, each with 2 fans and 3 lights, for 15 total devices.
- No physical hardware is required.
- A representative one-room circuit schematic is enough.
- Office hours are 9 to 5 in Asia/Dhaka time.
- The preliminary round is evaluated from the repository, documentation, code, and demo video.

## Scoring Strategy

The fastest path to a strong score is:

1. Make the shared backend reliable.
2. Make the dashboard visually memorable and obviously live.
3. Make the Discord bot prove it reads the same data.
4. Include clear diagrams and hardware reasoning.
5. Keep setup simple and documentation complete.

## Phase 1 - Foundation

Implemented project structure:

```text
dashboard
bot
docs
wokwi
```

TypeScript is used across the dashboard/backend and bot packages. The simulator is deterministic enough for repeatable demos while still changing over time.

## Phase 2 - Backend And Simulator

Implementation plan:

- Hardcode the office rooms and device definitions.
- Assign realistic wattage values:
  - Fan: 60W when on.
  - Light: 15W when on.
- Update random device states on a timer.
- Keep `lastChanged` and `onSince` timestamps.
- Calculate:
  - Current total watts.
  - Per-room watts.
  - Estimated kWh.
  - Alerts.
- Serve updates through the shared `GET /api/state` contract and optional InstantDB snapshot.

Trade-offs:

- The Next.js API route keeps setup simple.
- InstantDB support gives a clear path to a real shared backend without adding a separate server package.

Validation:

- Call `GET /api/state` and confirm all dashboard and bot values come from it.
- Watch the dashboard poll live state without manual refresh.

## Phase 3 - Dashboard

Implementation plan:

- Build an office layout as the first visual focus.
- Use an SVG top-view room plan for three rooms.
- Show lights as glowing elements.
- Show fans with spin animation while on.
- Add live meters and alerts around the layout.
- Add a compact device panel for completeness.

Trade-offs:

- A hand-built CSS office layout is faster and more controllable than a complex canvas scene.
- CSS animations are reliable for demo and deployment.

Validation:

- Leave dashboard open and verify live changes.
- Test at common laptop widths.
- Confirm no text overlap and no broken responsive layout.

## Phase 4 - Discord Bot

Implementation plan:

- Use `discord.js`.
- Read state from backend endpoints.
- Format friendly command responses.
- Poll or subscribe for alerts, then post new alerts to a configured channel.

Trade-offs:

- Friendly templates are safer than adding an LLM dependency under time pressure.
- The bot now includes `!alerts`, `!devices`, and `!offhours` in addition to the required commands.

Validation:

- Run `!status`, `!room drawing`, `!room work1`, `!room work2`, and `!usage`.
- Compare bot output against dashboard values.

## Phase 5 - Diagrams And Schematic

System diagram:

- Use SVG, not Mermaid.
- Show device simulator, backend API, dashboard, Discord bot, and user.
- Export to `docs/assets/system-architecture.svg`.

Hardware schematic:

- Build a representative one-room design in Wokwi.
- Use ESP32 or Arduino.
- Model 2 fans and 3 lights as representative controlled/sensed loads.
- Include safe conceptual use of relays or opto-isolated sensing.
- Optionally include a current sensor such as ACS712 conceptually.

Validation:

- Confirm the diagram tells the full device-to-user data flow.
- Confirm the schematic makes electrical sense and is documented with pin mapping.

## Phase 6 - Deployment And Demo

Deployment plan:

- Deploy frontend to Vercel.
- Deploy backend to Render or Railway.
- Run bot locally for demo if cloud bot deployment takes too long.

Demo video structure:

1. Problem in 10 seconds.
2. Dashboard live layout and power meter.
3. Alerts.
4. Discord bot commands.
5. Architecture diagram and shared backend explanation.
6. Schematic screenshot.

Validation:

- Demo from a fresh browser session.
- Confirm repository is public.
- Confirm README includes setup and submission links.
