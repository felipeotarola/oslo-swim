import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Get the OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Create a fallback function for when AI generation fails
function getFallbackBeachVibes(temperature: number, weather: string, spotName: string) {
  const isWarm = temperature > 20
  const isSunny = weather.toLowerCase().includes("sunny") || weather.toLowerCase().includes("clear")

  return `
🌞 Perfect day for ${spotName}! 

Drinks: ${isWarm ? "Cold beers, white wine spritzers, and frozen margaritas" : "Warm cider, red wine, or a thermos of hot toddy"}
Snacks: Chips, sandwiches, and fresh fruit
Activities: ${isSunny ? "Swimming, beach volleyball, and sunbathing" : "Beach walks, photography, and card games"}
What to pack: Sunscreen, bluetooth speaker, and a good book
Vibe: ${isWarm && isSunny ? "Lazy summer day with friends" : "Cozy beach hangout with your closest buddies"}

Enjoy your day at the beach! 🏖️
  `.trim()
}

function getFallbackDrinkRecommendation(temperature: number, weather: string) {
  const isWarm = temperature > 20
  const isSunny = weather.toLowerCase().includes("sunny") || weather.toLowerCase().includes("clear")

  if (isWarm && isSunny) {
    return "🍺 Cold Ringnes beer\n🥂 Chilled cava with fresh berries\n🍹 Aperol Spritz\n🧃 Non-alcoholic: Sparkling water with cucumber and mint"
  } else if (isWarm) {
    return "🍺 Craft IPA\n🍷 Rosé wine\n🥤 Non-alcoholic: Iced tea with lemon"
  } else {
    return "🍷 Red wine in a thermos\n🥃 Hot toddy or mulled wine\n☕ Non-alcoholic: Hot chocolate with marshmallows"
  }
}

const BEACH_QUOTES = [
  "Life's a beach, enjoy the waves! 🌊☀️",
  "Sunshine is the best medicine! ☀️🏖️",
  "Salt in the air, sand in my hair! 🏝️",
  "Beach more, worry less! 🌴",
  "Happiness comes in waves! 🌊",
  "Good times and tan lines! ☀️",
  "Beach days are the best days! 🏖️",
  "Sky above, sand below, peace within! ✨",
  "Mermaid kisses and starfish wishes! 🧜‍♀️",
  "Keep calm and beach on! 🌞",
]

export async function generateBeachVibes(temperature: number, weather: string, spotName: string) {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found, using fallback content")
      return getFallbackBeachVibes(temperature, weather, spotName)
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
      prompt: `Generate a fun, relaxed beach day suggestion for ${spotName} in Oslo. 
      Current weather: ${weather}, temperature: ${temperature}°C.
      
      Include suggestions for:
      - What drinks to bring (beer, cava, cocktails)
      - Snacks and food
      - Activities and games
      - What to pack
      - Vibe/mood for the day
      
      Keep it casual, fun, and Norwegian summer-friendly. Max 150 words. Use emojis and make it feel like advice from a cool local friend.`,
      maxTokens: 200,
    })
    return text
  } catch (error) {
    console.error("Error generating beach vibes:", error)
    return getFallbackBeachVibes(temperature, weather, spotName)
  }
}

export async function generatePerfectRightNow(
  userLocation: string,
  timeOfDay: string,
  weather: string,
  temperature: number,
) {
  try {
    if (!OPENAI_API_KEY) {
      return "Based on the current conditions, Huk Beach seems perfect right now! Great weather for a spontaneous beach day. 🏖️"
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
      prompt: `You're a local Oslo beach expert. Someone is at ${userLocation} and wants to go swimming right now.
      
      Current conditions:
      - Time: ${timeOfDay}
      - Weather: ${weather}
      - Temperature: ${temperature}°C
      
      Suggest the PERFECT beach spot for right now, considering:
      - Travel time from their location
      - Current weather conditions
      - Time of day (crowd levels, activities)
      - Norwegian summer culture and vibes
      
      Be enthusiastic and specific. Include why it's perfect RIGHT NOW. Max 100 words.`,
      maxTokens: 120,
    })
    return text
  } catch (error) {
    console.error("Error generating perfect right now:", error)
    return "Based on the current conditions, Huk Beach seems perfect right now! Great weather for a spontaneous beach day. 🏖️"
  }
}

