"use client"

import Link from "next/link"
import { WavesIcon as WaveIcon, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <WaveIcon className="h-8 w-8 text-sky-600" />
        <span className="text-2xl font-bold text-sky-800">Oslo Bathing Spots</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-sky-100 p-3 rounded-full">
              <Mail className="h-10 w-10 text-sky-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent you a verification link to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500">
            Please check your email inbox and click on the verification link to activate your account. If you don&apos;t
            see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full bg-sky-600 hover:bg-sky-700">
            <Link href="/auth/login">Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
