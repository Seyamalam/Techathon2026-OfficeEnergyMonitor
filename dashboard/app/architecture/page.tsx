import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { PageHeading } from "@/components/page-heading"

const wholeSystemDiagram = String.raw`
flowchart LR
  classDef device fill:#eef6ff,stroke:#2563eb,color:#0f172a
  classDef backend fill:#f5f3ff,stroke:#7c3aed,color:#0f172a
  classDef ui fill:#ecfdf5,stroke:#059669,color:#0f172a
  classDef alert fill:#fff7ed,stroke:#ea580c,color:#0f172a

  subgraph office["Office Setup"]
    DR["Drawing Room<br/>2 fans + 3 lights"]:::device
    W1["Work Room 1<br/>2 fans + 3 lights"]:::device
    W2["Work Room 2<br/>2 fans + 3 lights"]:::device
  end

  subgraph simulator["Simulated Device Layer"]
    defs["Device definitions<br/>id, room, type, ratedWatts"]:::device
    clock["Time-cycle simulator<br/>status + lastChanged + onSince"]:::device
    payload["EnergyState JSON<br/>15 devices, 3 room summaries, usage"]:::device
  end

  subgraph backend["Single Backend / Source Of Truth"]
    api["Next.js API<br/>GET /api/state"]:::backend
    rules["Alert rules<br/>after hours, high load, all-on runtime"]:::alert
    instant["InstantDB snapshot<br/>optional realtime cache"]:::backend
    aiRoute["AI insight API<br/>OpenRouter-backed summaries"]:::backend
  end

  subgraph web["Web Dashboard"]
    floor["Interactive floor plan<br/>glowing lights + spinning fans"]:::ui
    cards["Device cards + room tables"]:::ui
    charts["Usage charts + analytics"]:::ui
    hardware["Hardware / Wokwi preview"]:::ui
  end

  subgraph discord["Discord Interface"]
    bot["Discord bot runtime"]:::ui
    commands["Prefix commands<br/>!status !room !usage !alerts"]:::ui
    proactive["Proactive alert posts"]:::alert
    llm["LLM response humanizer"]:::backend
  end

  DR --> defs
  W1 --> defs
  W2 --> defs
  defs --> clock --> payload --> api
  api --> rules
  api --> instant
  api --> aiRoute
  instant --> floor
  instant --> cards
  instant --> charts
  api --> hardware
  api --> bot
  bot --> commands
  bot --> proactive
  bot --> llm
  llm --> commands
  rules --> proactive
`

const iotDiagram = String.raw`
flowchart TB
  classDef safe fill:#ecfdf5,stroke:#059669,color:#0f172a
  classDef control fill:#eef6ff,stroke:#2563eb,color:#0f172a
  classDef mains fill:#fff7ed,stroke:#ea580c,color:#0f172a
  classDef data fill:#f5f3ff,stroke:#7c3aed,color:#0f172a

  subgraph room["Representative Drawing Room Circuit"]
    subgraph inputs["Safe Low-Voltage State Inputs"]
      sw1["Fan 1 state switch<br/>GPIO 32"]:::safe
      sw2["Fan 2 state switch<br/>GPIO 33"]:::safe
      sw3["Light 1 state switch<br/>GPIO 25"]:::safe
      sw4["Light 2 state switch<br/>GPIO 26"]:::safe
      sw5["Light 3 state switch<br/>GPIO 27"]:::safe
    end

    esp["ESP32 DevKit<br/>Wokwi sketch loop every 2.5s"]:::control

    subgraph relays["Relay / Contactor Side"]
      r1["CH1 relay<br/>GPIO 16"]:::control
      r2["CH2 relay<br/>GPIO 17"]:::control
      r3["CH3 relay<br/>GPIO 18"]:::control
      r4["CH4 relay<br/>GPIO 19"]:::control
      r5["CH5 relay<br/>GPIO 21"]:::control
    end

    subgraph loads["Room Loads"]
      fan1["Fan 1<br/>60W"]:::mains
      fan2["Fan 2<br/>60W"]:::mains
      light1["Light 1<br/>15W"]:::mains
      light2["Light 2<br/>15W"]:::mains
      light3["Light 3<br/>15W"]:::mains
    end

    current["Optional ACS712<br/>aggregate current sensing"]:::safe
    serial["Serial JSON payload<br/>id, status, watts, ratedWatts"]:::data
  end

  sw1 --> esp
  sw2 --> esp
  sw3 --> esp
  sw4 --> esp
  sw5 --> esp
  esp --> r1 --> fan1
  esp --> r2 --> fan2
  esp --> r3 --> light1
  esp --> r4 --> light2
  esp --> r5 --> light3
  loads --> current --> esp
  esp --> serial
  serial --> api["Backend API<br/>same state contract as simulator"]:::data

  note["Real AC wiring requires certified relay modules, fuses, isolation, and electrical review. Wokwi uses slide switches and LEDs as safe stand-ins."]:::mains
  note -. safety note .- relays
`

