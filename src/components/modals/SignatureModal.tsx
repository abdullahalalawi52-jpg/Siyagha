import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

export const SignatureModal: React.FC = () => {
  const {
    isSigningOpen,
    setIsSigningOpen,
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    saveSignature,
    appLang,
    t,
  } = useApp();

  const handleClose = () => setIsSigningOpen(false);

  const modalRef = useModalAccessibility(isSigningOpen, handleClose);

  return (
    <AnimatePresence>
      {isSigningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signature-modal-title"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden text-start z-10"
            dir={appLang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 id="signature-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-brown-600" />
                  {t('رسم توقيعك الإلكتروني', 'Draw Your Digital Signature')}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                  type="button"
                  aria-label={t('إغلاق النافذة', 'Close window')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair bg-white"
                  aria-label={t('منطقة رسم التوقيع', 'Signature drawing area')}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {t('مسح لوحة الرسم', 'Clear canvas')}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSigningOpen(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="text-xs font-bold bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    {t('حفظ التوقيع', 'Save Signature')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignatureModal;
