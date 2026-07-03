# Discord Bot

Discord bot for the office energy monitor. It reads live data from the same dashboard backend endpoint used by the web UI.

## Commands

```text
!status
!room drawing
!room work1
!room work2
!usage
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
```

The bot needs the Discord Message Content intent enabled in the Discord Developer Portal because this prototype uses prefix commands.

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
