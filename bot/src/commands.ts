import { fetchEnergyState, findRoom } from "./api"
import {
  formatHelp,
  formatRoom,
  formatStatus,
  formatUsage,
} from "./formatters"

const knownCommands = new Set(["status", "room", "usage", "help", "commands"])

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
    return formatStatus(state)
  }

  if (command === "usage") {
    return formatUsage(state)
  }

  const roomQuery = args.join(" ")

  if (!roomQuery) {
    return `Tell me which room to check: \`${prefix}room drawing\`, \`${prefix}room work1\`, or \`${prefix}room work2\`.`
  }

  const room = findRoom(state, roomQuery)

  if (!room) {
    return "I couldn't match that room. Try drawing, work1, or work2."
  }

  return formatRoom(room)
}
