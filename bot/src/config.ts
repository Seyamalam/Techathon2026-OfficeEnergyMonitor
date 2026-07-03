import "dotenv/config"

function optionalNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const config = {
  token: process.env.DISCORD_TOKEN ?? "",
  channelId: process.env.DISCORD_CHANNEL_ID ?? "",
  backendUrl: (process.env.BACKEND_URL ?? "http://127.0.0.1:3000").replace(
    /\/$/,
    ""
  ),
  instantAppId: process.env.INSTANT_APP_ID ?? "",
  instantAdminToken: process.env.INSTANT_APP_ADMIN_TOKEN ?? "",
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterModel: process.env.OPENROUTER_MODEL ?? "openrouter/free",
  prefix: process.env.BOT_PREFIX ?? "!",
  alertPollMs: optionalNumber(process.env.ALERT_POLL_SECONDS, 20) * 1000,
}

export function assertConfig() {
  const missing: string[] = []

  if (!config.token) {
    missing.push("DISCORD_TOKEN")
  }

  if (missing.length) {
    throw new Error(`Missing required environment variable: ${missing.join(", ")}`)
  }
}
