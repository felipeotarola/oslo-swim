import Link from "next/link"
import { Button } from "@/components/ui/button"
import AllBathingSpotsLis from "@/components/all-bathing-spots-list"
import { Header } from "@/components/header"
import { WeatherOverview } from "@/components/weather-overview"
import { NorwegianSummerMagic } from "@/components/norwegian-summer-magic"
import { SpontaneousDiscovery } from "@/components/spontaneous-discovery"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-sky-900 mb-4">Find the Perfect Spot for a Swim</h2>
            <p className="text-sky-800 mb-6">Check real-time water temperatures at Oslo's most popular bathing spots</p>
            <div className="flex justify-center gap-4">
              <Button className="bg-sky-600 hover:bg-sky-700">
                <Link href="/beaches">Explore Beaches</Link>
              </Button>
              <Button variant="outline" className="bg-white text-sky-600 border-sky-600 hover:bg-sky-100">
                <Link href="/favorites">My Favorites</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="max-w-4xl mx-auto">
            <WeatherOverview />
          </div>
        </section>

        <section className="mb-10">
          <div className="max-w-4xl mx-auto">
            <NorwegianSummerMagic />
          </div>
        </section>

        <section className="mb-10">
          <div className="max-w-4xl mx-auto">
            <SpontaneousDiscovery />
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-sky-800 mb-6">Popular Bathing Spots</h3>
          <AllBathingSpotsLis />
        </section>
      </main>

      <footer className="bg-sky-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Bringing good vibes to Oslo beaches 🌊🍻</p>
        </div>
      </footer>
    </div>
  )
}
