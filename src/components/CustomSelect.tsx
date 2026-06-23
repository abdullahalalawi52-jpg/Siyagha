import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  label: string;
  value: string;
  icon?: any;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  label?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative text-right" ref={wrapperRef}>
      {label && <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{label}</div>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border-gray-200 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 bg-white font-medium text-gray-700 outline-none transition-all"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && React.createElement(selectedOption.icon, { className: "w-4 h-4 text-gray-500 shrink-0" })}
          <span className="truncate text-right block w-full">{selectedOption?.label}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-500 shrink-0 mr-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{opacity: 0, y: -5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5}} transition={{duration: 0.15}}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-right hover:bg-gray-50 transition-colors ${value === opt.value ? 'bg-brown-50 text-brown-700 font-bold' : 'text-gray-700 font-medium'} flex-1 min-w-0`}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.icon && React.createElement(opt.icon, { className: `w-4 h-4 shrink-0 ${value === opt.value ? 'text-brown-600' : 'text-gray-400'}` })}
                <span className="truncate block w-full">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
