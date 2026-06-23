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
  } = useApp();

  const handleClose = () => setIsSigningOpen(false);

  const modalRef = useModalAccessibility(isSigningOpen, handleClose);

  return (
    <AnimatePresence>
      {isSigningOpen && (
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
            aria-labelledby="signature-modal-title"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden text-right"
            dir="rtl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 id="signature-modal-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-brown-600" />
                  رسم توقيعك الإلكتروني
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
                  aria-label="منطقة رسم التوقيع"
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  مسح لوحة الرسم
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSigningOpen(false)}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="text-xs font-bold bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    حفظ التوقيع
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignatureModal;
