export type BathingSpot = {
  id: string
  name: string
  location: string
  description: string
  waterTemperature: number
  waterQuality: "Excellent" | "Good" | "Fair" | "Poor"
  crowdLevel: "Low" | "Moderate" | "High"
  partyLevel: "Quiet" | "Chill" | "Party-Friendly"
  byobFriendly: boolean
  sunsetViews: boolean
  lastUpdated: string
  imageUrl: string
  facilities: string[]
  coordinates: {
    lat: number
    lon: number
  }
  vibes: string[]
}

export const bathingSpots: BathingSpot[] = [
  {
    id: "huk",
    name: "Huk Beach",
    location: "Bygdøy, Oslo",
    description:
      "Huk is one of Oslo's most popular beaches, located on the Bygdøy peninsula. It features a sandy beach, grassy areas, and beautiful views of the Oslo Fjord. Perfect for beach parties and sunset sessions with friends.",
    waterTemperature: 21.5,
    waterQuality: "Excellent",
    crowdLevel: "High",
    partyLevel: "Party-Friendly",
    byobFriendly: true,
    sunsetViews: true,
    lastUpdated: "Today, 10:00 AM",
    imageUrl: "/oslo-beach.png",
    facilities: ["Toilets", "Changing Rooms", "Kiosk", "Volleyball Court", "Lifeguard", "BBQ Areas"],
    coordinates: {
      lat: 59.8967,
      lon: 10.6774,
    },
    vibes: ["Beach Volleyball", "Sunset Parties", "Group Hangouts", "Music Friendly"],
  },
  {
    id: "sorenga",
    name: "Sørenga Seawater Pool",
    location: "Sørenga, Oslo",
    description:
      "Sørenga is a modern bathing facility in the heart of Oslo, featuring a seawater pool and floating pontoons. Great for sophisticated hangouts with cava and city vibes.",
    waterTemperature: 19.8,
    waterQuality: "Good",
    crowdLevel: "High",
    partyLevel: "Chill",
    byobFriendly: true,
    sunsetViews: false,
    lastUpdated: "Today, 09:30 AM",
    imageUrl: "/oslo-harbor-pool.png",
    facilities: ["Toilets", "Changing Rooms", "Showers", "Restaurants Nearby", "Diving Platform"],
    coordinates: {
      lat: 59.9042,
      lon: 10.7579,
    },
    vibes: ["Urban Chic", "Rooftop Vibes", "Sophisticated Hangouts", "City Views"],
  },
  {
    id: "paradisbukta",
    name: "Paradisbukta",
    location: "Bygdøy, Oslo",
    description:
      "Paradise Bay lives up to its name! A sheltered beach perfect for intimate gatherings, picnics with wine, and relaxed vibes away from the crowds.",
    waterTemperature: 20.2,
    waterQuality: "Excellent",
    crowdLevel: "Moderate",
    partyLevel: "Chill",
    byobFriendly: true,
    sunsetViews: true,
    lastUpdated: "Today, 09:45 AM",
    imageUrl: "/oslo-beach-cove.png",
    facilities: ["Toilets", "BBQ Areas", "Picnic Tables", "Parking Nearby"],
    coordinates: {
      lat: 59.8945,
      lon: 10.6712,
    },
    vibes: ["Intimate Gatherings", "Picnic Perfect", "Wine & Dine", "Secluded Chill"],
  },
  {
    id: "katten",
    name: "Katten",
    location: "Nordstrand, Oslo",
    description:
      "A hidden gem for those who know! Small and peaceful, perfect for quiet drinks with close friends and enjoying the simple pleasures of beach life.",
    waterTemperature: 18.5,
    waterQuality: "Good",
    crowdLevel: "Low",
    partyLevel: "Quiet",
    byobFriendly: true,
    sunsetViews: false,
    lastUpdated: "Today, 10:15 AM",
    imageUrl: "/placeholder-p2abn.png",
    facilities: ["Toilets", "Changing Rooms", "Picnic Area"],
    coordinates: {
      lat: 59.8756,
      lon: 10.8234,
    },
    vibes: ["Local Secret", "Peaceful Retreat", "Intimate Vibes", "Mindful Moments"],
  },
  {
    id: "hovedoya",
    name: "Hovedøya Island",
    location: "Hovedøya, Oslo",
    description:
      "An island adventure! Take the ferry with your crew and coolers full of drinks. Historic ruins meet beach party vibes in this unique Oslo gem.",
    waterTemperature: 17.8,
    waterQuality: "Excellent",
    crowdLevel: "Moderate",
    partyLevel: "Party-Friendly",
    byobFriendly: true,
    sunsetViews: true,
    lastUpdated: "Today, 09:00 AM",
    imageUrl: "/placeholder.svg?height=600&width=800&query=island+beach+with+clear+water+in+Oslo+fjord",
    facilities: ["Toilets", "Cafe", "Picnic Areas", "Historic Sites", "Nature Trails"],
    coordinates: {
      lat: 59.9025,
      lon: 10.7456,
    },
    vibes: ["Island Adventure", "Historic Exploration", "Group Expeditions", "Ferry Fun"],
  },
  {
    id: "ingierstrand",
    name: "Ingierstrand",
    location: "Oppegård, Oslo",
    description:
      "Retro beach resort vibes from the 1930s! Iconic architecture meets modern beach parties. The diving towers are perfect for showing off after a few beers!",
    waterTemperature: 16.5,
    waterQuality: "Good",
    crowdLevel: "High",
    partyLevel: "Party-Friendly",
    byobFriendly: true,
    sunsetViews: true,
    lastUpdated: "Today, 10:30 AM",
    imageUrl: "/placeholder.svg?height=600&width=800&query=historic+beach+resort+with+diving+tower+in+Oslo",
    facilities: ["Toilets", "Changing Rooms", "Restaurant", "Diving Towers", "Parking"],
    coordinates: {
      lat: 59.7834,
      lon: 10.6123,
    },
    vibes: ["Retro Cool", "Diving Fun", "Architecture Lovers", "Classic Beach Day"],
  },
]

// Add the missing function
export function getBathingSpots(): BathingSpot[] {
  return bathingSpots
}
