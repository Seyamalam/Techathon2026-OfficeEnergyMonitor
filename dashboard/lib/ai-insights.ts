import type { EnergyState } from "@/lib/energy-simulator"

export type AiInsight = {
  summary: string
  actions: string[]
  riskLevel: "normal" | "watch" | "critical"
  source: "openrouter" | "fallback"
}

const openRouterApiKey = process.env.OPENROUTER_API_KEY
const openRouterModel = process.env.OPENROUTER_MODEL ?? "openrouter/free"

function buildFallbackInsight(state: EnergyState): AiInsight {
  const activeRooms = state.rooms.filter((room) => room.activeDevices > 0)
  const highestRoom = [...state.rooms].sort(
    (a, b) => b.totalWatts - a.totalWatts
  )[0]
  const riskLevel =
    state.alerts.some((alert) => alert.severity === "critical") ||
    state.totalWatts >= 300
      ? "critical"
      : state.alerts.length > 0 || state.totalWatts >= 180
        ? "watch"
        : "normal"

  return {
    summary:
      activeRooms.length === 0
        ? "The office is currently quiet. No fans or lights are drawing power."
        : `${activeRooms.length} room${activeRooms.length === 1 ? "" : "s"} still have active devices, with ${highestRoom?.name ?? "the office"} drawing the most at ${highestRoom?.totalWatts ?? 0}W.`,
    actions: [
      state.isAfterHours
        ? "Ask the last person leaving to switch off any active rooms."
        : "Compare active rooms with actual occupancy before taking action.",
      highestRoom
        ? `Check ${highestRoom.name} first because it is drawing ${highestRoom.totalWatts}W.`
        : "No room requires immediate action.",
      state.alerts.length
        ? "Review the alert panel and acknowledge after the room is physically checked."
        : "Keep monitoring; no alert condition is active right now.",
    ],
    riskLevel,
    source: "fallback",
  }
}

function buildPrompt(state: EnergyState) {
  const roomLines = state.rooms
    .map(
      (room) =>
        `${room.name}: ${room.activeDevices}/${room.devices.length} active, ${room.fansOn} fans on, ${room.lightsOn} lights on, ${room.totalWatts}W`
    )
    .join("\n")
  const alertLines = state.alerts.length
    ? state.alerts
        .map((alert) => `${alert.severity}: ${alert.title} - ${alert.message}`)
        .join("\n")
    : "No active alerts."

  return [
    "You are an energy operations assistant for a small office.",
    "Use the live IoT state below to give concise, practical advice.",
    "Return valid JSON only with this shape:",
    '{"summary":"one sentence","actions":["action 1","action 2","action 3"],"riskLevel":"normal|watch|critical"}',
    "",
    `Office clock: ${state.simulatedClock}`,
    `After hours: ${state.isAfterHours}`,
    `Total load: ${state.totalWatts}W`,
    `Estimated usage today: ${state.estimatedTodayKwh} kWh`,
    "",
    "Rooms:",
    roomLines,
    "",
    "Alerts:",
    alertLines,
  ].join("\n")
}

function cleanJson(text: string) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)

  return fenced?.[1]?.trim() ?? trimmed
}

function normalizeInsight(value: unknown, fallback: AiInsight): AiInsight {
  if (!value || typeof value !== "object") {
    return fallback
  }

  const record = value as Record<string, unknown>
  const riskLevel =
    record.riskLevel === "normal" ||
    record.riskLevel === "watch" ||
    record.riskLevel === "critical"
      ? record.riskLevel
      : fallback.riskLevel
  const actions = Array.isArray(record.actions)
    ? record.actions
        .filter((item): item is string => typeof item === "string")
        .slice(0, 3)
    : fallback.actions

  return {
    summary:
      typeof record.summary === "string" && record.summary.trim()
        ? record.summary.trim()
        : fallback.summary,
    actions: actions.length ? actions : fallback.actions,
    riskLevel,
    source: "openrouter",
  }
}

export async function getAiInsight(state: EnergyState): Promise<AiInsight> {
  const fallback = buildFallbackInsight(state)

  if (!openRouterApiKey) {
    return fallback
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Seyamalam/Techathon2026-Huntrix",
        "X-Title": "Techathon Office Energy Monitor",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: "system",
            content:
              "You produce short operational energy advice. Return JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(state),
          },
        ],
        temperature: 0.3,
        max_tokens: 260,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      return fallback
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = payload.choices?.[0]?.message?.content

    if (!content) {
      return fallback
    }

    return normalizeInsight(JSON.parse(cleanJson(content)), fallback)
  } catch {
    return fallback
  }
}
