"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Upload, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { AddressInput } from "@/components/address-input"
import { getSpotById, type UnifiedSpot } from "@/lib/unified-spots-service"
import { isUserAdmin } from "@/lib/admin-service"

interface Coordinates {
  lat: number
  lng: number
}

export default function EditSpotPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [spot, setSpot] = useState<UnifiedSpot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(false)

  // Form fields
  const [title, setTitle] = useState("")
  const [address, setAddress] = useState("")
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [description, setDescription] = useState("")
  const [waterTemperature, setWaterTemperature] = useState<number>(18)
  const [waterQuality, setWaterQuality] = useState<"Excellent" | "Good" | "Fair" | "Poor">("Good")
  const [crowdLevel, setCrowdLevel] = useState<"Low" | "Moderate" | "High">("Moderate")
  const [partyLevel, setPartyLevel] = useState<"Quiet" | "Chill" | "Party-Friendly">("Chill")
  const [byobFriendly, setByobFriendly] = useState(false)
  const [sunsetViews, setSunsetViews] = useState(false)
  const [facilities, setFacilities] = useState<string[]>([])
  const [vibes, setVibes] = useState<string[]>([])
  const [newFacility, setNewFacility] = useState("")
  const [newVibe, setNewVibe] = useState("")

  // Image handling
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>("")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const spotData = await getSpotById(params.id)
        if (!spotData) {
          toast({
            title: "Spot not found",
            description: "The requested spot could not be found.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Check admin status
        const adminStatus = user ? await isUserAdmin(user.id) : false
        setIsAdmin(adminStatus)

        // Check permissions
        if (spotData.isCommunitySpot && spotData.submittedBy !== user?.id) {
          toast({
            title: "Access denied",
            description: "You can only edit spots that you submitted.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        if (spotData.isFeaturedSpot && !adminStatus) {
          toast({
            title: "Access denied",
            description: "Only admins can edit featured spots.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setSpot(spotData)

        // Populate form fields
        setTitle(spotData.name)
        setAddress(spotData.location)
        setCoordinates({ lat: spotData.coordinates.lat, lng: spotData.coordinates.lon })
        setDescription(spotData.description)
        setWaterTemperature(spotData.waterTemperature)
        setWaterQuality(spotData.waterQuality)
        setCrowdLevel(spotData.crowdLevel)
        setPartyLevel(spotData.partyLevel)
        setByobFriendly(spotData.byobFriendly)
        setSunsetViews(spotData.sunsetViews)
        setFacilities(spotData.facilities)
        setVibes(spotData.vibes)
        setMainImagePreview(spotData.imageUrl)
      } catch (error) {
        console.error("Error fetching spot:", error)
        toast({
          title: "Error loading spot",
          description: "Failed to load spot data. Please try again.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSpot()
    } else {
      router.push("/auth/login?redirectTo=/edit-spot/" + params.id)
    }
  }, [params.id, user, router, toast])

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setMainImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setMainImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File, imageType: string): Promise<string> => {
    try {
      setUploadProgress(`Uploading ${imageType}...`)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to upload ${imageType}`)
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error)
      throw error
    }
  }

  const addFacility = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities([...facilities, newFacility.trim()])
      setNewFacility("")
    }
  }

  const removeFacility = (index: number) => {
    setFacilities(facilities.filter((_, i) => i !== index))
  }

  const addVibe = () => {
    if (newVibe.trim() && !vibes.includes(newVibe.trim())) {
      setVibes([...vibes, newVibe.trim()])
      setNewVibe("")
    }
  }

  const removeVibe = (index: number) => {
    setVibes(vibes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !address.trim() || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!coordinates) {
      toast({
        title: "Location required",
        description: "Please select a location on the map.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress("Updating spot...")

    try {
      let mainImageUrl = mainImagePreview

      // Upload new main image if selected
      if (mainImage) {
        mainImageUrl = await uploadImage(mainImage, "main image")
      }

      // Update the spot based on type
      if (spot?.isCommunitySpot && spot.communitySpotId) {
        // Update community spot - only update fields that exist in the table
        const { error } = await supabase
          .from("user_spots")
          .update({
            title: title.trim(),
            address: address.trim(),
            description: description.trim(),
            coordinates: coordinates,
            main_image_url: mainImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", spot.communitySpotId)

        if (error) throw error

        toast({
          title: "Spot updated successfully! 🎉",
          description: "Your changes have been saved.",
        })

        router.push(`/community-spot/${spot.communitySpotId}`)
      } else if (spot?.isFeaturedSpot && spot.featuredSpotId) {
        // Update featured spot (admin only)
        const { error } = await supabase
          .from("featured_spots")
          .update({
            name: title.trim(),
            location: address.trim(),
            description: description.trim(),
            coordinates: coordinates,
            image_url: mainImageUrl,
            water_temperature: waterTemperature,
            water_quality: waterQuality,
            crowd_level: crowdLevel,
            party_level: partyLevel,
            byob_friendly: byobFriendly,
            sunset_views: sunsetViews,
            facilities: facilities,
            vibes: vibes,
            last_updated: new Date().toLocaleDateString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", spot.featuredSpotId)

        if (error) throw error

        toast({
          title: "Featured spot updated successfully! 🎉",
          description: "Your changes have been saved.",
        })

        router.push(`/spot/${spot.featuredSpotId}`)
      }
    } catch (error: any) {
      console.error("Error updating spot:", error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update spot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!spot) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <Link
          href={spot.isCommunitySpot ? `/community-spot/${spot.communitySpotId}` : `/spot/${spot.id}`}
          className="flex items-center text-sky-700 mb-6 hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to spot
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-sky-800">
                Edit {spot.isCommunitySpot ? "Community" : "Featured"} Spot
              </CardTitle>
              <p className="text-center text-sky-600">Update the information for {spot.name}</p>
            </CardHeader>
            <CardContent>
              {isSubmitting && uploadProgress && (
                <Alert className="mb-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <strong>Updating:</strong> {uploadProgress}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Spot Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Location <span className="text-red-500">*</span>
                  </Label>
                  <AddressInput
                    value={address}
                    onChange={setAddress}
                    onCoordinatesChange={setCoordinates}
                    placeholder="Enter address, use current location, or click on map"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {/* Only show these fields for featured spots or hide them for community spots */}
                {!spot.isCommunitySpot && (
                  <>
                    {/* Water Temperature */}
                    <div className="space-y-2">
                      <Label htmlFor="waterTemperature">Water Temperature (°C)</Label>
                      <Input
                        id="waterTemperature"
                        type="number"
                        value={waterTemperature}
                        onChange={(e) => setWaterTemperature(Number(e.target.value))}
                        min="0"
                        max="40"
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Water Quality */}
                    <div className="space-y-2">
                      <Label>Water Quality</Label>
                      <Select value={waterQuality} onValueChange={(value: any) => setWaterQuality(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Crowd Level */}
                    <div className="space-y-2">
                      <Label>Crowd Level</Label>
                      <Select value={crowdLevel} onValueChange={(value: any) => setCrowdLevel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Party Level */}
                    <div className="space-y-2">
                      <Label>Party Level</Label>
                      <Select value={partyLevel} onValueChange={(value: any) => setPartyLevel(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quiet">Quiet</SelectItem>
                          <SelectItem value="Chill">Chill</SelectItem>
                          <SelectItem value="Party-Friendly">Party-Friendly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="byobFriendly"
                          checked={byobFriendly}
                          onChange={(e) => setByobFriendly(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="byobFriendly">BYOB Friendly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sunsetViews"
                          checked={sunsetViews}
                          onChange={(e) => setSunsetViews(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="sunsetViews">Sunset Views</Label>
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="space-y-2">
                      <Label>Facilities</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newFacility}
                          onChange={(e) => setNewFacility(e.target.value)}
                          placeholder="Add facility"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFacility())}
                        />
                        <Button type="button" onClick={addFacility} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {facilities.map((facility, index) => (
                          <div key={index} className="flex items-center gap-1 bg-sky-100 px-2 py-1 rounded">
                            <span className="text-sm">{facility}</span>
                            <button
                              type="button"
                              onClick={() => removeFacility(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vibes */}
                    <div className="space-y-2">
                      <Label>Vibes</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newVibe}
                          onChange={(e) => setNewVibe(e.target.value)}
                          placeholder="Add vibe"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addVibe())}
                        />
                        <Button type="button" onClick={addVibe} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {vibes.map((vibe, index) => (
                          <div key={index} className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded">
                            <span className="text-sm">{vibe}</span>
                            <button
                              type="button"
                              onClick={() => removeVibe(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Main Image */}
                <div className="space-y-2">
                  <Label>Main Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {mainImagePreview ? (
                      <div className="relative">
                        <img
                          src={mainImagePreview || "/placeholder.svg"}
                          alt="Main preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          disabled={isSubmitting}
                          onClick={() => document.getElementById("main-image-input")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting}
                          onClick={() => document.getElementById("main-image-input")?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    id="main-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-lg py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {uploadProgress || "Updating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Update Spot
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-sky-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2025 Oslo Bathing Spots | Bringing good vibes to Oslo beaches 🌊🍻</p>
        </div>
      </footer>
    </div>
  )
}