export async function generateNorwegianTradition() {
  try {
    if (!OPENAI_API_KEY) {
      const traditions = [
        "🎸 Bring a guitar - Norwegians love beach singalongs, especially folk songs and popular hits!",
        "🔥 Build a small bonfire if allowed - perfect for grilling pølse (sausages) and staying warm",
        "🍺 BYOB is totally normal - most beaches allow alcohol, just clean up after yourself",
        "🏐 Beach volleyball is huge - join a game or start your own, everyone's welcome!",
        "🌅 Stay for the sunset - Norwegian summer sunsets are magical and last forever",
        "🧺 Pack a proper picnic - Norwegians take their outdoor dining seriously",
        "🎵 Create a collaborative playlist - everyone adds their favorite summer songs",
      ]
      return traditions[Math.floor(Math.random() * traditions.length)]
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
      prompt: `Share a fun Norwegian beach tradition or cultural tip that tourists might not know about.
      
      Focus on:
      - Social customs at Norwegian beaches
      - What locals typically bring or do
      - Unwritten rules or etiquette
      - Fun activities that are uniquely Norwegian
      
      Make it feel like insider knowledge from a local friend. Include an emoji and keep it under 50 words.`,
      maxTokens: 60,
    })
    return text
  } catch (error) {
    console.error("Error generating Norwegian tradition:", error)
    return "🎸 Bring a guitar - Norwegians love beach singalongs, especially folk songs and popular hits!"
  }
}

export async function generatePartyPlaylist(weather: string, timeOfDay: "morning" | "afternoon" | "evening") {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found, using fallback content")
      return '1. "Summer Vibes" - Kygo\n2. "Stole the Show" - Kygo\n3. "I\'m Good (Blue)" - David Guetta & Bebe Rexha\n4. "Sommerkroppen" - Erik & Kriss\n5. "Feels" - Calvin Harris ft. Pharrell, Katy Perry & Big Sean'
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
      prompt: `Create a fun beach party playlist suggestion for a ${timeOfDay} beach session in Oslo.
      Weather: ${weather}
      
      Suggest 5-6 songs with artist names that would be perfect for this vibe.
      Include a mix of:
      - Chill/relaxed tracks
      - Upbeat party songs
      - Norwegian or Scandinavian artists when appropriate
      
      Format as a simple list with song - artist. Keep it fun and beach-appropriate!`,
      maxTokens: 150,
    })
    return text
  } catch (error) {
    console.error("Error generating playlist:", error)
    return '1. "Summer Vibes" - Kygo\n2. "Stole the Show" - Kygo\n3. "I\'m Good (Blue)" - David Guetta & Bebe Rexha\n4. "Sommerkroppen" - Erik & Kriss\n5. "Feels" - Calvin Harris ft. Pharrell, Katy Perry & Big Sean'
  }
}

export async function generateDrinkRecommendation(temperature: number, weather: string) {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found, using fallback content")
      return getFallbackDrinkRecommendation(temperature, weather)
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
      prompt: `Suggest the perfect drinks for a beach day in Oslo.
      Temperature: ${temperature}°C, Weather: ${weather}
      
      Recommend:
      - 2-3 alcoholic drinks (beer, cava, cocktails)
      - 1-2 non-alcoholic options
      - Any special Norwegian/Scandinavian drinks
      
      Keep it short, fun, and practical. Include emojis and make it feel like a friend's recommendation. Max 100 words.`,
      maxTokens: 120,
    })
    return text
  } catch (error) {
    console.error("Error generating drink recommendation:", error)
    return getFallbackDrinkRecommendation(temperature, weather)
  }
}

export async function generateBeachQuote() {
  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not found, using fallback content")
      return BEACH_QUOTES[Math.floor(Math.random() * BEACH_QUOTES.length)]
    }

    const { text } = await generateText({
      model: openai("gpt-4o", { apiKey: OPENAI_API_KEY }),
      prompt: `Generate a fun, inspirational quote about beach life, summer vibes, or relaxing by the water.
      Make it feel Norwegian/Scandinavian in spirit - appreciating nature, hygge, and good times.
      Keep it short (max 20 words) and include relevant emojis.`,
      maxTokens: 50,
    })
    return text
  } catch (error) {
    console.error("Error generating beach quote:", error)
    return BEACH_QUOTES[Math.floor(Math.random() * BEACH_QUOTES.length)]
  }
}
