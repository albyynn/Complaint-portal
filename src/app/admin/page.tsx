"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Complaint } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { LogOut, Search, Filter } from "lucide-react"
import { useComplaints } from "@/lib/hooks"
import { LoadingPage } from "@/components/loading"

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const { complaints: allComplaints, isLoading } = useComplaints()
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])

    // Filters
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [branchFilter, setBranchFilter] = useState("All")

    useEffect(() => {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
            router.push("/login")
            return
        }
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role === 'student') {
            router.push("/dashboard")
            return
        }
        setUser(parsedUser)
    }, [router])

    useEffect(() => {
        if (!allComplaints) return

        let result = allComplaints

        if (search) {
            result = result.filter(c =>
                c.subject.toLowerCase().includes(search.toLowerCase()) ||
                c.id.includes(search)
            )
        }

        if (statusFilter !== "All") {
            result = result.filter(c => c.status === statusFilter)
        }

        if (branchFilter !== "All") {
            result = result.filter(c => c.branch === branchFilter)
        }

        setFilteredComplaints(result)
    }, [allComplaints, search, statusFilter, branchFilter])

    function handleLogout() {
        localStorage.removeItem("user")
        router.push("/")
    }

    const stats = {
        total: allComplaints?.length || 0,
        open: allComplaints?.filter(c => c.status === 'Open').length || 0,
        resolved: allComplaints?.filter(c => c.status === 'Resolved').length || 0,
        critical: allComplaints?.filter(c => c.urgency === 'Critical').length || 0
    }

    if (isLoading) return <LoadingPage />

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold">Admin Portal</h1>
                        <Badge variant="secondary">{user?.role}</Badge>
                    </div>
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

            <main className="flex-1 container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by subject or ID..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Branches</SelectItem>
                            <SelectItem value="Kochi">Kochi</SelectItem>
                            <SelectItem value="Bangalore">Bangalore</SelectItem>
                            <SelectItem value="Chennai">Chennai</SelectItem>
                            <SelectItem value="Trivandrum">Trivandrum</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border bg-card">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Branch</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Urgency</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredComplaints.map((complaint) => (
                                    <tr key={complaint.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle font-medium">{complaint.subject}</td>
                                        <td className="p-4 align-middle">{complaint.branch}</td>
                                        <td className="p-4 align-middle">{complaint.category}</td>
                                        <td className="p-4 align-middle">
                                            <Badge variant="outline" className={
                                                complaint.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        ''
                                            }>
                                                {complaint.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={complaint.urgency === 'Critical' ? 'text-red-500 font-bold' : ''}>
                                                {complaint.urgency}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <Link href={`/complaints/${complaint.id}`}>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
