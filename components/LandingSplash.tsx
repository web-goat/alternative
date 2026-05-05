"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type ArrowPosition = {
    x: number;
    y: number;
    x2: number;
    y2: number;
    rotate: number;
    scale: number;
    duration: number;
};

export function LandingSplash() {
    const [positions, setPositions] = useState<ArrowPosition[]>([]);

    useEffect(() => {
        setPositions(
            Array.from({ length: 34 }).map(() => ({
                x: Math.random() * 120 - 60,
                y: Math.random() * 120 - 60,
                x2: Math.random() * 120 - 60,
                y2: Math.random() * 120 - 60,
                rotate: Math.random() * 360,
                scale: 0.7 + Math.random() * 2.4,
                duration: 7 + Math.random() * 10,
            }))
        );
    }, []);

    return (
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#003B70] px-4 py-12 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#009EE088,transparent_42%)]" />

            {positions.map((pos, i) => (
                <motion.div
                    key={i}
                    className="absolute text-[#E30613]/70"
                    initial={{
                        x: `${pos.x}vw`,
                        y: `${pos.y}vh`,
                        rotate: pos.rotate,
                        scale: pos.scale,
                        opacity: 0,
                    }}
                    animate={{
                        x: [`${pos.x}vw`, `${pos.x2}vw`, `${pos.x}vw`],
                        y: [`${pos.y}vh`, `${pos.y2}vh`, `${pos.y}vh`],
                        rotate: [pos.rotate, pos.rotate + 180, pos.rotate + 360],
                        opacity: [0, 0.75, 0.45],
                    }}
                    transition={{
                        duration: pos.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <ArrowUpRight size={90} strokeWidth={4} />
                </motion.div>
            ))}

            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-[#FFD500]"
                >
                    emotional geprüft · objektiv gefühlt
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 120 }}
                    className="text-5xl font-black uppercase leading-none sm:text-8xl"
                >
                    Alternative
                    <span className="block text-[#FFD500]">Alternative</span>
                    <span className="block">für alles.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mx-auto mt-6 max-w-xl text-lg font-bold text-white/90"
                >
                    Einfache Antworten. Komplizierte Folgen.
                </motion.p>
            </div>
        </section>
    );
}