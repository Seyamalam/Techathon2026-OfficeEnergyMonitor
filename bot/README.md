# Discord Bot

Discord bot for the office energy monitor. It reads live data from the same dashboard backend endpoint used by the web UI.

## Commands

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

## Setup

```bash
cp .env.example .env
bun install
bun run start
```

Required environment variables:

```text
DISCORD_TOKEN=your_bot_token
BACKEND_URL=http://127.0.0.1:3000
```

Optional:

```text
DISCORD_CHANNEL_ID=channel_for_proactive_alerts
BOT_PREFIX=!
ALERT_POLL_SECONDS=20
OPENROUTER_API_KEY=optional_openrouter_key
OPENROUTER_MODEL=openrouter/free
```

The bot needs the Discord Message Content intent enabled in the Discord Developer Portal because this prototype uses prefix commands.

`!advice` uses OpenRouter when configured and falls back to rule-based advice when the API key is missing or the free endpoint is unavailable.

## Local Test Without Discord

Run the dashboard first:

```bash
cd ../dashboard
bun run dev
```

Then run:

```bash
cd ../bot
bun run test:local
```

This calls the live backend and prints the replies for `!status`, `!room`, `!usage`, and `!help`.
