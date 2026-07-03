import { fetchEnergyState } from "./api"
import { config } from "./config"
import { handleBotCommand } from "./commands"

const commands = [
  `${config.prefix}status`,
  `${config.prefix}room drawing`,
  `${config.prefix}room work1`,
  `${config.prefix}room work2`,
  `${config.prefix}usage`,
  `${config.prefix}alerts`,
  `${config.prefix}devices`,
  `${config.prefix}offhours`,
  `${config.prefix}advice`,
  `${config.prefix}help`,
]

console.log(`Testing bot against ${config.backendUrl}/api/state`)

const state = await fetchEnergyState()
console.log(
  `Backend OK: ${state.deviceCount} devices, ${state.activeDevices} active, ${state.totalWatts}W\n`
)

for (const command of commands) {
  const reply = await handleBotCommand(command, config.prefix)
  console.log(`> ${command}`)
  console.log(`${reply}\n`)
}
