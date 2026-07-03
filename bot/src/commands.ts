import { fetchEnergyState, findRoom } from "./api"
import { formatAiAdvice, formatAiCommandResponse } from "./ai"
import {
  formatAlerts,
  formatDevices,
  formatHelp,
  formatOffHours,
  formatRoom,
  formatStatus,
  formatUsage,
} from "./formatters"

const knownCommands = new Set([
  "status",
  "room",
  "usage",
  "alerts",
  "devices",
  "offhours",
  "advice",
  "help",
  "commands",
])

export async function handleBotCommand(content: string, prefix: string) {
  if (!content.startsWith(prefix)) {
    return null
  }

  const [commandName = "", ...args] = content
    .slice(prefix.length)
    .trim()
    .split(/\s+/)
  const command = commandName.toLowerCase()

  if (!knownCommands.has(command)) {
    return `I don't know that command yet. Try \`${prefix}help\`.`
  }

  if (command === "help" || command === "commands") {
    return formatHelp(prefix)
  }

  const state = await fetchEnergyState()

  if (command === "status") {
    const fallback = formatStatus(state)

    return formatAiCommandResponse({ command, fallback, state })
  }

  if (command === "usage") {
    const fallback = formatUsage(state)

    return formatAiCommandResponse({ command, fallback, state })
  }

  if (command === "alerts") {
    const fallback = formatAlerts(state)

    return formatAiCommandResponse({ command, fallback, state })
  }

  if (command === "devices") {
    const fallback = formatDevices(state)

    return formatAiCommandResponse({ command, fallback, state })
  }

  if (command === "offhours") {
    const fallback = formatOffHours(state)

    return formatAiCommandResponse({ command, fallback, state })
  }

  if (command === "advice") {
    return formatAiAdvice(state)
  }

  const roomQuery = args.join(" ")

  if (!roomQuery) {
    const fallback = `Tell me which room to check: \`${prefix}room drawing\`, \`${prefix}room work1\`, or \`${prefix}room work2\`.`

    return formatAiCommandResponse({ command, fallback, state })
  }

  const room = findRoom(state, roomQuery)

  if (!room) {
    const fallback = "I couldn't match that room. Try drawing, work1, or work2."

    return formatAiCommandResponse({
      command,
      fallback,
      state,
      roomQuery,
    })
  }

  const fallback = formatRoom(room)

  return formatAiCommandResponse({
    command,
    fallback,
    state,
    room,
    roomQuery,
  })
}
