"use client"

import { useMemo, useState, type CSSProperties } from "react"
import { toast } from "sonner"
import {
  IconBulb,
  IconClockHour4,
  IconPlugConnected,
  IconPropeller,
  IconX,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatRelativeMinutes, formatTime } from "@/lib/format"
import type { Device, RoomId, RoomSummary } from "@/lib/energy-simulator"
import { cn } from "@/lib/utils"

type DevicePoint = {
  id: string
  label: string
  x: number
  y: number
}

type RoomBlueprint = {
  id: RoomId
  label: string
  centerX: number
  labelY: number
  lights: DevicePoint[]
  fans: DevicePoint[]
}

const rooms: RoomBlueprint[] = [
  {
    id: "drawing-room",
    label: "Drawing Room",
    centerX: 145,
    labelY: 160,
    lights: [
      { id: "drawing-room-light-1", label: "Light 1", x: 90, y: 85 },
      { id: "drawing-room-light-2", label: "Light 2", x: 200, y: 85 },
      { id: "drawing-room-light-3", label: "Light 3", x: 145, y: 360 },
    ],
    fans: [
      { id: "drawing-room-fan-1", label: "Fan 1", x: 145, y: 115 },
      { id: "drawing-room-fan-2", label: "Fan 2", x: 145, y: 275 },
    ],
  },
  {
    id: "work-room-1",
    label: "Work Room 1",
    centerX: 385,
    labelY: 215,
    lights: [
      { id: "work-room-1-light-1", label: "Light 1", x: 330, y: 85 },
      { id: "work-room-1-light-2", label: "Light 2", x: 440, y: 85 },
      { id: "work-room-1-light-3", label: "Light 3", x: 385, y: 360 },
    ],
    fans: [
      { id: "work-room-1-fan-1", label: "Fan 1", x: 385, y: 115 },
      { id: "work-room-1-fan-2", label: "Fan 2", x: 385, y: 275 },
    ],
  },
  {
    id: "work-room-2",
    label: "Work Room 2",
    centerX: 640,
    labelY: 215,
    lights: [
      { id: "work-room-2-light-1", label: "Light 1", x: 585, y: 85 },
      { id: "work-room-2-light-2", label: "Light 2", x: 695, y: 85 },
      { id: "work-room-2-light-3", label: "Light 3", x: 640, y: 360 },
    ],
    fans: [
      { id: "work-room-2-fan-1", label: "Fan 1", x: 640, y: 115 },
      { id: "work-room-2-fan-2", label: "Fan 2", x: 640, y: 275 },
    ],
  },
]

type DevicePlacement = {
  device: Device
  point: DevicePoint
  room: RoomBlueprint
}

function getDevice(allRooms: RoomSummary[], id: string) {
  return allRooms
    .flatMap((room) => room.devices)
    .find((device) => device.id === id)
}

function getFanDuration(device?: Device) {
  if (!device || device.status === "off") {
    return "0.9s"
  }

  const runtimeBoost = Math.min(device.minutesInCurrentState / 180, 0.35)
  const loadBoost = Math.min(device.watts / 180, 0.3)

  return `${Number((0.95 - runtimeBoost - loadBoost).toFixed(2))}s`
}

