# Architecture

The system has one source of truth: the backend state exposed by the dashboard package. The simulated device layer creates live device state, and both the dashboard and Discord bot read that same backend contract.

## Whole System

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
    State["EnergyState JSON<br/>15 devices, rooms, watts, alerts"]
  end

  subgraph Backend["Single Backend / Source Of Truth"]
    API["Next.js GET /api/state<br/>fresh no-store response"]
    AlertRules["Alert rules<br/>after-hours, high load, all-on runtime"]
    Instant["InstantDB snapshot<br/>optional realtime cache"]
    Insight["POST /api/ai-insight<br/>OpenRouter summary"]
  end

  subgraph Dashboard["Web Dashboard"]
    Floor["SVG floor plan<br/>glowing lights + spinning fans"]
    Charts["Metrics, tables, charts, alerts"]
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

## Component Responsibilities

### Device Simulator

- Defines 3 rooms and 15 devices.
- Uses deterministic random state toggles about every 1.5 seconds so changes are easy to observe in the demo.
- Keeps real Asia/Dhaka time for the 9 to 5 office-hours rule.
- Tracks `lastChanged`, `onSince`, room totals, active device counts, and watts.

### Backend API

- Serves `GET /api/state` as the shared live state endpoint.
- Calculates total and per-room power usage.
- Builds after-hours, high-load, and all-on runtime alerts.
- Optionally syncs the current state into InstantDB.

### Web Dashboard

- Polls state about every 1.5 seconds.
- Animates fan spin and light glow directly from device state.
- Shows room wattage, device tables, alerts, analytics, AI coach output, and hardware preview.

### Discord Bot

- Reads the same backend state as the dashboard.
- Answers commands with live facts.
- Uses OpenRouter to make responses sound natural when configured.
- Falls back to deterministic formatters if the LLM is unavailable.
- May post proactive alerts to a configured Discord channel.

## API Contract

```text
GET /api/state
```

Returns rooms, devices, usage, alerts, generated timestamp, and the current Dhaka office clock.

```text
POST /api/ai-insight
```

Returns AI-generated or fallback energy advice derived from the current state.

