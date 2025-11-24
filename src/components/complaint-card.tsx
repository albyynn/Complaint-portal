import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Complaint } from "@/lib/db"
import { Button } from "@/components/ui/button"

interface ComplaintCardProps {
    complaint: Complaint
}

export function ComplaintCard({ complaint }: ComplaintCardProps) {
    const statusColors = {
        Open: "bg-blue-500",
        "In Progress": "bg-yellow-500",
        Resolved: "bg-green-500",
        Closed: "bg-gray-500",
    }

    return (
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden active:scale-[0.99] transition-transform duration-100">
            <Link href={`/complaints/${complaint.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View Details</span>
            </Link>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                        <Badge variant="outline" className="mb-2">
                            {complaint.category}
                        </Badge>
                        <CardTitle className="text-lg line-clamp-1 truncate">{complaint.subject}</CardTitle>
                    </div>
                    <Badge className={`${statusColors[complaint.status] || "bg-gray-500"} shrink-0`}>
                        {complaint.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {complaint.message}
                </p>
                <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
                    <span>{complaint.branch}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="secondary" className="w-full relative z-0 pointer-events-none">View Details</Button>
            </CardFooter>
        </Card>
    )
}
