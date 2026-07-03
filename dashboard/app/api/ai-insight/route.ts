import { getAiInsight } from "@/lib/ai-insights"
import { getEnergyState } from "@/lib/energy-simulator"

export const dynamic = "force-dynamic"

export async function GET() {
  const state = getEnergyState()
  const insight = await getAiInsight(state)

  return Response.json(
    {
      generatedAt: state.generatedAt,
      model: process.env.OPENROUTER_MODEL ?? "openrouter/free",
      insight,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
