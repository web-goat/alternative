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
        text: "Sollten Menschen, die hier arbeiten, Steuern zahlen und Teil des Alltags sind, grundsätzlich bleiben dürfen?",
        context: "Zum Beispiel Pflegekräfte, Handwerker, Paketfahrer oder Kolleginnen im Büro.",
        yes: -1,
        no: 1,
    },
    {
        text: "Wenn Krankenhäuser ohne ausländische Fachkräfte schlechter funktionieren würden: Sollte man Zuwanderung dann differenzierter betrachten?",
        context: "Pflege, Medizin und Altenbetreuung hängen in vielen Regionen stark an Arbeitskräften mit Migrationsgeschichte.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte kriminelles Verhalten individuell bewertet werden, statt ganze Gruppen unter Generalverdacht zu stellen?",
        context: "Also: Straftat ist Straftat — aber Herkunft ist nicht automatisch Schuld.",
        yes: -1,
        no: 1,
    },
    {
        text: "Ist dir wichtiger, wie sich ein Mensch verhält, als woher seine Familie ursprünglich kommt?",
        context: "Klingt banal. Ist politisch aber offenbar Raketenwissenschaft.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte Deutschland gezielt Fachkräfte aus dem Ausland anwerben, wenn bestimmte Berufe sonst unbesetzt bleiben?",
        context: "Zum Beispiel Pflege, IT, Handwerk, Logistik oder Gastronomie.",
        yes: -1,
        no: 1,
    },
    {
        text: "Würdest du höhere Preise und längere Wartezeiten akzeptieren, wenn dadurch deutlich weniger Menschen einwandern?",
        context: "Weniger Arbeitskräfte bedeutet oft: weniger Angebot, mehr Kosten, längere Wartezeiten.",
        yes: 1,
        no: -1,
    },
    {
        text: "Sollte Integration eher über Sprache, Arbeit und Chancen funktionieren als über Ausgrenzung?",
        context: "Menschen integrieren sich selten besser, wenn man ihnen permanent sagt, dass sie nicht dazugehören.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte der Staat stärker gegen Rechtsextremismus vorgehen?",
        context: "Demokratie ist kein Selbstläufer. Leider kein automatisches Windows-Update.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollten Menschen unabhängig von Herkunft, Religion oder Aussehen gleich respektvoll behandelt werden?",
        context: "Wildes Konzept, nennt sich Menschenwürde.",
        yes: -1,
        no: 1,
    },
    {
        text: "Findest du, politische Probleme werden oft zu stark vereinfacht?",
        context: "Zum Beispiel: 'Die da sind schuld' klingt einfach, löst aber meistens exakt gar nichts.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte man Sozialbetrug bekämpfen, ohne dabei alle Bedürftigen pauschal zu verdächtigen?",
        context: "Kontrolle ja. Menschenverachtung eher so mittelgeil.",
        yes: -1,
        no: 1,
    },
    {
        text: "Sollte Klimaschutz ernst genommen werden, auch wenn Maßnahmen manchmal unbequem sind?",
        context: "Physik ist leider nicht beleidigt genug, um sich abwählen zu lassen.",
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
        text: "Sollte demokratische Politik Kompromisse suchen, statt Gegner nur noch als Feinde zu behandeln?",
        context: "Demokratie ist anstrengend. Genau deshalb ist sie besser als Gebrüll.",
        yes: -1,
        no: 1,
    },
    {
        text: "Würdest du sagen: Gute Politik erkennt Probleme an, ohne Menschengruppen dafür verantwortlich zu machen?",
        context: "Probleme lösen > Sündenböcke sammeln.",
        yes: -1,
        no: 1,
    },
];

const RESULT_TEXTS = {
    left: {
        title: "Eher links / progressiv",
        text: "Du wirkst eher solidarisch, offen und lösungsorientiert. Kurz: vermutlich nicht der Albtraum jeder Kommentarspalte.",
    },
    center: {
        title: "Eher Mitte",
        text: "Du wirkst gemischt: teils offen, teils vorsichtig. Also politisch ungefähr da, wo Familienfeiern noch nicht komplett eskalieren.",
    },
    right: {
        title: "Eher rechts / konservativ",
        text: "Du wirkst eher ordnungs- und abgrenzungsorientiert. Vielleicht lohnt sich ein zweiter Blick auf die realen Folgen mancher Forderungen.",
    },
};

function getResult(score: number) {
    if (score <= -5) return "left";
    if (score >= 5) return "right";
    return "center";
}

function getPercent(score: number) {
    const min = -15;
    const max = 15;
    return Math.min(100, Math.max(0, ((score - min) / (max - min)) * 100));
}

export function PoliticalBarometerSurvey() {
    const [open, setOpen] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [saving, setSaving] = useState(false);

    const finished = answers.length === QUESTIONS.length;

    const score = useMemo(() => {
        return answers.reduce((total, answer, index) => {
            const question = QUESTIONS[index];
            if (!question) return total;
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
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#FFD500] px-4 py-3 text-sm font-black uppercase text-[#003B70] shadow-2xl"
            >
                <BarChart3 size={18} />
                Barometer
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
                                politisches Bauchgefühl
                            </p>
                            <h2 className="text-2xl font-black uppercase leading-none">
                                Mini-Barometer
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
                            aria-label="Umfrage schließen"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {!finished ? (
                        <div className="p-5 sm:p-7">
                            <div className="mb-6">
                                <div className="mb-2 flex items-center justify-between text-xs font-black uppercase text-white/70">
                  <span>
                    Frage {step + 1} / {QUESTIONS.length}
                  </span>
                                    <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                                    <div
                                        className="h-full rounded-full bg-[#FFD500] transition-all"
                                        style={{
                                            width: `${((step + 1) / QUESTIONS.length) * 100}%`,
                                        }}
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
                                <button
                                    type="button"
                                    onClick={() => answerQuestion("yes")}
                                    className="rounded-2xl bg-[#FFD500] px-5 py-4 text-left text-lg font-black uppercase text-[#003B70] shadow-xl transition active:scale-[0.98]"
                                >
                                    Ja
                                </button>

                                <button
                                    type="button"
                                    onClick={() => answerQuestion("no")}
                                    className="rounded-2xl bg-white px-5 py-4 text-left text-lg font-black uppercase text-[#003B70] shadow-xl transition active:scale-[0.98]"
                                >
                                    Nein
                                </button>

                                <button
                                    type="button"
                                    onClick={() => answerQuestion("unsure")}
                                    className="rounded-2xl border-2 border-white/30 bg-white/10 px-5 py-4 text-left text-lg font-black uppercase text-white transition active:scale-[0.98]"
                                >
                                    Weiß nicht
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 sm:p-7">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD500]">
                                Ergebnis
                            </p>

                            <h3 className="mt-3 text-4xl font-black uppercase leading-none">
                                {result.title}
                            </h3>

                            <p className="mt-4 text-base font-bold leading-relaxed text-white/85">
                                {result.text}
                            </p>

                            <div className="mt-8 rounded-3xl bg-white p-5 text-[#003B70]">
                                <div className="mb-3 flex justify-between text-xs font-black uppercase">
                                    <span>Links</span>
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

                                <p className="mt-5 text-center text-sm font-black uppercase">
                                    Score: {score}
                                </p>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={restart}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black uppercase text-[#003B70]"
                                >
                                    <RotateCcw size={20} />
                                    Nochmal
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="rounded-2xl bg-[#FFD500] px-5 py-4 font-black uppercase text-[#003B70]"
                                >
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