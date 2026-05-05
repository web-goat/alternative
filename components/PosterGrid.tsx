"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Poster = {
    src: string;
    title: string;
};

const slogans = [
    "Wir fragen nur. Die Antwort ist trotzdem nein.",
    "Für alle, die Demokratie nicht als DLC sehen.",
    "Heimatliebe ohne Hass-Abo.",
    "Klare Kante, aber mit Ironie.",
    "Wir sind neutral. Gegen Unsinn.",
    "Für einfache Antworten haben wir leider zu viel gelesen.",
    "Kein Rechtsruck. Nur Rückgrat.",
    "Satire mit Sicherheitsabstand nach rechts.",
    "Wir schieben nur schlechte Ideen ab.",
    "Alternative? Ja. Für Menschenverstand.",
    "Demokratie. Leider geil.",
    "Gegen Hass hilft Bildung. Nervig, aber wahr.",
    "Nicht linksgrün versifft. Nur sauber geblieben.",
    "Für Vielfalt. Schockierend normal.",
];

function getRandomSlogan() {
    return slogans[Math.floor(Math.random() * slogans.length)];
}

export function PosterGrid({ posters }: { posters: Poster[] }) {
    const [posterSlogans, setPosterSlogans] = useState<Record<string, string>>({});

    useEffect(() => {
        const nextSlogans = posters.reduce<Record<string, string>>((acc, poster) => {
            acc[poster.src] = getRandomSlogan();
            return acc;
        }, {});

        setPosterSlogans(nextSlogans);
    }, [posters]);

    return (
        <section className="px-4 py-16">
            <div className="mx-auto max-w-6xl">
                <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl font-black uppercase leading-none sm:text-6xl"
                >
                    Kampagnen mit Haltung.
                    <span className="block text-[#FFD500]">Richtung offen.</span>
                </motion.h2>

                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {posters.map((poster, index) => (
                        <motion.article
                            key={poster.src}
                            initial={{ opacity: 0, y: 40, rotate: index % 2 ? 1 : -1 }}
                            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.03, rotate: index % 2 ? -1 : 1 }}
                            className="overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl"
                        >
                            <div className="relative aspect-square w-full overflow-hidden">
                                <img
                                    src={poster.src}
                                    alt={poster.title}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />

                                <div className="absolute bottom-0 left-0 right-0 flex min-h-[58px] items-center bg-[#E30613] px-4 py-3">
                                    <p className="line-clamp-2 text-sm font-black uppercase leading-tight text-white sm:text-base">
                                        {posterSlogans[poster.src] ?? "Demokratie lädt..."}
                                    </p>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}