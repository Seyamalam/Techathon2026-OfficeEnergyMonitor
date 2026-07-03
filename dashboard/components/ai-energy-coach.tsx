"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { IconBrain, IconRefresh } from "@tabler/icons-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { AiInsight } from "@/lib/ai-insights"

type AiInsightResponse = {
  model: string
  insight: AiInsight
}

export function AiEnergyCoach() {
  const [data, setData] = useState<AiInsightResponse | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  async function loadInsight({ notify = false } = {}) {
    try {
      setStatus("loading")
      const response = await fetch("/api/ai-insight", { cache: "no-store" })

      if (!response.ok) {
        throw new Error(`AI insight failed: ${response.status}`)
      }

      const nextData = (await response.json()) as AiInsightResponse
      setData(nextData)
      setStatus("ready")

      if (notify) {
        toast("AI insight refreshed", {
          description:
            nextData.insight.source === "openrouter"
              ? "OpenRouter generated a fresh recommendation."
              : "Fallback recommendation is active.",
        })
      }
    } catch {
      setStatus("error")
    }
  }

  useEffect(() => {
    let active = true

    queueMicrotask(() => {
      if (active) {
        loadInsight()
      }
    })

    return () => {
      active = false
    }
  }, [])

  const insight = data?.insight

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBrain data-icon="inline-start" />
          AI energy coach
        </CardTitle>
        <CardDescription>
          OpenRouter turns the live office state into concise actions.
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            disabled={status === "loading"}
            onClick={() => loadInsight({ notify: true })}
          >
            <IconRefresh data-icon="inline-start" />
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {status === "loading" ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : status === "error" || !insight ? (
          <Alert variant="destructive">
            <IconBrain />
            <AlertTitle>AI insight unavailable</AlertTitle>
            <AlertDescription>
              The dashboard can still use live device data and alerts.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  insight.riskLevel === "critical"
                    ? "destructive"
                    : insight.riskLevel === "watch"
                      ? "secondary"
                      : "outline"
                }
              >
                {insight.riskLevel}
              </Badge>
              <Badge variant="outline">{data.model}</Badge>
              <Badge variant="secondary">{insight.source}</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {insight.summary}
            </p>
            <div className="flex flex-col gap-2">
              {insight.actions.map((action) => (
                <div
                  key={action}
                  className="rounded-lg border bg-muted p-3 text-sm leading-6"
                >
                  {action}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
