"use client"

import { useEffect, useState } from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateBeachVibes, generateDrinkRecommendation, generateBeachQuote } from "@/lib/ai-service"

interface BeachVibesProps {
  temperature: number
  weather: string
  spotName: string
}

export function BeachVibes({ temperature, weather, spotName }: BeachVibesProps) {
  const [vibes, setVibes] = useState<string | null>(null)
  const [drinks, setDrinks] = useState<string | null>(null)
  const [quote, setQuote] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Generate content in parallel
      const [vibesResult, drinksResult, quoteResult] = await Promise.all([
        generateBeachVibes(temperature, weather, spotName),
        generateDrinkRecommendation(temperature, weather),
        generateBeachQuote(),
      ])

      setVibes(vibesResult)
      setDrinks(drinksResult)
      setQuote(quoteResult)
    } catch (err) {
      console.error("Error generating beach content:", err)
      setError("Couldn't load beach vibes. Try refreshing!")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateContent()
  }, [temperature, weather, spotName])

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-orange-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Beach Day Vibes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateContent}
            disabled={isLoading}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center p-3 bg-white/50 rounded-lg border border-orange-200">
            <p className="text-orange-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateContent}
              className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {quote && (
              <div className="text-center p-3 bg-white/50 rounded-lg border border-orange-200">
                <p className="text-orange-800 font-medium italic">{quote}</p>
              </div>
            )}

            {vibes && (
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-800">Today's Vibe Check ✨</h3>
                <div className="p-3 bg-white/50 rounded-lg border border-orange-200">
                  <p className="text-orange-700 text-sm whitespace-pre-line">{vibes}</p>
                </div>
              </div>
            )}

            {drinks && (
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-800">Perfect Drinks 🍻</h3>
                <div className="p-3 bg-white/50 rounded-lg border border-orange-200">
                  <p className="text-orange-700 text-sm whitespace-pre-line">{drinks}</p>
                </div>
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-orange-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-orange-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
