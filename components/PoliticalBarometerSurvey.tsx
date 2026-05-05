"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { X, RotateCcw, BarChart3 } from "lucide-react";
import { db } from "@/lib/firebase";

type Answer = "yes" | "no" | "unsure";

type Question = {
    text: string;
    context: string;
    yes: number;
    no: number;
};

const QUESTIONS: Question[] = [
    {
        text: "Fühlst du dich in Deutschland grundsätzlich sicher und willkommen?",
        context: "Also nicht perfekt, aber im Alltag eher stabil als verloren.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte Politik Menschen eher verbinden, statt Gruppen gegeneinander auszuspielen?",
        context: "Klingt kitschig. Funktioniert aber besser als Dauerfeuer im Kommentarbereich.",
        yes: -1,
        no: 1,
    },
    {
        text: "Wenn jemand hier arbeitet, Steuern zahlt und Teil des Alltags ist: Sollte Herkunft dann zweitrangig sein?",
        context: "Zum Beispiel in Pflege, Handwerk, Gastro, IT oder Logistik.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollten Menschen individuell beurteilt werden, statt nach Herkunft, Namen oder Aussehen?",
        context: "Radikale Idee: Menschen als Menschen betrachten.",
        yes: -1,
        no: 1,
    },
    {
        text: "Wenn Krankenhäuser ohne ausländische Fachkräfte schlechter laufen würden: Sollte man Zuwanderung differenzierter sehen?",
        context: "Pflege und Medizin sind nicht gerade Nebenquests.",
        yes: -1,
        no: 1,
    },
    {
        text: "Würdest du höhere Preise und längere Wartezeiten akzeptieren, wenn dadurch deutlich weniger Menschen einwandern?",
        context: "Weniger Arbeitskräfte heißt oft: weniger Angebot, mehr Kosten.",
        yes: 1,
        no: -1,
    },
    {
        text: "Sollte kriminelles Verhalten unabhängig von Herkunft gleich streng bewertet werden?",
        context: "Straftat ist Straftat. Herkunft ist keine automatische Beweisführung.",
        yes: -1,
        no: 1,
    },
    {
        text: "Findest du, viele politische Probleme werden zu einfach erklärt?",
        context: "Wenn eine Lösung auf einen Bierdeckel passt, ist sie manchmal nur ein Bierdeckel.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte Integration eher durch Sprache, Arbeit und Chancen gelingen als durch Ausgrenzung?",
        context: "Menschen integrieren sich selten besser, wenn man ihnen permanent sagt, dass sie stören.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte der Staat Rechtsextremismus klar bekämpfen?",
        context: "Demokratie ist kein Selbstläufer. Leider kein automatisches Update.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollten queere Menschen offen und sicher leben können?",
        context: "Nicht als Sonderrecht. Einfach als Alltag ohne Drama-Abo.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte Klimaschutz ernst genommen werden, auch wenn Maßnahmen manchmal unbequem sind?",
        context: "Physik diskutiert leider nicht auf Stammtischniveau.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte Sozialbetrug bekämpft werden, ohne Bedürftige pauschal zu verdächtigen?",
        context: "Kontrolle ja. Menschenverachtung eher nein.",
        yes: -1,
        no: 1,
    },
    {
        text: "Ist dir wichtiger, welche Werte jemand lebt, als woher seine Familie ursprünglich kommt?",
        context: "Anstand hat erstaunlicherweise keinen Reisepass.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte gute Politik Probleme lösen, ohne Sündenböcke zu sammeln?",
        context: "Kompliziert, aber vermutlich gesünder als Dauerwut.",
        yes: -1,
        no: 1,
    },
];

const RESULT_TEXTS = {
    left: {
        title: "Eher offen / progressiv",
        text: "Du wirkst eher solidarisch, differenziert und menschenorientiert. Also gefährlich nah an: Probleme lösen statt Menschen sortieren.",
    },
    center: {
        title: "Eher Mitte",
        text: "Du wirkst gemischt: offen, aber auch vorsichtig. Politisch ungefähr da, wo Familienfeiern noch knapp überleben.",
    },
    right: {
        title: "Eher konservativ / rechts",
        text: "Du wirkst eher ordnungs- und abgrenzungsorientiert. Vielleicht lohnt sich ein zweiter Blick darauf, wen manche einfachen Antworten am Ende treffen.",
    },
};

function getResult(score: number) {
    if (score <= -5) return "left";
    if (score >= 5) return "right";
    return "center";
}

function getPercent(score: number) {
    return Math.min(100, Math.max(0, ((score + 15) / 30) * 100));
}

type PoliticalBarometerSurveyProps = {
    enabled: boolean;
};