const webDiagram = String.raw`
flowchart LR
  classDef server fill:#f5f3ff,stroke:#7c3aed,color:#0f172a
  classDef client fill:#ecfdf5,stroke:#059669,color:#0f172a
  classDef data fill:#eef6ff,stroke:#2563eb,color:#0f172a
  classDef alert fill:#fff7ed,stroke:#ea580c,color:#0f172a

  browser["Browser<br/>Next.js App Router UI"]:::client

  subgraph dashboard["Dashboard Pages"]
    home["/ dashboard<br/>floor plan + live metrics"]:::client
    devices["/devices<br/>room device table"]:::client
    alerts["/alerts<br/>anomaly rules"]:::alert
    analytics["/analytics<br/>Recharts usage views"]:::client
    architecture["/architecture<br/>Mermaid diagrams"]:::client
    hardware["/hardware<br/>Wokwi elements preview"]:::client
    botPage["/bot<br/>Discord command guide"]:::client
  end

  subgraph api["Next.js Backend Routes"]
    stateApi["GET /api/state<br/>returns EnergyState"]:::server
    aiApi["POST /api/ai-insight<br/>OpenRouter summary"]:::server
  end

  subgraph state["State Construction"]
    simulator["energy-simulator.ts<br/>device cycles + wattage"]:::data
    alertsEngine["alert builder<br/>after-hours + high-load + all-on"]:::alert
    instantAdmin["instant-admin.ts<br/>writes current snapshot"]:::server
  end

  subgraph db["Realtime Store"]
    instant["InstantDB<br/>snapshots, rooms, devices, alerts"]:::data
  end

  browser --> home
  browser --> devices
  browser --> alerts
  browser --> analytics
  browser --> architecture
  browser --> hardware
  browser --> botPage

  home --> instant
  devices --> instant
  alerts --> instant
  analytics --> instant
  instant -. fallback if unavailable .-> stateApi

  stateApi --> simulator --> alertsEngine --> instantAdmin --> instant
  aiApi --> stateApi
  aiApi --> openrouter["OpenRouter<br/>friendly recommendations"]:::server
`

const botDiagram = String.raw`
sequenceDiagram
  autonumber
  participant Boss as Discord User / Boss
  participant Discord as Discord Gateway
  participant Bot as Huntrix Bot
  participant API as Shared Backend API
  participant LLM as OpenRouter LLM
  participant Channel as Alert Channel

  Boss->>Discord: !status / !room / !usage / !alerts / !devices
  Discord->>Bot: MESSAGE_CREATE with content
  Bot->>Bot: parse prefix command
  Bot->>API: GET /api/state
  API-->>Bot: EnergyState with rooms, devices, alerts
  Bot->>Bot: build deterministic factual fallback
  alt OpenRouter key configured
    Bot->>LLM: grounded prompt + deterministic answer
    LLM-->>Bot: concise Discord markdown
    Bot->>Bot: sanitize markdown, remove draft leakage, fallback if invalid
  else LLM unavailable
    Bot->>Bot: use deterministic formatter
  end
  Bot-->>Discord: reply with grounded markdown response
  Discord-->>Boss: command answer

  loop every ALERT_POLL_SECONDS
    Bot->>API: GET /api/state
    API-->>Bot: current alerts
    alt new alert id
      Bot->>LLM: humanize proactive alert
      LLM-->>Bot: short alert text
      Bot-->>Channel: after-hours / high-load alert
    end
  end
`

const deploymentDiagram = String.raw`
flowchart LR
  classDef repo fill:#eef6ff,stroke:#2563eb,color:#0f172a
  classDef vercel fill:#f5f3ff,stroke:#7c3aed,color:#0f172a
  classDef runtime fill:#ecfdf5,stroke:#059669,color:#0f172a

  repo["GitHub Repo<br/>Techathon2026-Huntrix"]:::repo
  root["Vercel Project Root<br/>dashboard/"]:::vercel
  install["Install Command<br/>bun install"]:::vercel
  build["Build Command<br/>bun run build"]:::vercel
  next["Next.js Output<br/>.next"]:::vercel
  app["Public Dashboard<br/>Vercel deployment"]:::runtime
  bot["Discord Bot<br/>local/server process"]:::runtime
  env["Environment Variables<br/>OpenRouter, InstantDB, backend URL"]:::runtime

  repo --> root --> install --> build --> next --> app
  env --> app
  env --> bot
  app --> api["/api/state + /api/ai-insight"]:::runtime
  bot --> api
`

export default function ArchitecturePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 p-4 sm:p-6">
      <PageHeading
        title="Architecture"
        description="Mermaid-rendered diagrams for the shared backend, simulated IoT layer, dashboard, Discord bot, AI response path, and deployment setup."
      >
        <Badge>Mermaid</Badge>
        <Badge variant="outline">single source of truth</Badge>
        <Badge variant="secondary">dashboard + bot</Badge>
      </PageHeading>

      <DiagramCard
        title="Whole System Diagram"
        description="Complete flow from office device state to backend, dashboard, Discord bot, alerts, and AI summaries."
        chart={wholeSystemDiagram}
      />
      <DiagramCard
        title="IoT Hardware Diagram"
        description="Representative Wokwi/ESP32 circuit, safe inputs, relay channels, load devices, and telemetry payload."
        chart={iotDiagram}
      />
      <DiagramCard
        title="Web Dashboard Diagram"
        description="Next.js routes, API routes, simulator, alert builder, InstantDB sync, and visual dashboard pages."
        chart={webDiagram}
      />
      <DiagramCard
        title="Discord Bot And AI Diagram"
        description="Command lifecycle, shared state fetch, deterministic fallback, LLM humanization, and proactive alerts."
        chart={botDiagram}
      />
      <DiagramCard
        title="Deployment Diagram"
        description="Vercel root directory, build commands, dashboard deployment, bot runtime, and environment variables."
        chart={deploymentDiagram}
      />
    </main>
  )
}

function DiagramCard({
  title,
  description,
  chart,
}: {
  title: string
  description: string
  chart: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <MermaidDiagram chart={chart} />
      </CardContent>
    </Card>
  )
}
