"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <div className="text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="flex justify-center mb-4"
                        >
                            <div className="p-4 rounded-full bg-primary/10">
                                <GraduationCap className="h-12 w-12 text-primary" />
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-2xl lg:text-5xl font-bold tracking-tight text-foreground"
                        >
                            Brototype Help
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-muted-foreground mt-2 text-sm lg:text-xl font-medium"
                        >
                            Student Complaint Portal
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