export function PoliticalBarometerSurvey({ enabled }: PoliticalBarometerSurveyProps) {
    const [open, setOpen] = useState(enabled);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [saving, setSaving] = useState(false);

    if (enabled && !open && answers.length === 0) {
        setOpen(true);
    }

    const finished = answers.length === QUESTIONS.length;

    const score = useMemo(() => {
        return answers.reduce((total, answer, index) => {
            const question = QUESTIONS[index];
            if (answer === "yes") return total + question.yes;
            if (answer === "no") return total + question.no;
            return total;
        }, 0);
    }, [answers]);

    const resultKey = getResult(score);
    const result = RESULT_TEXTS[resultKey];
    const percent = getPercent(score);
    const currentQuestion = QUESTIONS[step];

    const answerQuestion = async (answer: Answer) => {
        const nextAnswers = [...answers, answer];
        setAnswers(nextAnswers);

        if (step < QUESTIONS.length - 1) {
            setStep((prev) => prev + 1);
            return;
        }

        const finalScore = nextAnswers.reduce((total, item, index) => {
            const question = QUESTIONS[index];
            if (item === "yes") return total + question.yes;
            if (item === "no") return total + question.no;
            return total;
        }, 0);

        setSaving(true);

        try {
            await addDoc(collection(db, "surveyResults"), {
                score: finalScore,
                result: getResult(finalScore),
                answers: nextAnswers,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Survey save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const restart = () => {
        setStep(0);
        setAnswers([]);
        setOpen(true);
    };

    if (!enabled) return null;

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-5 left-5 z-[9999] inline-flex items-center gap-2 rounded-full bg-[#FFD500] px-4 py-3 text-sm font-black uppercase text-[#003B70] shadow-2xl"
            >
                <BarChart3 size={18} />
                Umfrage
            </button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex items-end bg-black/70 px-3 pb-3 pt-10 backdrop-blur sm:items-center sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ y: 80, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 80, scale: 0.96 }}
                    className="mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border-4 border-white bg-[#003B70] text-white shadow-2xl"
                >
                    <div className="flex items-center justify-between bg-[#E30613] px-5 py-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD500]">
                                kurzer Realitätsabgleich
                            </p>
                            <h2 className="text-2xl font-black uppercase leading-none">
                                Wie fühlst du dich in Deutschland?
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full bg-white/15 p-2 text-white"
                            aria-label="Umfrage schließen"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {!finished ? (
                        <div className="p-5 sm:p-7">
                            <div className="mb-6">
                                <div className="mb-2 flex justify-between text-xs font-black uppercase text-white/70">
                  <span>
                    Frage {step + 1} / {QUESTIONS.length}
                  </span>
                                    <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full rounded-full bg-[#FFD500] transition-all"
                                        style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black leading-tight sm:text-3xl">
                                {currentQuestion.text}
                            </h3>

                            <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-bold leading-relaxed text-white/85">
                                {currentQuestion.context}
                            </p>

                            <div className="mt-7 grid gap-3">
                                <button onClick={() => answerQuestion("yes")} className="rounded-2xl bg-[#FFD500] px-5 py-4 text-left text-lg font-black uppercase text-[#003B70]">
                                    Ja
                                </button>

                                <button onClick={() => answerQuestion("no")} className="rounded-2xl bg-white px-5 py-4 text-left text-lg font-black uppercase text-[#003B70]">
                                    Nein
                                </button>

                                <button onClick={() => answerQuestion("unsure")} className="rounded-2xl border-2 border-white/30 bg-white/10 px-5 py-4 text-left text-lg font-black uppercase text-white">
                                    Weiß nicht
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 sm:p-7">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD500]">
                                Dein Barometer
                            </p>

                            <h3 className="mt-3 text-4xl font-black uppercase leading-none">
                                {result.title}
                            </h3>

                            <p className="mt-4 text-base font-bold leading-relaxed text-white/85">
                                {result.text}
                            </p>

                            <div className="mt-8 rounded-3xl bg-white p-5 text-[#003B70]">
                                <div className="mb-3 flex justify-between text-xs font-black uppercase">
                                    <span>Offen</span>
                                    <span>Mitte</span>
                                    <span>Rechts</span>
                                </div>

                                <div className="relative h-5 rounded-full bg-gradient-to-r from-[#009EE0] via-[#FFD500] to-[#E30613]">
                                    <motion.div
                                        initial={{ left: "50%" }}
                                        animate={{ left: `${percent}%` }}
                                        className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[#003B70] shadow-xl"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <button onClick={restart} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black uppercase text-[#003B70]">
                                    <RotateCcw size={20} />
                                    Nochmal
                                </button>

                                <button onClick={() => setOpen(false)} className="rounded-2xl bg-[#FFD500] px-5 py-4 font-black uppercase text-[#003B70]">
                                    {saving ? "Speichert..." : "Schließen"}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}