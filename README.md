# Techathon 2026 - Office Energy Monitor

A real-time office energy monitoring system for the Techathon Nationals Hackathon preliminary round.

Team: **Huntrix**

Repository name target: `Techathon2026-Huntrix`

The project goal is to monitor office lights and fans through one shared backend, a live animated web dashboard, and a Discord bot. The system uses simulated IoT device data because no physical hardware is required for the preliminary round.

## Problem Understanding

The office runs daily coordination through Discord, but lights and fans are often left running after people leave. The required solution should let users:

- See every room's lights and fans on a live dashboard.
- Track current power usage across the office and per room.
- Receive alerts for suspicious or wasteful usage.
- Ask a Discord bot for status and usage without opening the dashboard.

The problem statement has one device-count conflict:

- It defines 3 rooms.
- Each room has 2 fans and 3 lights.
- That means 15 total devices.
- Later text mentions 18 devices.

This project follows the fixed room/device definition: 15 devices total.

## Required Features

- Shared backend as the single source of truth.
- Simulated dynamic device data.
- Real-time dashboard updates without page refresh.
- Live device status grouped by room.
- Live total and per-room power usage.
- Active alerts panel.
- Discord bot commands:
  - `!status`
  - `!room <name>`
  - `!usage`
  - `!alerts`
  - `!devices`
  - `!offhours`
  - `!advice`
- System architecture diagram.
- Representative hardware/electrical schematic for one room.
- Clear setup and run instructions.
- Short demo video.

## Target Architecture

Both the dashboard and Discord bot read from the same backend state. The bot does not generate independent random data.

```mermaid
flowchart LR
  subgraph Office["Office Setup"]
    DR["Drawing Room<br/>2 fans + 3 lights"]
    W1["Work Room 1<br/>2 fans + 3 lights"]
    W2["Work Room 2<br/>2 fans + 3 lights"]
  end

  subgraph Simulator["Simulated IoT Layer"]
    Defs["Device definitions<br/>id, room, type, rated watts"]
    Tick["Deterministic random toggle tick<br/>changes about every 1.5s"]
    Clock["Real Asia/Dhaka clock<br/>9 to 5 office-hours rule"]
    State["EnergyState JSON<br/>15 devices, room summaries, watts, alerts"]
  end

  subgraph Backend["Single Backend / Source Of Truth"]
    API["Next.js GET /api/state<br/>fresh no-store response"]
    AlertRules["Alert rules<br/>after-hours, high load, all-on runtime"]
    Instant["InstantDB snapshot<br/>optional realtime cache"]
    Insight["POST /api/ai-insight<br/>OpenRouter summary"]
  end

  subgraph Dashboard["Web Dashboard"]
    Floor["SVG floor plan<br/>glowing lights + spinning fans"]
    Cards["Metrics, room cards, device table"]
    Charts["Recharts analytics"]
    Hardware["Wokwi hardware preview"]
  end

  subgraph Discord["Discord Interface"]
    Bot["discord.js bot"]
    Commands["!status !room !usage !alerts !devices !offhours !advice"]
    Proactive["Proactive alert posts"]
    LLM["OpenRouter response humanizer"]
  end

  DR --> Defs
  W1 --> Defs
  W2 --> Defs
  Defs --> Tick --> State --> API
  Clock --> AlertRules
  API --> AlertRules
  API --> Instant
  API --> Insight
  Instant --> Floor
  Instant --> Cards
  Instant --> Charts
  API --> Hardware
  API --> Bot
  Bot --> Commands
  Bot --> Proactive
  Bot --> LLM --> Commands
  AlertRules --> Proactive
```

## Runtime Data Flow

```mermaid
sequenceDiagram
  autonumber
  participant Browser as Web Dashboard
  participant API as Next.js /api/state
  participant Sim as energy-simulator.ts
  participant DB as InstantDB Snapshot
  participant Bot as Discord Bot
  participant LLM as OpenRouter

  loop every 1.5 seconds
    Browser->>API: fetch fresh state
    API->>Sim: build current state
    Sim-->>API: random device toggles + real Dhaka clock
    API-->>Browser: EnergyState JSON
    API-->>DB: optional current snapshot sync
    Browser->>Browser: update floor plan, cards, bars, alerts
  end

  Bot->>API: fetch same state for command
  API-->>Bot: EnergyState JSON
  Bot->>Bot: build factual fallback
  Bot->>LLM: send live facts for natural wording
  LLM-->>Bot: Discord markdown response
```

