"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Paperclip } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    branch: z.string().min(1, "Please select a branch"),
    category: z.string().min(1, "Please select a category"),
    urgency: z.string().min(1, "Please select urgency level"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    isAnonymous: z.boolean(),
    studentName: z.string().optional(),
    studentEmail: z.string().email("Invalid email").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

export function ComplaintForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [attachments, setAttachments] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            branch: "",
            category: "",
            urgency: "Normal",
            subject: "",
            message: "",
            isAnonymous: false,
            studentName: "",
            studentEmail: "",
        },
    })

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            const user = JSON.parse(userData)
            if (user.role === 'student') {
                form.setValue("studentName", user.name)
                form.setValue("studentEmail", user.email)
            }
        }
    }, [form])

    const isAnonymous = form.watch("isAnonymous")

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            setAttachments(prev => [...prev, data.url])
            toast.success("File uploaded successfully")
        } catch (error) {
            toast.error("Failed to upload file")
        } finally {
            setIsUploading(false)
        }
    }

    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        try {
            const userData = localStorage.getItem("user")
            let finalValues = { ...values }
            let userId = undefined

            if (userData) {
                const user = JSON.parse(userData)
                userId = user.id || user.email // Use user ID for tracking

                if (!values.isAnonymous) {
                    if (!finalValues.studentEmail) finalValues.studentEmail = user.email
                    if (!finalValues.studentName) finalValues.studentName = user.name
                }
            }

            const payload = { ...finalValues, attachments, userId }
            const response = await fetch("/api/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error("Failed to submit")

            const data = await response.json()

            // If anonymous, save ID to local storage so user can see it in dashboard
            if (values.isAnonymous) {
                const storedIds = JSON.parse(localStorage.getItem("anonymous_complaint_ids") || "[]")
                storedIds.push(data.id)
                localStorage.setItem("anonymous_complaint_ids", JSON.stringify(storedIds))
            }

            toast.success("Complaint submitted successfully!")
            form.reset()
            setAttachments([])
        } catch (error) {
            toast.error("Failed to submit complaint. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Submit a Complaint</CardTitle>
                <CardDescription>
                    We value your feedback. Please fill out the form below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="branch"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Branch</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Branch" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Kochi">Kochi</SelectItem>
                                                <SelectItem value="Bangalore">Bangalore</SelectItem>
                                                <SelectItem value="Chennai">Chennai</SelectItem>
                                                <SelectItem value="Trivandrum">Trivandrum</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="urgency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Urgency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Urgency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Normal">Normal</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                                <SelectItem value="Critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Academic">Academic</SelectItem>
                                            <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                            <SelectItem value="Hostel">Hostel</SelectItem>
                                            <SelectItem value="Placement">Placement</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief summary of the issue" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Detailed Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please describe your issue in detail..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel>Attachments (Optional)</FormLabel>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isUploading}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                                    Attach File
                                </Button>
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                {attachments.length > 0 && (
                                    <span className="text-sm text-muted-foreground">
                                        {attachments.length} file(s) attached
                                    </span>
                                )}
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="isAnonymous"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Submit Anonymously
                                        </FormLabel>
                                        <FormDescription>
                                            Your identity will be hidden from admins. You won't be able to track this complaint unless you save the ID.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {!isAnonymous && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="studentName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="studentEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="your@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Complaint"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
