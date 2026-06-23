import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Loader2, Check, SpellCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const AiModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    aiPolishing,
    handlePolishLetter,
    isProofreading,
    handleProofread,
    toneLoading,
    toneResult,
    handleAnalyzeTone,
    generatedLetter,
    t,
  } = useApp();

  const handleClose = () => setIsAiModalOpen(false);

  const modalRef = useModalAccessibility(isAiModalOpen, handleClose);

  return (
    <AnimatePresence>
      {isAiModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden text-right"
            dir="rtl"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <h3 id="ai-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brown-600 animate-pulse" />
                  مساعد الذكاء الاصطناعي (AI Assistant)
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-label="إغلاق النافذة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Polish Button */}
                <button
                  onClick={handlePolishLetter}
                  disabled={aiPolishing || isProofreading || toneLoading || !generatedLetter}
                  className="p-4 rounded-xl border border-brown-100 bg-brown-50/50 hover:bg-brown-50 hover:border-brown-300 transition-all text-right flex flex-col gap-2 disabled:opacity-50 cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-brown-100 flex items-center justify-center text-brown-700">
                    {aiPolishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">تحسين الصياغة</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">إعادة كتابة الخطاب بأسلوب أكثر بلاغة واحترافية.</p>
                </button>

                {/* Proofread Button */}
                <button
                  onClick={handleProofread}
                  disabled={aiPolishing || isProofreading || toneLoading || !generatedLetter}
                  className="p-4 rounded-xl border border-brown-100 bg-brown-50/50 hover:bg-brown-50 hover:border-brown-300 transition-all text-right flex flex-col gap-2 disabled:opacity-50 cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-brown-100 flex items-center justify-center text-brown-700">
                    {isProofreading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SpellCheck className="w-4 h-4" />}
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">التدقيق الإملائي</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">تصحيح الأخطاء النحوية والإملائية وتصويب الصياغة.</p>
                </button>

                {/* Tone Analysis Button */}
                <button
                  onClick={handleAnalyzeTone}
                  disabled={aiPolishing || isProofreading || toneLoading || !generatedLetter}
                  className="p-4 rounded-xl border border-brown-100 bg-brown-50/50 hover:bg-brown-50 hover:border-brown-300 transition-all text-right flex flex-col gap-2 disabled:opacity-50 sm:col-span-2 cursor-pointer"
                  type="button"
                >
                  <div className="w-8 h-8 rounded-lg bg-brown-100 flex items-center justify-center text-brown-700">
                    {toneLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <h4 className="font-bold text-sm text-gray-800">تحليل النبرة والأسلوب</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">تحليل مستوى الرسمية وملاءمة نبرة الخطاب مع تقديم اقتراحات للتحسين.</p>
                </button>
              </div>

              {/* Tone Analysis Results Display */}
              <AnimatePresence>
                {toneResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100 pt-4 mt-4 space-y-4"
                  >
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-green-600" />
                      نتائج تحليل الأسلوب والنبرة:
                    </h4>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-600">النبرة العامة:</span>
                        <span className="font-black text-brown-700 bg-brown-50 px-2 py-0.5 rounded-md border border-brown-200">{toneResult.toneName}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-600">مستوى الرسمية:</span>
                          <span className="font-black text-gray-800">{toneResult.formalityScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-brown-600 h-1.5 rounded-full" style={{ width: `${toneResult.formalityScore}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-600 block">ملخص التحليل:</span>
                        <p className="text-xs text-gray-500 leading-relaxed">{toneResult.summary}</p>
                      </div>

                      {toneResult.suggestions && toneResult.suggestions.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
                          <span className="text-xs font-bold text-gray-700 block flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            مقترحات لتحسين الخطاب:
                          </span>
                          <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 pr-1">
                            {toneResult.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx} className="leading-relaxed">{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AiModal;
