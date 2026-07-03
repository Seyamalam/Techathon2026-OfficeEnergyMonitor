# Architecture

## Overview

The system has one source of truth: the backend state exposed by the dashboard package. The simulated device layer updates the state, and both the dashboard and Discord bot read from the same backend contract.

```text
Office Device Simulator
  -> Next.js Backend API + InstantDB Snapshot
    -> REST API
      -> OpenRouter AI Insight
      -> Web Dashboard
      -> Discord Bot
```

The exported system diagram is stored at [docs/assets/system-architecture.svg](assets/system-architecture.svg). It is SVG, not Mermaid.

## Components

### Device Simulator

Responsible for:

- Defining the rooms and devices.
- Changing device states over time.
- Tracking timestamps.
- Producing realistic watt usage.

### Backend API

Responsible for:

- Serving current state.
- Calculating current power usage.
- Calculating room-level usage.
- Generating alerts.
- Serving a fresh state snapshot for the dashboard and bot.

Current implementation: the dashboard package exposes `GET /api/state` through a Next.js route handler. The dashboard can also use an InstantDB snapshot when configured, while the Discord bot reads the same state endpoint.

### Web Dashboard

Responsible for:

- Visualizing room layout.
- Showing live device states.
- Showing live power consumption.
- Showing active alerts.
- Showing AI recommendations from `/api/ai-insight`.
- Making the system easy to understand in a demo.

### Discord Bot

Responsible for:

- Answering office status commands.
- Reading real backend data.
- Posting proactive alert messages when configured.
- Answering `!advice` with OpenRouter-powered energy recommendations.

Current commands:

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

### AI Insight Layer

Responsible for:

- Turning live IoT state into concise operational recommendations.
- Using OpenRouter `openrouter/free` when `OPENROUTER_API_KEY` is configured.
- Falling back to deterministic rule-based advice if the AI endpoint is unavailable.

## Data Flow

1. The simulator updates one or more device states.
2. Backend recalculates usage and alerts.
3. Dashboard polls or reads the shared snapshot and animates the new state.
4. Discord bot reads the same backend state when a command is used.
5. If a new alert is detected, the bot may post it to a Discord channel.

## API Contract

```text
GET /api/state
```

Returns rooms, devices, usage, alerts, and timestamp.

```text
GET /api/ai-insight
```

Returns AI-generated or fallback energy advice derived from the current state.

## Reliability Notes

- The dashboard should show a disconnected state if the API cannot be reached.
- The Discord bot should handle backend errors with a friendly retry message.
- The simulator should avoid impossible values, such as a device drawing watts while off.
