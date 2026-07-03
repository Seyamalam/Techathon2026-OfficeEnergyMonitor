"use client"

import { useEffect, useId, useState } from "react"
import mermaid from "mermaid"

import { cn } from "@/lib/utils"

export function MermaidDiagram({
  chart,
  className,
}: {
  chart: string
  className?: string
}) {
  const reactId = useId()
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`
  const [svg, setSvg] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        background: "transparent",
        primaryColor: "hsl(var(--card))",
        primaryTextColor: "hsl(var(--card-foreground))",
        primaryBorderColor: "hsl(var(--border))",
        lineColor: "hsl(var(--foreground))",
        secondaryColor: "hsl(var(--muted))",
        tertiaryColor: "hsl(var(--background))",
        noteBkgColor: "hsl(var(--muted))",
        noteTextColor: "hsl(var(--muted-foreground))",
        fontFamily: "inherit",
      },
    })

    async function renderDiagram() {
      try {
        const result = await mermaid.render(diagramId, chart)

        if (active) {
          setSvg(result.svg)
          setError("")
        }
      } catch (renderError) {
        if (active) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Unable to render Mermaid diagram."
          )
          setSvg("")
        }
      }
    }

    renderDiagram()

    return () => {
      active = false
    }
  }, [chart, diagramId])

  if (error) {
    return (
      <pre className="overflow-auto rounded-lg border bg-muted p-4 text-xs text-muted-foreground">
        {error}
      </pre>
    )
  }

  return (
    <div
      className={cn(
        "overflow-auto rounded-lg border bg-muted/20 p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-none",
        className
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