## Web Dashboard Architecture

```mermaid
flowchart LR
  Browser["Browser<br/>Next.js App Router UI"]

  subgraph Pages["Dashboard Pages"]
    Home["/<br/>floor plan + live metrics"]
    Devices["/devices<br/>device registry"]
    Alerts["/alerts<br/>alert center"]
    Analytics["/analytics<br/>charts"]
    Architecture["/architecture<br/>Mermaid diagrams"]
    Hardware["/hardware<br/>Wokwi preview"]
    BotPage["/bot<br/>command guide"]
  end

  subgraph API["Next.js Backend Routes"]
    StateAPI["GET /api/state<br/>fresh EnergyState"]
    AiAPI["POST /api/ai-insight<br/>OpenRouter summary"]
  end

  subgraph State["State Construction"]
    Simulator["energy-simulator.ts<br/>1.5s random toggle ticks"]
    Dhaka["Asia/Dhaka clock<br/>9 to 5 rule"]
    Rules["alert builder<br/>after-hours + high-load + all-on"]
    InstantAdmin["instant-admin.ts<br/>optional snapshot writer"]
  end

  Instant["InstantDB<br/>optional snapshots"]

  Browser --> Home
  Browser --> Devices
  Browser --> Alerts
  Browser --> Analytics
  Browser --> Architecture
  Browser --> Hardware
  Browser --> BotPage

  Home --> Poll["useEnergyState<br/>polls every 1.5s"]
  Devices --> Poll
  Alerts --> Poll
  Analytics --> Poll
  Poll --> Instant
  Instant -. fallback .-> StateAPI
  StateAPI --> Simulator --> Rules
  StateAPI --> Dhaka --> Rules
  Rules --> InstantAdmin --> Instant
  AiAPI --> StateAPI
```

## Discord Bot And AI Flow

```mermaid
sequenceDiagram
  autonumber
  participant User as Discord User
  participant Discord as Discord Gateway
  participant Bot as Huntrix Bot
  participant API as Shared Backend API
  participant LLM as OpenRouter
  participant Channel as Alert Channel

  User->>Discord: !status / !room / !usage / !alerts / !devices / !advice
  Discord->>Bot: MESSAGE_CREATE
  Bot->>API: GET /api/state
  API-->>Bot: Fresh EnergyState
  Bot->>Bot: Build factual fallback
  alt OpenRouter configured
    Bot->>LLM: Live facts only
    LLM-->>Bot: Natural Discord markdown
    Bot->>Bot: Sanitize and validate
  else LLM unavailable
    Bot->>Bot: Use deterministic formatter
  end
  Bot-->>Discord: Reply

  loop alert polling
    Bot->>API: GET /api/state
    API-->>Bot: Current alerts
    alt new alert
      Bot->>LLM: Humanize alert text
      Bot-->>Channel: Proactive alert post
    end
  end
```

## Hardware Concept Diagram

```mermaid
flowchart TB
  subgraph Room["Representative Drawing Room Circuit"]
    SW["5 safe state inputs<br/>2 fan switches + 3 light switches"]
    ESP["ESP32 DevKit<br/>reads state, writes JSON telemetry"]
    Relay["5 relay/contactor channels<br/>GPIO 16,17,18,19,21"]
    Loads["Room loads<br/>Fan 1, Fan 2, Light 1, Light 2, Light 3"]
    Sense["Optional ACS712<br/>aggregate current sensing"]
  end

  SW --> ESP
  ESP --> Relay --> Loads
  Loads --> Sense --> ESP
  ESP --> Serial["Serial JSON<br/>id, status, watts, ratedWatts"]
  Serial --> API["Backend state contract"]

  Safety["Real AC wiring needs certified relays, fuses, isolation, and qualified review.<br/>Wokwi uses switches and LEDs as safe stand-ins."]
  Safety -.-> Relay
```

