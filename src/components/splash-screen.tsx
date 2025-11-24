"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onComplete, 500) // Wait for exit animation
        }, 2000)

        return () => clearTimeout(timer)
    }, [onComplete])

    if (!isVisible) return null

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="flex justify-center mb-4"
                >
                    <div className="p-4 bg-primary rounded-full">
                        <GraduationCap className="h-12 w-12 text-primary-foreground" />
                    </div>
                </motion.div>
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold tracking-tight"
                >
                    Brototype Help
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground mt-2"
                >
                    Student Complaint Portal
                </motion.p>
            </div>
        </motion.div>
    )
}
