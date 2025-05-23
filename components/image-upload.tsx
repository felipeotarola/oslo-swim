"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUploaded: (url: string) => void
  userId: string
}

export function ImageUpload({ currentImageUrl, onImageUploaded, userId }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload to Vercel Blob via our API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload image")
      }

      const { url } = await response.json()

      setPreviewUrl(url)
      onImageUploaded(url)

      toast({
        title: "Image uploaded",
        description: "Your profile image has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    // With Vercel Blob, we don't need to manually delete the old image
    // as they will be automatically cleaned up if not referenced
    setPreviewUrl(null)
    onImageUploaded("")

    toast({
      title: "Image removed",
      description: "Your profile image has been removed.",
    })
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-sky-100 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-sky-600" />
          )}
        </div>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : previewUrl ? "Change Photo" : "Upload Photo"}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
