import { IconCircuitBulb, IconExternalLink } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WokwiCircuitPreview } from "@/components/wokwi-circuit-preview"
import { hardwareDevices } from "@/lib/hardware-circuit"

export default function HardwarePage() {
  return (
    <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-normal">
            Hardware simulation
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            A clean in-app preview of the Wokwi representative circuit for one
            room: ESP32, five safe state inputs, and five low-voltage load
            indicators.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Wokwi concept</Badge>
          <Badge variant="outline">ESP32</Badge>
          <Badge variant="secondary">drawing-room</Badge>
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCircuitBulb data-icon="inline-start" />
              Relay and sensing preview
            </CardTitle>
            <CardDescription>
              The representative room circuit mirrors the simulator contract:
              device id, room, type, status, watts, ratedWatts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <WokwiCircuitPreview />

            <div className="rounded-lg border">
              <div className="border-b px-4 py-3">
                <div className="font-medium">Pin mapping</div>
                <div className="text-sm text-muted-foreground">
                  Matches `wokwi/diagram.json` and `wokwi/sketch.ino`.
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Relay</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Sense</TableHead>
                    <TableHead className="text-right">Watts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hardwareDevices.map((device) => (
                    <TableRow key={device.name}>
                      <TableCell className="font-medium">
                        {device.name}
                      </TableCell>
                      <TableCell>{device.relay}</TableCell>
                      <TableCell>{device.output}</TableCell>
                      <TableCell>{device.sense}</TableCell>
                      <TableCell className="text-right">
                        {device.ratedWatts}W
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository files</CardTitle>
            <CardDescription>
              Use these for the hardware deliverable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
              <FileLine path="wokwi/diagram.json" />
              <FileLine path="wokwi/sketch.ino" />
              <FileLine path="docs/hardware-schematic.md" />
              <FileLine path="docs/assets/one-room-hardware-schematic.svg" />
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function FileLine({ path }: { path: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted p-3">
      <code className="truncate text-xs">{path}</code>
      <IconExternalLink className="text-muted-foreground" />
    </div>
  )
}
