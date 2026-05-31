import { motion } from 'motion/react';
import { CheckCircle, X, XCircle } from 'lucide-react';

import { BrandLogos } from '@/components/brand-logos';

interface ConsentModalProps {
    onAccept: () => void;
    onDisagree: () => void;
    isSubmitting?: boolean;
}

export function ConsentModal({ onAccept, onDisagree, isSubmitting = false }: ConsentModalProps) {
    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onDisagree}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center gap-3 bg-[#1A5336] px-6 py-5">
                    <BrandLogos size="md" />
                    <div>
                        <h2 className="text-white" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                            Data Privacy Consent
                        </h2>
                        <p className="text-sm text-white/80">Please read carefully before submitting</p>
                    </div>
                    <button onClick={onDisagree} className="ml-auto text-white/70 transition-colors hover:text-white" type="button">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm leading-relaxed text-gray-700">
                            I voluntarily provide my personal, educational, and employment information for inclusion in the
                            Alumni Directory of Carlos Hilado Memorial State University (CHMSU). I hereby give my consent to
                            collect, process, store, and use my data for alumni tracking and institutional purposes, in
                            accordance with data privacy laws.
                        </p>
                        <br />
                        <p className="text-sm leading-relaxed text-gray-700">
                            I understand that my information will be kept confidential and used only for legitimate purposes,
                            and that I have the right to access, correct, or request the removal of my data. By accepting and
                            submitting below, I confirm that the information I provided is true and that I freely give my
                            consent.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row">
                    <button
                        type="button"
                        onClick={onDisagree}
                        disabled={isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-70"
                    >
                        <XCircle size={18} />
                        Disagree
                    </button>
                    <button
                        type="button"
                        onClick={onAccept}
                        disabled={isSubmitting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A5336] px-6 py-3 text-white shadow-sm transition-colors hover:bg-[#134026] disabled:opacity-70"
                    >
                        <CheckCircle size={18} />
                        {isSubmitting ? 'Submitting...' : 'Accept & Submit'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
