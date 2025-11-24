"use client"

import { useRouter } from "next/navigation"
import { ComplaintForm } from "@/components/complaint-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SubmitComplaintPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">New Complaint</h1>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8">
                <ComplaintForm />
            </main>
        </div>
    )
}
