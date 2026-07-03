import {
  Client,
  Events,
  GatewayIntentBits,
} from "discord.js"

import { fetchEnergyState } from "./api"
import { handleBotCommand } from "./commands"
import { assertConfig, config } from "./config"
import { formatAlert } from "./formatters"

assertConfig()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const postedAlertIds = new Set<string>()

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Office energy bot logged in as ${readyClient.user.tag}`)
  startAlertPolling()
})

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) {
    return
  }

  try {
    const reply = await handleBotCommand(message.content, config.prefix)

    if (!reply) {
      return
    }

    await message.reply(reply)
  } catch (error) {
    console.error(error)
    await message.reply(
      "I couldn't reach the energy backend right now. Make sure the dashboard server is running."
    )
  }
})

async function startAlertPolling() {
  if (!config.channelId) {
    console.log("DISCORD_CHANNEL_ID is not set; proactive alert posting is off.")
    return
  }

  await pollAlerts()
  setInterval(pollAlerts, config.alertPollMs)
}

async function pollAlerts() {
  try {
    const state = await fetchEnergyState()
    const newAlerts = state.alerts.filter((alert) => !postedAlertIds.has(alert.id))

    if (newAlerts.length === 0) {
      return
    }

    const channel = await client.channels.fetch(config.channelId)

    if (!isSendableChannel(channel)) {
      console.warn("Configured alert channel is not text-capable.")
      return
    }

    for (const alert of newAlerts) {
      await channel.send(formatAlert(alert))
      postedAlertIds.add(alert.id)
    }
  } catch (error) {
    console.error("Alert polling failed:", error)
  }
}

type SendableChannel = {
  send: (content: string) => Promise<unknown>
}

function isSendableChannel(channel: unknown): channel is SendableChannel {
  if (!channel || typeof channel !== "object") {
    return false
  }

  return "send" in channel && typeof channel.send === "function"
}

await client.login(config.token)
