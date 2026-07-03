# Todo

## Immediate

- [ ] Confirm final team name for GitHub repository naming.
- [ ] Create public GitHub repository in the required format: `Techathon2026-[TeamName]`.
- [ ] Add all four team members as repository collaborators.
- [ ] Create GitHub Issues for documentation, diagrams, hardware schematic, testing, demo video, backend, dashboard, and bot.

## Backend

- [x] Initialize TypeScript backend through the Next.js dashboard app.
- [x] Define rooms and 15 simulated devices.
- [x] Build simulator that changes device states over time.
- [x] Calculate total watts and room-level watts.
- [x] Estimate daily kWh from simulated runtime.
- [x] Implement alert rules.
- [x] Add REST API endpoint for shared state.
- [x] Add AI insight endpoint using OpenRouter with fallback.
- [ ] Add Socket.IO real-time updates.
- [ ] Add CORS configuration for dashboard.

## Web Dashboard

- [x] Initialize Next.js/React/TypeScript frontend.
- [x] Connect to backend API.
- [ ] Connect to Socket.IO updates.
- [x] Build top-view office layout.
- [x] Animate lights when on.
- [x] Animate fans when on.
- [x] Add live total power meter.
- [x] Add per-room power breakdown.
- [x] Add device status panel grouped by room.
- [x] Add active alerts panel.
- [x] Add AI Energy Coach panel.
- [x] Make dashboard responsive for demo laptop screens.
- [x] Polish loading, empty, and disconnected states.

## Discord Bot

- [x] Initialize Discord bot package.
- [x] Read backend URL from environment variable.
- [x] Implement `!status`.
- [x] Implement `!room <name>`.
- [x] Implement `!usage`.
- [x] Implement `!alerts`.
- [x] Implement `!devices`.
- [x] Implement `!offhours`.
- [x] Implement `!advice`.
- [x] Humanize responses.
- [x] Add proactive alert posting to configured channel.
- [x] Document bot setup and permissions.

## Diagrams And Hardware

- [x] Create high-level system diagram without Mermaid.
- [x] Export diagram image to `docs/assets/`.
- [x] Create representative one-room circuit schematic in Wokwi or Tinkercad.
- [x] Export schematic artifact to `docs/assets/`.
- [x] Add pin mapping and electrical reasoning to docs.

## Documentation

- [x] Update README after implementation.
- [x] Add final setup instructions.
- [x] Add API endpoint documentation.
- [x] Add Discord command examples.
- [x] Add AI integration details.
- [x] Add attribution for libraries, APIs, assets, and AI assistance.
- [ ] Add deployment links.
- [ ] Add screenshots.
- [ ] Add demo video link.
- [ ] Add final team contribution breakdown.

## Validation

- [x] Confirm dashboard updates without refresh.
- [x] Confirm Discord bot and dashboard show the same backend state.
- [x] Confirm AI fallback keeps app runnable without OpenRouter.
- [ ] Test alert conditions.
- [ ] Test setup from a fresh clone.
- [ ] Record a clean 3-minute demo video.
- [ ] Review repository commit history and README before submission.

## Submission

- [ ] Confirm repository is public.
- [ ] Confirm latest code is pushed.
- [ ] Confirm demo video is accessible.
- [ ] Submit GitHub link, demo video link, and team details through the official portal before the deadline.
