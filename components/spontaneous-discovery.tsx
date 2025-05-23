"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2 } from "lucide-react"
import { getBathingSpots } from "@/lib/data"
import Link from "next/link"

export function SpontaneousDiscovery() {
  const [spinning, setSpinning] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<any>(null)
  const [vibe, setVibe] = useState<"party" | "chill" | "quiet">("chill")
  const [loading, setLoading] = useState(false)
  const [perfectSpot, setPerfectSpot] = useState<any>(null)
  const [perfectSpotReason, setPerfectSpotReason] = useState("")

  const spots = getBathingSpots()

  const spinRoulette = () => {
    setSpinning(true)
    setSelectedSpot(null)

    // Filter spots by vibe if needed
    const filteredSpots = spots.filter((spot) => {
      if (vibe === "party") return spot.partyLevel === "Party-Friendly"
      if (vibe === "chill") return spot.partyLevel === "Chill"
      if (vibe === "quiet") return spot.partyLevel === "Quiet"
      return true
    })

    // Random selection with animation
    const randomIndex = Math.floor(Math.random() * filteredSpots.length)

    setTimeout(() => {
      setSelectedSpot(filteredSpots[randomIndex] || spots[0])
      setSpinning(false)
    }, 1500)
  }

  const findPerfectSpot = async () => {
    setLoading(true)
    setPerfectSpot(null)
    setPerfectSpotReason("")

    try {
      // Get current time and weather
      const now = new Date()
      const hour = now.getHours()
      const isEvening = hour >= 17
      const isMorning = hour < 10

      // Simple logic for now, would use AI in production
      let bestSpot
      let reason

      if (isEvening) {
        bestSpot = spots.find((s) => s.name.includes("Huk") || s.name.includes("Paradis"))
        reason =
          "Perfect for evening swims with amazing sunset views! The golden light makes this spot magical right now."
      } else if (isMorning) {
        bestSpot = spots.find((s) => s.name.includes("Sørenga"))
        reason = "Great for morning dips! Less crowded now and the water is calm and refreshing."
      } else {
        // Mid-day
        bestSpot = spots.find((s) => s.name.includes("Hovedøya"))
        reason = "Perfect for a mid-day adventure! The island location offers a nice breeze when other spots get hot."
      }

      // Fallback
      if (!bestSpot) {
        bestSpot = spots[0]
        reason = "A great all-around spot for swimming any time of day!"
      }

      setPerfectSpot(bestSpot)
      setPerfectSpotReason(reason)
    } catch (error) {
      console.error("Error finding perfect spot:", error)
      // Fallback
      setPerfectSpot(spots[0])
      setPerfectSpotReason("A reliable choice for a great swim!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-300" />
          Spontaneous Discovery
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="roulette" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="roulette">Beach Roulette</TabsTrigger>
            <TabsTrigger value="perfect">Perfect Right Now</TabsTrigger>
          </TabsList>

          <TabsContent value="roulette" className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">Feeling adventurous? Spin the wheel to discover a random beach spot!</p>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              <Button
                variant="outline"
                className={`${vibe === "party" ? "bg-pink-100 border-pink-300" : ""}`}
                onClick={() => setVibe("party")}
              >
                Party Vibes
              </Button>
              <Button
                variant="outline"
                className={`${vibe === "chill" ? "bg-blue-100 border-blue-300" : ""}`}
                onClick={() => setVibe("chill")}
              >
                Chill Mood
              </Button>
              <Button
                variant="outline"
                className={`${vibe === "quiet" ? "bg-green-100 border-green-300" : ""}`}
                onClick={() => setVibe("quiet")}
              >
                Quiet Escape
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
                onClick={spinRoulette}
                disabled={spinning}
              >
                {spinning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Spinning...
                  </>
                ) : (
                  <>Spin the Beach Roulette</>
                )}
              </Button>
            </div>

            {selectedSpot && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">You got: {selectedSpot.name}!</h3>
                <p className="text-purple-700 mb-3">{selectedSpot.description}</p>
                <div className="flex justify-center">
                  <Link href={`/spot/${selectedSpot.id}`}>
                    <Button className="bg-purple-600 hover:bg-purple-700">Let's Go!</Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="perfect" className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-600">
                Let us find the perfect spot based on current time, weather, and conditions!
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                size="lg"
                onClick={findPerfectSpot}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding perfect spot...
                  </>
                ) : (
                  <>Find Perfect Spot Right Now</>
                )}
              </Button>
            </div>

            {perfectSpot && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Perfect Right Now: {perfectSpot.name}</h3>
                <p className="text-blue-700 mb-3">{perfectSpotReason}</p>
                <div className="flex justify-center">
                  <Link href={`/spot/${perfectSpot.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">Take Me There!</Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