export function OfficeLayoutSvg({ rooms: liveRooms }: { rooms: RoomSummary[] }) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [hoveredDevice, setHoveredDevice] = useState<DevicePlacement | null>(
    null
  )
  const allDevices = useMemo(
    () => liveRooms.flatMap((room) => room.devices),
    [liveRooms]
  )

  function handleDeviceOpen(device: Device) {
    setSelectedDevice(device)
    toast(`${device.name} selected`, {
      description: `${device.roomName} is ${device.status.toUpperCase()} at ${device.watts}W.`,
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <svg
          role="img"
          aria-label="Live office IoT blueprint map"
          viewBox="0 0 800 540"
          className="h-auto w-full"
        >
          <defs>
            <pattern
              id="office-grid-floor"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="20" height="20" fill="var(--office-wr1-floor)" />
              <path
                d="M20 0 L0 0 0 20"
                fill="none"
                stroke="var(--office-wr1-grid)"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="office-wood-floor"
              width="40"
              height="15"
              patternUnits="userSpaceOnUse"
            >
              <rect width="40" height="15" fill="var(--office-wr2-floor)" />
              <path
                d="M0 15 L40 15"
                fill="none"
                stroke="var(--office-wood-line)"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="office-tile-floor"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <rect width="30" height="30" fill="var(--office-corridor-floor)" />
              <path
                d="M30 0 L0 0 0 30"
                fill="none"
                stroke="var(--office-tile-line)"
                strokeWidth="0.5"
              />
            </pattern>
            <radialGradient id="office-beam-glow" cx="50%" cy="50%" r="50%">
              <stop
                offset="0%"
                stopColor="var(--office-map-light-beam)"
                stopOpacity="0.36"
              />
              <stop
                offset="60%"
                stopColor="var(--office-map-light-beam)"
                stopOpacity="0.12"
              />
              <stop
                offset="100%"
                stopColor="var(--office-map-light-beam)"
                stopOpacity="0"
              />
            </radialGradient>
          </defs>

          <rect width="800" height="540" fill="var(--office-map-bg)" />
          <Architecture />
          <Furnishings />

          {rooms.map((room) => (
            <RoomLayer
              key={room.id}
              blueprint={room}
              liveRoom={liveRooms.find((item) => item.id === room.id)}
              liveRooms={liveRooms}
              selectedDeviceId={selectedDevice?.id}
              onDeviceOpen={handleDeviceOpen}
              onDeviceHover={setHoveredDevice}
            />
          ))}
          {hoveredDevice ? <DeviceHoverCard placement={hoveredDevice} /> : null}
        </svg>
      </div>
      <DeviceDetailSheet
        device={
          selectedDevice
            ? (allDevices.find((device) => device.id === selectedDevice.id) ??
              selectedDevice)
            : null
        }
        open={Boolean(selectedDevice)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDevice(null)
          }
        }}
      />
    </>
  )
}

function Architecture() {
  return (
    <>
      <rect
        x="20"
        y="20"
        width="760"
        height="500"
        rx="3"
        fill="var(--office-map-wall)"
      />
      <rect x="30" y="30" width="230" height="370" fill="var(--office-dr-floor)" />
      <rect x="270" y="30" width="230" height="370" fill="url(#office-grid-floor)" />
      <rect x="510" y="30" width="260" height="370" fill="url(#office-wood-floor)" />
      <rect x="30" y="410" width="740" height="100" fill="url(#office-tile-floor)" />

      <rect x="215" y="400" width="40" height="10" fill="url(#office-tile-floor)" />
      <rect x="280" y="400" width="40" height="10" fill="url(#office-tile-floor)" />
      <rect x="520" y="400" width="40" height="10" fill="url(#office-tile-floor)" />
      <rect x="380" y="510" width="40" height="10" fill="var(--office-map-bg)" />

      <g
        stroke="var(--office-door-stroke)"
        strokeWidth="1.5"
        fill="var(--office-door-fill)"
      >
        <path d="M255 400 L255 360 A40 40 0 0 0 215 400" />
        <path d="M280 400 L280 360 A40 40 0 0 1 320 400" />
        <path d="M520 400 L520 360 A40 40 0 0 1 560 400" />
        <path d="M420 510 L420 470 A40 40 0 0 0 380 510" />
      </g>
      <g
        stroke="var(--office-door-stroke)"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="255" y1="400" x2="255" y2="360" />
        <line x1="280" y1="400" x2="280" y2="360" />
        <line x1="520" y1="400" x2="520" y2="360" />
        <line x1="420" y1="510" x2="420" y2="470" />
      </g>

      <g fill="var(--office-window-color)" stroke="var(--office-window-stroke)">
        <rect x="20" y="100" width="10" height="50" />
        <rect x="100" y="20" width="60" height="10" />
        <rect x="350" y="20" width="60" height="10" />
        <rect x="600" y="20" width="60" height="10" />
        <rect x="770" y="200" width="10" height="60" />
      </g>
      <g stroke="var(--office-window-highlight)" strokeWidth="1.5">
        <line x1="25" y1="100" x2="25" y2="150" />
        <line x1="100" y1="25" x2="160" y2="25" />
        <line x1="350" y1="25" x2="410" y2="25" />
        <line x1="600" y1="25" x2="660" y2="25" />
        <line x1="775" y1="200" x2="775" y2="260" />
      </g>

      <text
        x="400"
        y="535"
        fontSize="12"
        fontWeight="700"
        fill="var(--office-map-label)"
        textAnchor="middle"
      >
        ENTRY
      </text>
      <path
        d="M400 520 L395 525 L405 525 Z M399 525 L401 525 L401 530 L399 530 Z"
        fill="var(--office-map-label)"
      />
    </>
  )
}

