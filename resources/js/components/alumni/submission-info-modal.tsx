import { AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

import { BrandLogos } from '@/components/brand-logos';

interface SubmissionInfoModalProps {
    title: string;
    message: string;
    onClose: () => void;
}

export function SubmissionInfoModal({ title, message, onClose }: SubmissionInfoModalProps) {
    return (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center gap-3 bg-[#1A5336] px-6 py-5">
                    <BrandLogos size="md" />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-white" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                            {title}
                        </h2>
                        <p className="text-sm text-white/80">Registration could not be completed</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-white/70 transition-colors hover:text-white" type="button">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-amber-600" />
                        <p className="text-sm leading-relaxed text-gray-700">{message}</p>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-[#1A5336] px-6 py-3 text-white shadow-sm transition-colors hover:bg-[#134026]"
                    >
                        OK, Review My Information
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
