"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Music, Calendar, Info } from "lucide-react"
import { calculateGoldenHour, getSeasonalTip } from "@/lib/norwegian-summer-utils"

export function NorwegianSummerMagic() {
  const [goldenHourEnd, setGoldenHourEnd] = useState<string>("")
  const [seasonalTip, setSeasonalTip] = useState<string>("")
  const [tipType, setTipType] = useState<"tradition" | "seasonal" | "midsummer">("tradition")

  useEffect(() => {
    // Calculate golden hour for Oslo
    const { endTime } = calculateGoldenHour()
    setGoldenHourEnd(endTime)

    // Get a random seasonal tip
    const { tip, type } = getSeasonalTip()
    setSeasonalTip(tip)
    setTipType(type as any)
  }, [])

  const getTipIcon = () => {
    switch (tipType) {
      case "tradition":
        return <Music className="h-5 w-5 text-amber-500" />
      case "midsummer":
        return <Calendar className="h-5 w-5 text-pink-500" />
      case "seasonal":
        return <Info className="h-5 w-5 text-sky-500" />
      default:
        return <Info className="h-5 w-5 text-sky-500" />
    }
  }

  const getTipLabel = () => {
    switch (tipType) {
      case "tradition":
        return "Local Tradition"
      case "midsummer":
        return "Midsummer Event"
      case "seasonal":
        return "Seasonal Tip"
      default:
        return "Norwegian Tip"
    }
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-6 w-6 text-yellow-300" />
          Norwegian Summer Magic
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-amber-100">
            <Sun className="h-8 w-8 text-amber-500" />
            <div>
              <h4 className="font-medium text-amber-800">Midnight Sun Tracker</h4>
              <p className="text-amber-700">
                {goldenHourEnd ? (
                  <>
                    Golden hour lasts until <span className="font-semibold">{goldenHourEnd}</span> today!
                  </>
                ) : (
                  "Calculating golden hour..."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-blue-100">
            {getTipIcon()}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-blue-800">{getTipLabel()}</h4>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs border-blue-200">
                  Oslo Insider
                </Badge>
              </div>
              <p className="text-blue-700">{seasonalTip || "Loading Norwegian summer tips..."}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