function Furnishings() {
  return (
    <>
      <g fill="var(--office-rug)" stroke="var(--office-furniture-stroke)">
        <rect x="90" y="180" width="110" height="130" rx="5" />
      </g>
      <rect x="135" y="200" width="30" height="70" fill="var(--office-table)" rx="3" />
      <path
        d="M45 150 L75 150 L75 300 L120 300 L120 330 L45 330 Z"
        fill="var(--office-sofa)"
        stroke="var(--office-sofa-stroke)"
        strokeWidth="1.5"
      />
      <g stroke="var(--office-sofa-stroke)" strokeWidth="1.5">
        <line x1="45" y1="210" x2="75" y2="210" />
        <line x1="45" y1="270" x2="75" y2="270" />
        <line x1="75" y1="300" x2="120" y2="300" />
      </g>
      <g transform="translate(60 370) rotate(-45)">
        <rect
          x="-15"
          y="-15"
          width="30"
          height="35"
          rx="4"
          fill="var(--office-sofa)"
          stroke="var(--office-sofa-stroke)"
          strokeWidth="1.5"
        />
        <rect x="-10" y="-10" width="20" height="20" rx="2" fill="var(--office-cushion)" />
      </g>

      <DeskLeft x={330} y={140} />
      <DeskRight x={440} y={140} />
      <DeskLeft x={330} y={290} />
      <DeskRight x={440} y={290} />
      <DeskLeft x={585} y={140} />
      <DeskRight x={695} y={140} />
      <DeskLeft x={585} y={290} />
      <DeskRight x={695} y={290} />

      <Plant x={50} y={60} />
      <Plant x={240} y={340} />
      <Plant x={290} y={215} />
      <Plant x={480} y={215} />
      <Plant x={530} y={175} />
      <Plant x={750} y={380} />
      <Plant x={50} y={440} />
      <Plant x={670} y={470} />

      <g transform="translate(730 470)">
        <rect x="-10" y="-10" width="20" height="25" fill="var(--office-cooler)" rx="2" />
        <circle cx="0" cy="-15" r="9" fill="var(--office-water)" />
        <rect x="-3" y="1" width="6" height="4" fill="var(--office-map-wall)" />
      </g>
    </>
  )
}

