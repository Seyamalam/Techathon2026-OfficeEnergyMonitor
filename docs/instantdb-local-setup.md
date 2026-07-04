# Local InstantDB Setup

InstantDB is optional for running the core demo. The dashboard and Discord bot work from `GET /api/state` even when Instant credentials are not configured. When Instant is configured, the backend writes snapshots, rooms, devices, readings, and alerts into InstantDB as a realtime-ready cache.

## One Command

```bash
./scripts/start-local-stack.sh
```

The script follows the official InstantDB self-hosting flow:

1. Clone `https://github.com/instantdb/instant.git` into `.docker/instant`.
2. Enter `instant/self-hosting`.
3. Copy `.env.example` to `.env` if needed.
4. Start Instant with Docker Compose.
5. Move the Instant dashboard from port `3000` to `3001` so it does not collide with this Next.js dashboard.
6. Start the Huntrix dashboard on port `3000`.

Local ports:

- Huntrix dashboard: `http://localhost:3000`
- Huntrix state API: `http://localhost:3000/api/state`
- Instant backend: `http://localhost:8888`
- Instant dashboard: `http://localhost:3001`

## Connecting Huntrix To Self-Hosted InstantDB

After creating/configuring an Instant app in the local Instant dashboard, provide these variables to the Huntrix dashboard:

```text
NEXT_PUBLIC_INSTANT_APP_ID=your_local_instant_app_id
NEXT_PUBLIC_INSTANT_API_URI=http://localhost:8888
NEXT_PUBLIC_INSTANT_WEBSOCKET_URI=ws://localhost:8888/runtime/session
INSTANT_APP_ADMIN_TOKEN=your_local_admin_token
INSTANT_API_URI=http://localhost:8888
```

For Docker:

```bash
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id \
NEXT_PUBLIC_INSTANT_API_URI=http://host.docker.internal:8888 \
NEXT_PUBLIC_INSTANT_WEBSOCKET_URI=ws://localhost:8888/runtime/session \
INSTANT_APP_ADMIN_TOKEN=your_admin_token \
INSTANT_API_URI=http://host.docker.internal:8888 \
docker compose up --build dashboard
```

The websocket URI is public browser-facing config, so `localhost:8888` is correct for a browser running on the review machine. The admin API URI is server-side inside the Docker container, so it uses `host.docker.internal`.

## Official Reference

InstantDB self-hosting docs: <https://www.instantdb.com/docs/self-hosting>
