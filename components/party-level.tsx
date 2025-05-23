import { Music, Volume2, VolumeX } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PartyLevelProps {
  level: "Quiet" | "Chill" | "Party-Friendly"
  className?: string
}

export function PartyLevel({ level, className = "" }: PartyLevelProps) {
  const getPartyConfig = (level: string) => {
    switch (level) {
      case "Quiet":
        return {
          icon: VolumeX,
          color: "bg-blue-500",
          text: "Quiet Vibes",
          description: "Perfect for peaceful moments",
        }
      case "Chill":
        return {
          icon: Volume2,
          color: "bg-yellow-500",
          text: "Chill Hangouts",
          description: "Relaxed atmosphere, good for groups",
        }
      case "Party-Friendly":
        return {
          icon: Music,
          color: "bg-green-500",
          text: "Party Ready",
          description: "Bring the music and good vibes!",
        }
      default:
        return {
          icon: Volume2,
          color: "bg-gray-500",
          text: level,
          description: "",
        }
    }
  }

  const config = getPartyConfig(level)
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    </div>
  )
}
