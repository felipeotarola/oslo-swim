const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY!
const CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

export interface CurrentWeatherData {
  main: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  name: string
}

export interface ForecastData {
  list: Array<{
    dt: number
    main: {
      temp: number
      temp_min: number
      temp_max: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
    dt_txt: string
  }>
}

export interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    wind_speed: number
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
  }
  daily: Array<{
    dt: number
    temp: {
      min: number
      max: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
  }>
}

export async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeatherData> {
  const url = `${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} - ${response.statusText}`)
  }

  return response.json()
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastData> {
  const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status} - ${response.statusText}`)
  }

  return response.json()
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    // Fetch both current weather and forecast
    const [currentWeather, forecast] = await Promise.all([fetchCurrentWeather(lat, lon), fetchForecast(lat, lon)])

    // Process forecast data to get daily forecasts
    const dailyForecasts = processForecastData(forecast)

    // Transform to match our WeatherData interface
    const weatherData: WeatherData = {
      current: {
        temp: currentWeather.main.temp,
        feels_like: currentWeather.main.feels_like,
        humidity: currentWeather.main.humidity,
        wind_speed: currentWeather.wind.speed,
        weather: currentWeather.weather,
      },
      daily: dailyForecasts,
    }

    return weatherData
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error
  }
}

function processForecastData(forecast: ForecastData) {
  // Group forecast data by day and get daily min/max temperatures
  const dailyData = new Map<
    string,
    {
      dt: number
      temps: number[]
      weather: Array<{ main: string; description: string; icon: string }>
    }
  >()

  forecast.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toDateString()

    if (!dailyData.has(date)) {
      dailyData.set(date, {
        dt: item.dt,
        temps: [],
        weather: item.weather,
      })
    }

    const dayData = dailyData.get(date)!
    dayData.temps.push(item.main.temp)
  })

  // Convert to daily forecast format (limit to 3 days)
  return Array.from(dailyData.values())
    .slice(0, 3)
    .map((day) => ({
      dt: day.dt,
      temp: {
        min: Math.min(...day.temps),
        max: Math.max(...day.temps),
      },
      weather: day.weather,
    }))
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

export function formatWeatherDescription(description: string): string {
  return description.charAt(0).toUpperCase() + description.slice(1)
}

export function getDayName(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return "Today"
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow"
  } else {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }
}

// Test function to verify API key works
export async function testWeatherAPI(): Promise<boolean> {
  try {
    // Test with Oslo coordinates
    await fetchCurrentWeather(59.9139, 10.7522)
    return true
  } catch (error) {
    console.error("Weather API test failed:", error)
    return false
  }
}
