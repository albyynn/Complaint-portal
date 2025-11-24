"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Complaint } from "@/lib/db"
import { ComplaintCard } from "@/components/complaint-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus } from "lucide-react"
import { useComplaints } from "@/lib/hooks"
import { LoadingPage } from "@/components/loading"

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const { complaints: allComplaints, isLoading } = useComplaints()
    const [myComplaints, setMyComplaints] = useState<Complaint[]>([])

    useEffect(() => {
        // Check auth
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
            router.push("/login")
            return
        }
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
    }, [router])

    useEffect(() => {
        if (allComplaints && user) {
            const anonymousIds = JSON.parse(localStorage.getItem("anonymous_complaint_ids") || "[]")
            const currentUserId = user.id || user.email

            const filtered = allComplaints.filter((c) =>
                c.userId === currentUserId ||
                c.studentEmail === user.email ||
                anonymousIds.includes(c.id)
            )
            setMyComplaints(filtered)
        }
    }, [allComplaints, user])

    function handleLogout() {
        localStorage.removeItem("user")
        router.push("/")
    }

    if (isLoading) return <LoadingPage />

    return (
        <div className="min-h-screen bg-background flex flex-col relative">
            <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">My Complaints</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden md:inline">
                            {user?.name}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 pb-24">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">History</h2>
                    <Link href="/submit" className="hidden md:block">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Complaint
                        </Button>
                    </Link>
                </div>

                {myComplaints.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground mb-4">No complaints found.</p>
                        <Link href="/submit">
                            <Button variant="outline">Submit your first complaint</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myComplaints.map((complaint) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} />
                        ))}
                    </div>
                )}
            </main>

            {/* Mobile FAB */}
            <Link href="/submit" className="md:hidden fixed bottom-6 right-6 z-50">
                <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
                    <Plus className="h-6 w-6" />
                </Button>
            </Link>
        </div>
    )
}
