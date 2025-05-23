"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testWeatherAPI } from "@/lib/weather-service"

export function WeatherDebug() {
  const [apiStatus, setApiStatus] = useState<"testing" | "working" | "failed">("testing")
  const [apiKey, setApiKey] = useState<string>("")

  useEffect(() => {
    const checkAPI = async () => {
      const apiKeyValue = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "Not set"
      setApiKey(apiKeyValue.substring(0, 8) + "...")

      const isWorking = await testWeatherAPI()
      setApiStatus(isWorking ? "working" : "failed")
    }

    checkAPI()
  }, [])

  return (
    <Card className="bg-white border-sky-200 mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-sky-800">Weather API Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-sky-700">API Key:</span>
            <span className="text-sm font-mono">{apiKey}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-sky-700">Status:</span>
            {apiStatus === "testing" && <Badge variant="secondary">Testing...</Badge>}
            {apiStatus === "working" && <Badge className="bg-green-500">Working</Badge>}
            {apiStatus === "failed" && <Badge variant="destructive">Failed</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
