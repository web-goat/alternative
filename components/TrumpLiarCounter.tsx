"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    doc,
    increment,
    onSnapshot,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { AlertTriangle, MousePointerClick } from "lucide-react";
import { db } from "@/lib/firebase";

const STORAGE_KEY = "trump-liar-voted";

type TrumpLiarCounterProps = {
    compact?: boolean;
};

export function TrumpLiarCounter({ compact = false }: TrumpLiarCounterProps) {
    const [count, setCount] = useState(0);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [errorText, setErrorText] = useState("");

    useEffect(() => {
        setHasVoted(localStorage.getItem(STORAGE_KEY) === "true");

        const counterRef = doc(db, "counters", "trump-liar");

        const unsubscribe = onSnapshot(
            counterRef,
            (snapshot) => {
                setCount(snapshot.exists() ? snapshot.data().count ?? 0 : 0);
                setLoading(false);
            },
            (error) => {
                console.error("Firestore snapshot error:", error);
                setErrorText("Counter konnte nicht geladen werden.");
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleVote = async () => {
        if (hasVoted || voting) return;

        setVoting(true);
        setErrorText("");

        try {
            const counterRef = doc(db, "counters", "trump-liar");

            await setDoc(
                counterRef,
                {
                    count: increment(1),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            localStorage.setItem(STORAGE_KEY, "true");
            setHasVoted(true);
        } catch (error) {
            console.error("Vote failed:", error);
            setErrorText("Firebase hat den Klick geblockt. Demokratie.exe angehalten.");
        } finally {
            setVoting(false);
        }
    };

    return (
        <section
            className={
                compact
                    ? "text-white"
                    : "relative overflow-hidden bg-[#003B70] px-4 py-16 text-white sm:px-6"
            }
        >
            {!compact && (
                <div className="absolute -right-20 top-10 h-48 w-48 rounded-full border-[32px] border-[#E30613]/60 sm:h-72 sm:w-72" />
            )}

            <div className="relative mx-auto max-w-4xl rounded-[2rem] border-4 border-white/20 bg-[#009EE0] p-5 shadow-2xl sm:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E30613] shadow-xl">
                        <AlertTriangle size={32} />
                    </div>

                    <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#FFD500] sm:text-sm">
                        Bürgerzählung emotional geprüft
                    </p>

                    <h2 className="text-4xl font-black uppercase leading-none sm:text-6xl">
                        Ist Trump ein Lügner?
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-base font-bold text-white/90 sm:text-xl">
                        Stimme einmal ab. Mehrfach klicken wäre unfair. Also quasi Politik,
                        aber mit Regeln.
                    </p>

                    <motion.div
                        key={count}
                        initial={{ scale: 0.9, rotate: -1 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="my-8 rounded-3xl bg-white px-6 py-8 text-[#003B70] shadow-2xl"
                    >
                        <p className="text-sm font-black uppercase tracking-widest">
                            Aktueller Stand
                        </p>

                        <p className="mt-2 text-6xl font-black sm:text-8xl">
                            {loading ? "…" : count.toLocaleString("de-DE")}
                        </p>

                        <p className="mt-2 font-bold uppercase text-[#E30613]">
                            Menschen haben geklickt
                        </p>
                    </motion.div>

                    <button
                        type="button"
                        onClick={handleVote}
                        disabled={hasVoted || voting || loading}
                        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#FFD500] px-6 py-5 text-lg font-black uppercase text-[#003B70] shadow-xl transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        <MousePointerClick size={22} />
                        {hasVoted ? "Du hast abgestimmt" : voting ? "Zähle..." : "Ja, natürlich"}
                    </button>

                    {errorText && (
                        <p className="mt-4 rounded-xl bg-[#E30613] px-4 py-3 text-sm font-black uppercase text-white">
                            {errorText}
                        </p>
                    )}

                    <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/70">
                        Ein Klick pro Gerät. Demokratie im LocalStorage.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}