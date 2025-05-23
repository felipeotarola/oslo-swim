// Norwegian Summer Utilities

// Calculate golden hour for Oslo
export function calculateGoldenHour() {
  const now = new Date()
  const month = now.getMonth() // 0-11

  // Oslo coordinates
  const lat = 59.9139
  const lng = 10.7522

  // Simplified calculation for demo purposes
  // In a real app, use a proper sunrise/sunset library
  let sunsetHour = 0
  let sunsetMinute = 0

  // Approximate sunset times for Oslo by month
  if (month === 5) {
    // June
    sunsetHour = 22
    sunsetMinute = 45
  } else if (month === 6) {
    // July
    sunsetHour = 22
    sunsetMinute = 30
  } else if (month === 7) {
    // August
    sunsetHour = 21
    sunsetMinute = 15
  } else if (month === 4) {
    // May
    sunsetHour = 21
    sunsetMinute = 30
  } else if (month === 8) {
    // September
    sunsetHour = 19
    sunsetMinute = 30
  } else {
    // Default for other months
    sunsetHour = 18
    sunsetMinute = 0
  }

  // Golden hour starts about 1 hour before sunset
  const goldenHourStart = new Date(now)
  goldenHourStart.setHours(sunsetHour - 1, sunsetMinute, 0)

  const goldenHourEnd = new Date(now)
  goldenHourEnd.setHours(sunsetHour, sunsetMinute, 0)

  // Format times
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return {
    startTime: formatTime(goldenHourStart),
    endTime: formatTime(goldenHourEnd),
  }
}

// Get seasonal tips for Norwegian summer
export function getSeasonalTip() {
  const tips = [
    {
      tip: "Bring a guitar - Norwegians love beach singalongs!",
      type: "tradition",
    },
    {
      tip: "Ice swimming season starts in October! Brave locals swim year-round.",
      type: "seasonal",
    },
    {
      tip: "Midsummer (Sankthansaften) on June 23rd has beach bonfires across Oslo.",
      type: "midsummer",
    },
    {
      tip: "Norwegians often bring engangsgrill (disposable BBQs) to beaches.",
      type: "tradition",
    },
    {
      tip: "Bring a thermos of coffee - Norwegians drink coffee anytime, anywhere!",
      type: "tradition",
    },
    {
      tip: "August has the warmest water temperatures in Oslo fjord.",
      type: "seasonal",
    },
    {
      tip: "Locals often take a morning swim before work in summer.",
      type: "tradition",
    },
    {
      tip: "Hovedøya island hosts special midsummer celebrations.",
      type: "midsummer",
    },
    {
      tip: "September offers peaceful beaches with fewer tourists.",
      type: "seasonal",
    },
    {
      tip: "Bring 'matpakke' (packed lunch) - a Norwegian tradition!",
      type: "tradition",
    },
  ]

  const randomIndex = Math.floor(Math.random() * tips.length)
  return tips[randomIndex]
}

// Check if it's currently midsummer season
export function isMidsummerSeason() {
  const now = new Date()
  const month = now.getMonth() // 0-11
  const day = now.getDate()

  // Midsummer is around June 23 (Sankthansaften)
  return (month === 5 && day >= 15) || (month === 5 && day <= 30)
}
