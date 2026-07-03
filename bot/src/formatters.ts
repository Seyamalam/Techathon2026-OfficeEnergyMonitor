import type { EnergyAlert, EnergyState, RoomSummary } from "./types"

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

function formatDeviceCounts(room: RoomSummary) {
  if (room.activeDevices === 0) {
    return `${room.name}: all off`
  }

  return `${room.name}: ${plural(room.fansOn, "fan")} ON, ${plural(room.lightsOn, "light")} ON`
}

export function formatStatus(state: EnergyState) {
  const roomLines = state.rooms.map(formatDeviceCounts).join(". ")
  const alertText =
    state.alerts.length > 0
      ? ` I also see ${plural(state.alerts.length, "active alert")}.`
      : " No active alerts right now."

  return `Here's the office snapshot: ${roomLines}. Total load is ${state.totalWatts}W.${alertText}`
}

export function formatRoom(room: RoomSummary) {
  const onDevices = room.devices.filter((device) => device.status === "on")

  if (onDevices.length === 0) {
    return `${room.name} is quiet: all lights and fans are off, so it is drawing 0W.`
  }

  const deviceList = onDevices
    .map((device) => `${device.name} (${device.watts}W)`)
    .join(", ")

  return `${room.name} is drawing ${room.totalWatts}W. Currently on: ${deviceList}.`
}

export function formatUsage(state: EnergyState) {
  const roomBreakdown = state.rooms
    .map((room) => `${room.name}: ${room.totalWatts}W`)
    .join(", ")

  return `Total power right now: ${state.totalWatts}W. Today's estimated usage: ${state.estimatedTodayKwh.toFixed(2)} kWh. Room breakdown: ${roomBreakdown}.`
}

export function formatAlerts(state: EnergyState) {
  if (state.alerts.length === 0) {
    return "No active alerts right now. The office looks normal from here."
  }

  const alertLines = state.alerts
    .slice(0, 5)
    .map((alert) => `- ${alert.title}: ${alert.message}`)
    .join("\n")

  return `I found ${plural(state.alerts.length, "active alert")}:\n${alertLines}`
}

export function formatDevices(state: EnergyState) {
  const roomLines = state.rooms
    .map((room) => {
      const devices = room.devices
        .map((device) => `${device.name} ${device.status.toUpperCase()}`)
        .join(", ")

      return `${room.name}: ${devices}`
    })
    .join("\n")

  return `Here is the live device board:\n${roomLines}`
}

export function formatOffHours(state: EnergyState) {
  if (!state.isAfterHours) {
    return `It is office hours on the simulator clock (${state.simulatedClock}). I will flag devices after 5 PM or before 9 AM.`
  }

  const activeRooms = state.rooms.filter((room) => room.activeDevices > 0)

  if (activeRooms.length === 0) {
    return `It is after hours (${state.simulatedClock}), and every monitored device is off.`
  }

  const summary = activeRooms
    .map((room) => `${room.name}: ${room.activeDevices} devices ON`)
    .join(", ")

  return `It is after hours (${state.simulatedClock}). Someone should check this: ${summary}.`
}

export function formatHelp(prefix: string) {
  return [
    "I can check the office energy dashboard for you.",
    "",
    `\`${prefix}status\` - summary of every room`,
    `\`${prefix}room drawing\` - Drawing Room details`,
    `\`${prefix}room work1\` - Work Room 1 details`,
    `\`${prefix}room work2\` - Work Room 2 details`,
    `\`${prefix}usage\` - total watts and estimated kWh`,
    `\`${prefix}alerts\` - active energy alerts`,
    `\`${prefix}devices\` - every monitored device`,
    `\`${prefix}offhours\` - office-hours check`,
    `\`${prefix}advice\` - AI energy-saving recommendation`,
  ].join("\n")
}

export function formatAlert(alert: EnergyAlert) {
  const severity = alert.severity === "critical" ? "Critical" : "Heads up"
  return `${severity}: ${alert.title}. ${alert.message}`
}