## Deployment Diagram

```mermaid
flowchart LR
  Repo["GitHub repo<br/>Techathon2026-Huntrix"]
  Root["Vercel project root<br/>dashboard/"]
  Install["Install<br/>bun install"]
  Build["Build<br/>bun run build"]
  App["Public dashboard<br/>Vercel"]
  Bot["Discord bot<br/>local/server process"]
  Env["Environment variables<br/>OpenRouter, InstantDB, Discord, backend URL"]
  API["/api/state + /api/ai-insight"]
  DB["InstantDB optional snapshot"]
  LLM["OpenRouter optional LLM"]

  Repo --> Root --> Install --> Build --> App
  Env --> App
  Env --> Bot
  App --> API
  Bot --> API
  API --> DB
  API --> LLM
```

## Tech Stack

- Frontend/backend: Next.js App Router, React, TypeScript
- UI: Tailwind CSS and shadcn/ui
- Charts: Recharts through shadcn chart components
- Icons: Tabler Icons
- Animation: CSS/SVG animations
- Shared state: Next.js API route with InstantDB snapshot support
- Discord bot: discord.js
- Data source: deterministic random simulated IoT device layer with frequent visible toggles
- Hardware concept: Wokwi ESP32 relay/sensing circuit
- AI: OpenRouter `openrouter/free` for energy recommendations, with deterministic fallback

## Dashboard Experience

The dashboard includes:

- Top-view layout with Drawing Room, Work Room 1, and Work Room 2.
- Lights glow when on.
- Fans spin when running.
- Room-level power cards.
- Animated total watt meter.
- Alerts visible at a glance.
- Device list grouped by room.
- Analytics page with live trend, room comparison, and fan/light split.
- AI Energy Coach with OpenRouter-generated recommendations.
- Discord bot page with command set and live response preview.
- Architecture page with system and hardware diagrams.

Routes:

```text
/              live overview and SVG floor plan
/devices       device registry with runtime and last-changed fields
/alerts        alert rules and active alert timeline
/analytics     live charts and session peak load
/architecture  system diagram and one-room schematic
/bot           Discord command guide and live preview
```

## Backend Data Model

Each simulated device should include:

```ts
type Device = {
  id: string;
  name: string;
  type: "fan" | "light";
  room: "drawing-room" | "work-room-1" | "work-room-2";
  status: "on" | "off";
  watts: number;
  lastChanged: string;
  onSince?: string;
};
```

The simulator keeps real Asia/Dhaka time for office-hours rules, while device states use deterministic random toggles about every 1.5 seconds so dashboard changes are visible during a short demo.

## API

```text
GET /api/state
```

The dashboard polls this endpoint for demo-safe real-time updates, and the Discord bot reads the same endpoint for command responses.

```text
GET /api/ai-insight
```

Returns an AI-generated operational recommendation using OpenRouter when `OPENROUTER_API_KEY` is configured. If the API is unavailable, the endpoint returns a deterministic fallback insight so the demo remains runnable.

## Alert Rules

- Device on after office hours, assuming office hours are 9 to 5 in Asia/Dhaka time.
- All devices in one room on for more than 2 hours.
- Optional: unusually high total watt usage.

## Discord Bot Behavior

The bot should answer with concise, human-friendly messages from live backend data.

Example commands:

```text
!status
!room drawing
!room work1
!room work2
!usage
!alerts
!devices
!offhours
```

Bonus behavior: proactively post to a configured channel when a new alert appears.

## AI Integration

The project uses OpenRouter's OpenAI-compatible chat API with the free model router:

```text
OPENROUTER_MODEL=openrouter/free
```

AI is used in two places:

- Dashboard: the AI Energy Coach summarizes live office usage and recommends the next operational action.
- Discord: `!advice` asks the same live backend state for a concise energy-saving recommendation.

The prompt includes current room loads, active devices, office-hours state, kWh estimate, and active alerts. The AI never owns the source of truth; it only explains the simulated IoT state already produced by the backend. If the OpenRouter key is missing or the free endpoint is unavailable, the app uses rule-based fallback advice.

