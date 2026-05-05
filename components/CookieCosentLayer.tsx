"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_KEY = "aafd-consent";

type CookieConsentLayerProps = {
    onAccept: () => void;
};

export function CookieConsentLayer({ onAccept }: CookieConsentLayerProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(CONSENT_KEY);

        if (consent === "accepted") {
            onAccept();
            return;
        }

        setVisible(true);
    }, [onAccept]);

    const accept = () => {
        localStorage.setItem(CONSENT_KEY, "accepted");
        setVisible(false);
        onAccept();
    };

    const decline = () => {
        localStorage.setItem(CONSENT_KEY, "declined");
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[10000] flex items-end bg-black/70 px-3 pb-3 backdrop-blur sm:items-center sm:p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ y: 80, scale: 0.96 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: 80, scale: 0.96 }}
                        className="mx-auto w-full max-w-lg rounded-[2rem] border-4 border-white bg-[#003B70] p-5 text-white shadow-2xl sm:p-7"
                    >
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD500]">
                            Kleiner Datenkeks
                        </p>

                        <h2 className="mt-3 text-3xl font-black uppercase leading-none">
                            Bevor wir fragen:
                        </h2>

                        <p className="mt-4 text-sm font-bold leading-relaxed text-white/85">
                            Diese Seite nutzt lokale Speicherung und Firebase, um anonyme
                            Umfrage-Ergebnisse zu speichern. Keine Namen, keine Accounts,
                            kein Tracking-Zirkus mit Aluhut-Geschmack.
                        </p>

                        <p className="mt-3 rounded-2xl bg-white/10 p-4 text-xs font-bold leading-relaxed text-white/75">
                            Hinweis: Politische Einschätzungen können sensible Daten sein.
                            Deshalb speichern wir die Umfrage nur, wenn du zustimmst.
                        </p>

                        <div className="mt-6 grid gap-3">
                            <button
                                type="button"
                                onClick={accept}
                                className="rounded-2xl bg-[#FFD500] px-5 py-4 text-lg font-black uppercase text-[#003B70] shadow-xl active:scale-[0.98]"
                            >
                                Akzeptieren & starten
                            </button>

                            <button
                                type="button"
                                onClick={decline}
                                className="rounded-2xl border-2 border-white/30 bg-white/10 px-5 py-4 text-lg font-black uppercase text-white active:scale-[0.98]"
                            >
                                Ablehnen
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}