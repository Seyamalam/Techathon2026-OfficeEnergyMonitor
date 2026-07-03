import { config } from "./config"
import type { EnergyState } from "./types"

function fallbackAdvice(state: EnergyState) {
  const activeRooms = state.rooms.filter((room) => room.activeDevices > 0)
  const highestRoom = [...state.rooms].sort(
    (a, b) => b.totalWatts - a.totalWatts
  )[0]

  if (activeRooms.length === 0) {
    return "AI advice: the office is quiet right now. No lights or fans are drawing power, so there is nothing urgent to fix."
  }

  const firstStep = highestRoom
    ? `Check ${highestRoom.name} first because it is drawing ${highestRoom.totalWatts}W.`
    : "Check the room with the most active devices first."
  const scheduleNote = state.isAfterHours
    ? "Because it is after hours, this is likely wasted energy unless someone is still working."
    : "Because it is office hours, confirm the room is actually occupied before switching anything off."

  return `AI advice: ${activeRooms.length} room${activeRooms.length === 1 ? "" : "s"} still have active devices. ${firstStep} ${scheduleNote}`
}

function buildPrompt(state: EnergyState) {
  const rooms = state.rooms
    .map(
      (room) =>
        `${room.name}: ${room.activeDevices}/${room.devices.length} active, ${room.fansOn} fans, ${room.lightsOn} lights, ${room.totalWatts}W`
    )
    .join("\n")
  const alerts = state.alerts.length
    ? state.alerts
        .map((alert) => `${alert.severity}: ${alert.title} - ${alert.message}`)
        .join("\n")
    : "No active alerts."

  return [
    "You are a friendly Discord energy assistant for a small office.",
    "Give one concise paragraph with practical advice. Do not mention JSON.",
    "",
    `Clock: ${state.simulatedClock}`,
    `After hours: ${state.isAfterHours}`,
    `Total load: ${state.totalWatts}W`,
    `Estimated kWh today: ${state.estimatedTodayKwh}`,
    "Rooms:",
    rooms,
    "Alerts:",
    alerts,
  ].join("\n")
}

export async function formatAiAdvice(state: EnergyState) {
  if (!config.openRouterApiKey) {
    return fallbackAdvice(state)
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Seyamalam/Techathon2026-Huntrix",
        "X-Title": "Techathon Office Energy Monitor Discord Bot",
      },
      body: JSON.stringify({
        model: config.openRouterModel,
        messages: [
          {
            role: "system",
            content:
              "You produce concise, friendly energy-saving advice from live IoT state.",
          },
          {
            role: "user",
            content: buildPrompt(state),
          },
        ],
        temperature: 0.4,
        max_tokens: 180,
      }),
    })

    if (!response.ok) {
      return fallbackAdvice(state)
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = payload.choices?.[0]?.message?.content?.trim()

    return content || fallbackAdvice(state)
  } catch {
    return fallbackAdvice(state)
  }
}