function DeskLeft({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-20" width="60" height="40" fill="var(--office-desk)" rx="2" stroke="var(--office-desk-stroke)" />
      <rect x="10" y="-6" width="18" height="12" fill="var(--office-monitor)" rx="1" />
      <rect x="32" y="-4" width="6" height="8" fill="var(--office-monitor)" rx="1" />
      <rect x="42" y="-12" width="12" height="24" fill="var(--office-screen)" rx="1" />
      <circle cx="-15" cy="0" r="12" fill="var(--office-chair)" />
      <path d="M-25 -10 Q-30 0 -25 10" stroke="var(--office-chair-stroke)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  )
}

function DeskRight({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-60" y="-20" width="60" height="40" fill="var(--office-desk)" rx="2" stroke="var(--office-desk-stroke)" />
      <rect x="-28" y="-6" width="18" height="12" fill="var(--office-monitor)" rx="1" />
      <rect x="-38" y="-4" width="6" height="8" fill="var(--office-monitor)" rx="1" />
      <rect x="-54" y="-12" width="12" height="24" fill="var(--office-screen)" rx="1" />
      <circle cx="15" cy="0" r="12" fill="var(--office-chair)" />
      <path d="M25 -10 Q30 0 25 10" stroke="var(--office-chair-stroke)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M0 -15 L4 -5 L15 -4 L6 2 L10 12 L0 6 L-10 12 L-6 2 L-15 -4 L-4 -5 Z"
        fill="var(--office-plant-dark)"
        stroke="var(--office-plant-stroke)"
        transform="rotate(15) scale(1.1)"
      />
      <path
        d="M0 -15 L4 -5 L15 -4 L6 2 L10 12 L0 6 L-10 12 L-6 2 L-15 -4 L-4 -5 Z"
        fill="var(--office-plant-light)"
        stroke="var(--office-plant-stroke)"
        transform="rotate(45) scale(0.9)"
      />
      <circle cx="0" cy="0" r="4" fill="var(--office-plant-stroke)" />
    </g>
  )
}

function RoomLayer({
  blueprint,
  liveRoom,
  liveRooms,
  selectedDeviceId,
  onDeviceOpen,
  onDeviceHover,
}: {
  blueprint: RoomBlueprint
  liveRoom?: RoomSummary
  liveRooms: RoomSummary[]
  selectedDeviceId?: string
  onDeviceOpen: (device: Device) => void
  onDeviceHover: (placement: DevicePlacement | null) => void
}) {
  return (
    <g>
      <text
        x={blueprint.centerX}
        y={blueprint.labelY}
        fill="var(--office-map-label)"
        fontSize="14"
        fontWeight="700"
        textAnchor="middle"
      >
        {blueprint.label.toUpperCase()}
      </text>
      <text
        x={blueprint.centerX}
        y={blueprint.labelY + 20}
        fill="var(--office-map-muted)"
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
      >
        {liveRoom?.activeDevices ?? 0} active / {liveRoom?.totalWatts ?? 0}W
      </text>

      {blueprint.lights.map((light) => (
        <LightNode
          key={light.id}
          point={light}
          device={getDevice(liveRooms, light.id)}
          room={blueprint}
          selected={selectedDeviceId === light.id}
          onOpen={onDeviceOpen}
          onHover={onDeviceHover}
        />
      ))}
      {blueprint.fans.map((fan) => (
        <FanNode
          key={fan.id}
          point={fan}
          device={getDevice(liveRooms, fan.id)}
          room={blueprint}
          selected={selectedDeviceId === fan.id}
          onOpen={onDeviceOpen}
          onHover={onDeviceHover}
        />
      ))}
    </g>
  )
}

function LightNode({
  point,
  device,
  room,
  selected,
  onOpen,
  onHover,
}: {
  point: DevicePoint
  device?: Device
  room: RoomBlueprint
  selected: boolean
  onOpen: (device: Device) => void
  onHover: (placement: DevicePlacement | null) => void
}) {
  const active = device?.status === "on"
  const canInteract = Boolean(device)

  return (
    <g
      tabIndex={canInteract ? 0 : undefined}
      role={canInteract ? "button" : undefined}
      className={cn(
        "office-device-group",
        canInteract && "cursor-pointer outline-none",
        active && "active-light",
        selected && "selected-device"
      )}
      aria-label={`${point.label}: ${device?.status ?? "unknown"}`}
      onClick={() => {
        if (device) {
          onOpen(device)
        }
      }}
      onKeyDown={(event) => {
        if (device && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onOpen(device)
        }
      }}
      onMouseEnter={() => {
        if (device) {
          onHover({ device, point, room })
        }
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={() => {
        if (device) {
          onHover({ device, point, room })
        }
      }}
      onBlur={() => onHover(null)}
    >
      <circle
        cx={point.x}
        cy={point.y}
        r="24"
        fill="transparent"
        className="office-device-hit-area"
      />
      <circle
        cx={point.x}
        cy={point.y}
        r="55"
        fill="url(#office-beam-glow)"
        className="office-light-glow-cone"
      />
      <circle
        cx={point.x}
        cy={point.y}
        r="12"
        className="office-hardware-bulb"
      />
      <circle
        cx={point.x}
        cy={point.y}
        r="6"
        className="office-light-highlight"
      />
      <title>
        {point.label}: {device?.status ?? "unknown"}
      </title>
    </g>
  )
}

function FanNode({
  point,
  device,
  room,
  selected,
  onOpen,
  onHover,
}: {
  point: DevicePoint
  device?: Device
  room: RoomBlueprint
  selected: boolean
  onOpen: (device: Device) => void
  onHover: (placement: DevicePlacement | null) => void
}) {
  const active = device?.status === "on"
  const style = {
    animationDuration: getFanDuration(device),
  } satisfies CSSProperties
  const canInteract = Boolean(device)

  return (
    <g
      tabIndex={canInteract ? 0 : undefined}
      role={canInteract ? "button" : undefined}
      className={cn(
        "office-device-group",
        canInteract && "cursor-pointer outline-none",
        active && "active-fan",
        selected && "selected-device"
      )}
      transform={`translate(${point.x}, ${point.y})`}
      aria-label={`${point.label}: ${device?.status ?? "unknown"}`}
      onClick={() => {
        if (device) {
          onOpen(device)
        }
      }}
      onKeyDown={(event) => {
        if (device && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          onOpen(device)
        }
      }}
      onMouseEnter={() => {
        if (device) {
          onHover({ device, point, room })
        }
      }}
      onMouseLeave={() => onHover(null)}
      onFocus={() => {
        if (device) {
          onHover({ device, point, room })
        }
      }}
      onBlur={() => onHover(null)}
    >
      <circle r="31" fill="transparent" className="office-device-hit-area" />
      <g
        className="office-fan-blade-group"
        style={style}
      >
        <path d="M-2 -5 C-8 -22 -12 -30 0 -30 C12 -30 8 -22 2 -5 Z" />
        <path
          d="M-2 -5 C-8 -22 -12 -30 0 -30 C12 -30 8 -22 2 -5 Z"
          transform="rotate(120)"
        />
        <path
          d="M-2 -5 C-8 -22 -12 -30 0 -30 C12 -30 8 -22 2 -5 Z"
          transform="rotate(240)"
        />
      </g>
      <circle
        cx="0"
        cy="0"
        r="6"
        fill="var(--office-fan-center)"
        stroke="var(--office-fan-center-stroke)"
      />
      <title>
        {point.label}: {device?.status ?? "unknown"}
        {active ? `, ${getFanDuration(device)} rotation` : ""}
      </title>
    </g>
  )
}

function DeviceHoverCard({ placement }: { placement: DevicePlacement }) {
  const { device, point, room } = placement
  const width = 168
  const height = 92
  const x = Math.min(Math.max(point.x + 18, 10), 800 - width - 10)
  const y = Math.min(Math.max(point.y - 38, 10), 540 - height - 10)

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      className="pointer-events-none"
    >
      <div className="flex h-full flex-col gap-2 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm font-semibold">{device.name}</div>
          <Badge variant={device.status === "on" ? "default" : "secondary"}>
            {device.status.toUpperCase()}
          </Badge>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {room.label} · {device.type}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Load</span>
          <span className="font-mono font-medium">{device.watts}W</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Runtime</span>
          <span className="font-mono font-medium">
            {device.status === "on"
              ? formatRelativeMinutes(device.minutesInCurrentState)
              : "off"}
          </span>
        </div>
      </div>
    </foreignObject>
  )
}

function DeviceDetailSheet({
  device,
  open,
  onOpenChange,
}: {
  device: Device | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!device) {
    return null
  }

  const activePercent = Math.round((device.watts / device.ratedWatts) * 100)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {device.type === "fan" ? (
              <IconPropeller data-icon="inline-start" />
            ) : (
              <IconBulb data-icon="inline-start" />
            )}
            {device.roomName} · {device.name}
          </SheetTitle>
          <SheetDescription>
            Live device state from the shared office backend.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant={device.status === "on" ? "default" : "secondary"}>
              {device.status.toUpperCase()}
            </Badge>
            <Badge variant="outline">{device.type}</Badge>
            <Badge variant="outline">{device.id}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailMetric
              icon={<IconPlugConnected />}
              label="Current draw"
              value={`${device.watts}W`}
            />
            <DetailMetric
              icon={<IconClockHour4 />}
              label="Current state"
              value={
                device.status === "on"
                  ? formatRelativeMinutes(device.minutesInCurrentState)
                  : "off"
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">Rated load usage</span>
              <span className="text-muted-foreground tabular-nums">
                {activePercent}%
              </span>
            </div>
            <Progress value={activePercent} />
          </div>

          <Separator />

          <div className="grid gap-3 text-sm">
            <DetailRow label="Rated watts" value={`${device.ratedWatts}W`} />
            <DetailRow
              label="Last changed"
              value={formatTime(device.lastChanged)}
            />
            <DetailRow
              label="On since"
              value={device.onSince ? formatTime(device.onSince) : "Not active"}
            />
            <DetailRow label="Room" value={device.roomName} />
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <IconX data-icon="inline-start" />
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground [&_svg]:size-4">
        {icon}
        {label}
      </div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
