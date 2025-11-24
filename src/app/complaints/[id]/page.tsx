"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Send } from "lucide-react"
import { Complaint, Note } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useComplaint } from "@/lib/hooks"
import { LoadingPage } from "@/components/loading"

export default function ComplaintDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { complaint, isLoading, mutate } = useComplaint(params.id as string)
    const [newNote, setNewNote] = useState("")
    const [isInternal, setIsInternal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    async function handleAddNote() {
        if (!newNote.trim() || !complaint) return
        setSubmitting(true)

        const note = {
            id: Date.now().toString(),
            author: user?.name || "Student",
            message: newNote,
            visibleToStudent: !isInternal,
            date: new Date().toISOString()
        }

        const updatedNotes = [...(complaint.notes || []), note]

        // Optimistic update
        mutate({ ...complaint, notes: updatedNotes }, false)

        try {
            const res = await fetch(`/api/complaints/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: updatedNotes })
            })

            if (!res.ok) throw new Error("Failed to update")

            setNewNote("")
            toast.success("Comment added")
            mutate() // Revalidate
        } catch (error) {
            toast.error("Failed to add comment")
            mutate() // Revert on error
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        try {
            const res = await fetch(`/api/complaints/${params.id}`, {
                method: "DELETE"
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Complaint deleted")

            if (user?.role === 'admin' || user?.role === 'consultant') {
                router.push("/admin")
            } else {
                router.push("/dashboard")
            }
        } catch (error) {
            toast.error("Failed to delete complaint")
        }
    }

    if (isLoading) return <LoadingPage />
    if (!complaint) return <div className="p-8 text-center">Complaint not found</div>

    const statusColors = {
        Open: "bg-blue-500",
        "In Progress": "bg-yellow-500",
        Resolved: "bg-green-500",
        Closed: "bg-gray-500",
    }

    const canDelete = user?.role === 'admin' || (user?.role === 'student' && user?.email === complaint.studentEmail);

    return (
        <div className="min-h-screen bg-background pb-12">
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold">Complaint Details</h1>
                    </div>
                    {canDelete && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the complaint.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2">{complaint.category}</Badge>
                                        <CardTitle className="text-2xl">{complaint.subject}</CardTitle>
                                    </div>
                                    <Badge className={statusColors[complaint.status as keyof typeof statusColors] || "bg-gray-500"}>
                                        {complaint.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-2">
                                    Posted {complaint.createdAt && !isNaN(new Date(complaint.createdAt).getTime())
                                        ? formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })
                                        : 'recently'}
                                    {complaint.branch && ` • ${complaint.branch}`}
                                    <span className="ml-2">
                                        • by {complaint.isAnonymous ? (
                                            <span className="italic">Anonymous Student</span>
                                        ) : (
                                            <span className="font-medium">
                                                {complaint.studentName} ({complaint.studentEmail})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="whitespace-pre-wrap text-muted-foreground">
                                        {complaint.message}
                                    </p>
                                </div>

                                {complaint.attachments && complaint.attachments.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-2">Attachments</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {complaint.attachments.map((url, i) => (
                                                <Link key={i} href={url} target="_blank" className="text-primary hover:underline text-sm bg-muted px-3 py-1 rounded-md">
                                                    Attachment {i + 1}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Activity & Comments</h3>

                            {complaint.notes?.filter(n => n.visibleToStudent || user?.role === 'admin' || user?.role === 'consultant').map((note) => (
                                <Card key={note.id} className={`bg-muted/30 ${!note.visibleToStudent ? 'border-l-4 border-l-yellow-500' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{note.author}</span>
                                                {!note.visibleToStudent && <Badge variant="outline" className="text-[10px] h-5">Internal</Badge>}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(note.date), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm">{note.message}</p>
                                    </CardContent>
                                </Card>
                            ))}

                            {!complaint.isAnonymous && user?.role === 'student' && user?.email === complaint.studentEmail && (
                                <Card>
                                    <CardContent className="p-4 space-y-4">
                                        <Textarea
                                            placeholder="Add a follow-up comment..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleAddNote} disabled={submitting || !newNote.trim()}>
                                                {submitting ? "Sending..." : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Send Comment
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {complaint.isAnonymous && (
                                <div className="text-center p-4 text-muted-foreground text-sm bg-muted/20 rounded-lg">
                                    Comments are disabled for anonymous complaints to protect privacy.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {user?.role === 'admin' || user?.role === 'consultant' ? (
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle className="text-lg">Admin Controls</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Update Status</label>
                                        <Select
                                            value={complaint.status}
                                            onValueChange={async (val) => {
                                                // Optimistic update
                                                mutate({ ...complaint, status: val as "Open" | "In Progress" | "Resolved" | "Closed" }, false)
                                                try {
                                                    const res = await fetch(`/api/complaints/${params.id}`, {
                                                        method: "PATCH",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({ status: val })
                                                    })
                                                    if (!res.ok) throw new Error("Failed")
                                                    toast.success("Status updated")
                                                    mutate()
                                                } catch {
                                                    toast.error("Failed to update status")
                                                    mutate()
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Open">Open</SelectItem>
                                                <SelectItem value="In Progress">In Progress</SelectItem>
                                                <SelectItem value="Resolved">Resolved</SelectItem>
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add Note</label>
                                        <Textarea
                                            placeholder="Add a note..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="internal"
                                                    checked={isInternal}
                                                    onCheckedChange={(c) => setIsInternal(c as boolean)}
                                                />
                                                <label htmlFor="internal" className="text-sm text-muted-foreground">
                                                    Internal Note (Admin only)
                                                </label>
                                            </div>
                                            <Button onClick={handleAddNote} disabled={submitting || !newNote.trim()} size="sm">
                                                Add Note
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Status History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative pl-4 border-l-2 border-muted space-y-6">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                                            <p className="text-sm font-medium">Complaint Submitted</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {/* In a real app, we'd track status changes in a separate audit log */}
                                        {complaint.status !== 'Open' && (
                                            <div className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                                                <p className="text-sm font-medium">Status: {complaint.status}</p>
                                                <p className="text-xs text-muted-foreground">Current</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
