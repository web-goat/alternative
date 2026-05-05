"use client";

import { motion } from "framer-motion";

type Poster = {
    src: string;
    title: string;
};

export function PosterGrid({ posters }: { posters: Poster[] }) {
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
                            <img
                                src={poster.src}
                                alt={poster.title}
                                className="aspect-square w-full object-cover"
                                loading="lazy"
                            />

                            <div className="bg-[#E30613] p-4">
                                <h3 className="truncate font-black uppercase text-white">
                                    {poster.title}
                                </h3>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}