// components/InstagramCTA.tsx

import {ExternalLink} from "lucide-react";

export function InstagramCTA() {
    return (
        <section className="px-4 py-16">
            <div className="mx-auto max-w-3xl rounded-[2rem] border-4 border-white bg-[#E30613] p-6 text-center shadow-2xl">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FFD500]">
                    Folge der Verwirrung
                </p>

                <h2 className="mt-4 text-4xl font-black uppercase leading-none sm:text-6xl">
                    Mehr klare Aussagen.
                    <span className="block text-[#FFD500]">Weniger Klarheit.</span>
                </h2>

                <a
                    href="https://www.instagram.com/alternativealternativefd/"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 font-black uppercase text-[#003B70] shadow-xl transition active:scale-95"
                >
                    <ExternalLink />
                    Zu Instagram
                </a>
            </div>
        </section>
    );
}