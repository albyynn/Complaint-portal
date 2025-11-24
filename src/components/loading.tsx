"use client"

import { motion } from "framer-motion"

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    return (
        <div className="flex items-center justify-center">
            <motion.div
                className={`${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    )
}

export function LoadingDots() {
    return (
        <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

export function LoadingPulse() {
    return (
        <div className="flex items-center justify-center">
            <motion.div
                className="h-12 w-12 rounded-full bg-primary/20"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <motion.div
                    className="h-full w-full rounded-full bg-primary/40"
                    animate={{
                        scale: [1, 0.8, 1],
                        opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.div>
        </div>
    )
}

export function LoadingPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <motion.p
                    className="text-muted-foreground text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    Loading...
                </motion.p>
            </div>
        </div>
    )
}
