"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, X } from "lucide-react";
import { TrumpLiarCounter } from "./TrumpLiarCounter";

export function TrumpLiarOverlay() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <motion.button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-4 right-4 z-50 rounded-full bg-[#FFD500] px-5 py-4 text-sm font-black uppercase text-[#003B70] shadow-2xl active:scale-95"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
        <span className="flex items-center gap-2">
          <Vote size={18} />
          Lügner zählen
        </span>
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-[100] overflow-y-auto bg-[#003B70]/95 p-4 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="fixed right-4 top-4 z-[110] rounded-full bg-white p-3 text-[#003B70] shadow-xl active:scale-95"
                            aria-label="Overlay schließen"
                        >
                            <X />
                        </button>

                        <div className="flex min-h-full items-center justify-center py-10">
                            <div className="w-full max-w-lg">
                                <TrumpLiarCounter compact />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}