"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Upload, X, Plus, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { AddressInput } from "@/components/address-input"

interface Coordinates {
  lat: number
  lng: number
}

export default function AddSpotPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [address, setAddress] = useState("")
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [description, setDescription] = useState("")
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>("")
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/login?redirectTo=/add-spot")
    return null
  }

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

    toast({
      title: "Image selected",
      description: `Selected ${file.name} as main image`,
    })
  }

  const handleAdditionalImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (additionalImages.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 additional images.",
        variant: "destructive",
      })
      return
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        })
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setAdditionalImages((prev) => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAdditionalImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })

    toast({
      title: "Images added",
      description: `Added ${validFiles.length} additional image(s)`,
    })
  }

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    setAdditionalImagePreviews((prev) => prev.filter((_, i) => i !== index))

    toast({
      title: "Image removed",
      description: "Additional image has been removed",
    })
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

      toast({
        title: "Upload successful",
        description: `${imageType} uploaded successfully`,
      })

      return url
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error)
      toast({
        title: "Upload failed",
        description: `Failed to upload ${imageType}: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      throw error
    }
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
        description: "Please select a location on the map or use your current location.",
        variant: "destructive",
      })
      return
    }

    if (!mainImage) {
      toast({
        title: "Main image required",
        description: "Please upload a main image for the spot.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress("Starting upload...")

    try {
      // Upload main image
      const mainImageUrl = await uploadImage(mainImage, "main image")

      // Upload additional images
      const additionalImageUrls: string[] = []
      for (let i = 0; i < additionalImages.length; i++) {
        const url = await uploadImage(additionalImages[i], `additional image ${i + 1}`)
        additionalImageUrls.push(url)
      }

      setUploadProgress("Saving spot information...")

      // Save to database
      const { error } = await supabase.from("user_spots").insert({
        user_id: user.id,
        title: title.trim(),
        address: address.trim(),
        description: description.trim(),
        coordinates: coordinates,
        main_image_url: mainImageUrl,
        additional_images: additionalImageUrls,
        status: "pending",
      })

      if (error) {
        console.error("Database error:", error)
        throw new Error(`Failed to save spot: ${error.message}`)
      }

      toast({
        title: "Spot submitted successfully! 🎉",
        description: "Your bathing spot has been submitted for review. We'll notify you once it's approved.",
      })

      // Small delay to show success message
      setTimeout(() => {
        router.push("/my-spots")
      }, 1000)
    } catch (error: any) {
      console.error("Error submitting spot:", error)
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit spot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <Header />
      <Toaster />

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center text-sky-700 mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-sky-800">Add New Bathing Spot</CardTitle>
              <p className="text-center text-sky-600">Share a hidden gem with the swimming community</p>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Share Your Discovery:</strong> Found an amazing swimming spot? Share it with the community!
                  This can be anywhere in the world - beaches, lakes, pools, hot springs, or any great place to take a
                  dip.
                </AlertDescription>
              </Alert>

              {isSubmitting && uploadProgress && (
                <Alert className="mb-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    <strong>Uploading:</strong> {uploadProgress}
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
                    placeholder="e.g., Secret Cove at Malibu, Hidden Lake in Banff, Thermal Springs Iceland"
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-xs text-gray-500">Give your spot a memorable name that describes its location</p>
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
                  {coordinates && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                      <p className="font-medium">✓ Location confirmed</p>
                      <p className="text-xs">
                        Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
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
                    placeholder="Describe what makes this spot special: water quality, facilities, best time to visit, how to access it, nearby amenities, entry fees, etc."
                    rows={4}
                    disabled={isSubmitting}
                    required
                  />
                  <p className="text-sm text-gray-500">{description.length}/500 characters</p>
                </div>

                {/* Main Image */}
                <div className="space-y-2">
                  <Label>
                    Main Image <span className="text-red-500">*</span>
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 relative">
                    {mainImagePreview ? (
                      <div className="relative">
                        <img
                          src={mainImagePreview || "/placeholder.svg"}
                          alt="Main preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          disabled={isSubmitting}
                          onClick={() => {
                            setMainImage(null)
                            setMainImagePreview("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload main image of your spot</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-3"
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

                {/* Additional Images */}
                <div className="space-y-2">
                  <Label>Additional Images (up to 5)</Label>
                  <p className="text-sm text-gray-500">
                    Show different angles, facilities, or seasonal views of your spot
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {additionalImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          disabled={isSubmitting}
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    {additionalImages.length < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                        <div className="text-center">
                          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-xs text-gray-500 mb-2">Add Image</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => document.getElementById("additional-images-input")?.click()}
                          >
                            Choose Files
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="additional-images-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImageChange}
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
                        {uploadProgress || "Submitting..."}
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-2" />
                        Share Spot with Community
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Your submission will be reviewed before being published
                  </p>
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
