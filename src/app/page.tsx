"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SplashScreen } from "@/components/splash-screen"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if user is already logged in
    const user = localStorage.getItem("user")
    if (user) {
      // If logged in, still show splash briefly then redirect
      setTimeout(() => {
        const parsedUser = JSON.parse(user)
        if (parsedUser.role === 'admin' || parsedUser.role === 'consultant') {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }, 2500)
    }
  }, [router])

  function handleSplashComplete() {
    setShowSplash(false)
  }

  if (!isMounted) return null

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="mb-8 p-6 bg-primary/10 rounded-full animate-pulse">
          <GraduationCap className="h-16 w-16 text-primary" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Brototype Help
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Your voice matters. Submit complaints, track status, and get help quickly.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/register" className="w-full">
            <Button size="lg" className="w-full text-lg h-12">
              Get Started
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="outline" size="lg" className="w-full text-lg h-12">
              I have an account
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