## Repository Structure

```text
.
├── bot/
│   ├── src/
│   ├── .env.example
│   └── package.json
├── dashboard/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── docs/
│   ├── assets/
│   ├── architecture.md
│   ├── hardware-schematic.md
│   ├── plan.md
│   ├── team-contributions.md
│   └── todo.md
├── wokwi/
│   ├── diagram.json
│   ├── sketch.ino
│   └── README.md
├── README.md
├── Rulebook.pdf
└── Problem Statement (Preliminary Round) v1.2.pdf
```

## Environment Variables

Planned variables:

```text
PORT=4000
CORS_ORIGIN=http://localhost:5173
DISCORD_TOKEN=
DISCORD_CHANNEL_ID=
BACKEND_URL=http://localhost:4000
```

## Local Development

Run the dashboard:

```bash
bun run install:all
bun run dev:dashboard
```

Dashboard services:

- Web dashboard: `http://127.0.0.1:3000`
- Shared state API: `http://127.0.0.1:3000/api/state`

Run the Discord bot:

```bash
cd bot
cp .env.example .env
bun install
bun run start
```

Bot environment:

```text
DISCORD_TOKEN=your_bot_token
BACKEND_URL=http://127.0.0.1:3000
DISCORD_CHANNEL_ID=optional_alert_channel_id
OPENROUTER_API_KEY=optional_openrouter_key
OPENROUTER_MODEL=openrouter/free
```

Bot commands:

```text
!status
!room drawing
!room work1
!room work2
!usage
!alerts
!devices
!offhours
!advice
!help
```

Run checks:

```bash
bun run check
```

## Diagrams And Hardware

- System diagram: [docs/assets/system-architecture.svg](docs/assets/system-architecture.svg)
- Hardware schematic: [docs/assets/one-room-hardware-schematic.svg](docs/assets/one-room-hardware-schematic.svg)
- Hardware explanation: [docs/hardware-schematic.md](docs/hardware-schematic.md)
- Wokwi representative circuit: [wokwi/diagram.json](wokwi/diagram.json)
- Wokwi sketch: [wokwi/sketch.ino](wokwi/sketch.ino)
- Live Mermaid diagrams: [`dashboard/app/architecture/page.tsx`](dashboard/app/architecture/page.tsx)

## Team Contributions

| Member | University | Primary Contribution |
| --- | --- | --- |
| Touhidul Alam Seyam | BGC Trust University Bangladesh | Dashboard, backend integration, Discord bot, AI integration |
| Abtahee Kabir | Chittagong University of Engineering & Technology | Planning, IoT architecture, representative hardware/Wokwi direction |
| Chandni Barua Jowthi | BGC Trust University Bangladesh | Documentation, setup validation, testing checklist |
| Noore Tamanna Orny | Chittagong University of Engineering & Technology | Floor plan design, room layout review, visual refinement |

See [docs/team-contributions.md](docs/team-contributions.md) for the detailed contribution breakdown.

## Important Rulebook Notes

- Repository must be public.
- Repository should be created after the problem statement release.
- Code must be original and attributed where needed.
- AI coding assistants are allowed.
- README must explain setup, architecture, technologies, API endpoints, and AI integration details if used.
- Final submission includes GitHub link, demo video link, and team details.

## Attribution

- Next.js, React, and TypeScript for the web/backend app.
- shadcn/ui, Tailwind CSS, and Base UI for interface primitives.
- Recharts for dashboard visualizations.
- Tabler Icons for iconography.
- Sonner for toast notifications.
- Discord.js for the Discord bot.
- InstantDB for shared realtime-ready state snapshots.
- OpenRouter `openrouter/free` for optional AI energy recommendations.
- Wokwi for the representative ESP32 hardware simulation concept.
- AI coding assistance was used during implementation and documentation, with code reviewed and tested before submission.

## Current Status

The dashboard and Discord bot are implemented as separate packages. The dashboard exposes the shared live state API, and the bot reads from that same endpoint. The repo also includes SVG diagrams and a representative Wokwi circuit for the hardware deliverable.
