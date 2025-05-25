"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle, XCircle, Eye, MapPin, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { approveSpot, rejectSpot, type PendingSpot } from "@/lib/admin-service"

interface SpotApprovalCardProps {
  spot: PendingSpot
  onAction: () => void
}

export function SpotApprovalCard({ spot, onAction }: SpotApprovalCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleApprove = async () => {
    if (!user) return

    setIsApproving(true)
    try {
      const success = await approveSpot(spot.id, user.id)
      if (success) {
        toast({
          title: "Spot approved! ✅",
          description: `${spot.title} has been approved and is now live.`,
        })
        onAction()
      } else {
        throw new Error("Failed to approve spot")
      }
    } catch (error) {
      console.error("Error approving spot:", error)
      toast({
        title: "Error",
        description: "Failed to approve spot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!user || !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this spot.",
        variant: "destructive",
      })
      return
    }

    setIsRejecting(true)
    try {
      const success = await rejectSpot(spot.id, user.id, rejectionReason.trim())
      if (success) {
        toast({
          title: "Spot rejected",
          description: `${spot.title} has been rejected.`,
        })
        setShowRejectDialog(false)
        setRejectionReason("")
        onAction()
      } else {
        throw new Error("Failed to reject spot")
      }
    } catch (error) {
      console.error("Error rejecting spot:", error)
      toast({
        title: "Error",
        description: "Failed to reject spot. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image */}
        <div className="relative h-48 md:h-full">
          <Image src={spot.main_image_url || "/placeholder.svg"} alt={spot.title} fill className="object-cover" />
          <Badge className="absolute top-3 left-3 bg-orange-500">Pending Review</Badge>
        </div>

        {/* Content */}
        <div className="md:col-span-2 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-sky-800 mb-2">{spot.title}</h3>
              <div className="flex items-center text-sky-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{spot.address}</span>
              </div>
              <div className="flex items-center text-gray-500 mb-4">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">Submitted {new Date(spot.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">{spot.description}</p>

          {/* Submitter Info */}
          {spot.submitter_name && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Submitted by: <span className="font-medium">{spot.submitter_name}</span>
              </span>
            </div>
          )}

          {/* Spot Details */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            {spot.water_temperature && (
              <div>
                <span className="text-gray-500">Water Temp:</span>
                <span className="ml-2 font-medium">{spot.water_temperature}°C</span>
              </div>
            )}
            {spot.water_quality && (
              <div>
                <span className="text-gray-500">Water Quality:</span>
                <span className="ml-2 font-medium">{spot.water_quality}</span>
              </div>
            )}
            {spot.crowd_level && (
              <div>
                <span className="text-gray-500">Crowd Level:</span>
                <span className="ml-2 font-medium">{spot.crowd_level}</span>
              </div>
            )}
            {spot.party_level && (
              <div>
                <span className="text-gray-500">Party Level:</span>
                <span className="ml-2 font-medium">{spot.party_level}</span>
              </div>
            )}
          </div>

          {/* Facilities */}
          {spot.facilities && spot.facilities.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Facilities:</p>
              <div className="flex flex-wrap gap-1">
                {spot.facilities.map((facility, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>Approving...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={isApproving || isRejecting}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Spot</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting "{spot.title}". This will be sent to the submitter.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rejection-reason">Rejection Reason</Label>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please explain why this spot cannot be approved..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject} disabled={isRejecting}>
                    {isRejecting ? "Rejecting..." : "Reject Spot"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button asChild variant="outline">
              <Link href={`/community-spot/${spot.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
