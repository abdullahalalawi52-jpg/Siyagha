import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  label?: React.ReactNode;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, id }) => {
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
    <div className="space-y-1.5 relative text-start" ref={wrapperRef}>
      {label && <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">{label}</div>}
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border-gray-200 dark:border-slate-700 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-brown-500 dark:focus:ring-brown-400 bg-white dark:bg-slate-800 font-medium text-gray-700 dark:text-gray-100 outline-none transition-all"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedOption?.icon && React.createElement(selectedOption.icon, { className: "w-4 h-4 text-gray-500 shrink-0" })}
          <span className="truncate text-start block w-full">{selectedOption?.label}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-500 shrink-0 mr-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{opacity: 0, y: -5}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -5}} transition={{duration: 0.15}}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-start hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${value === opt.value ? 'bg-brown-50 dark:bg-brown-900/40 text-brown-700 dark:text-brown-400 font-bold' : 'text-gray-700 dark:text-gray-300 font-medium'} flex-1 min-w-0`}
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
