import { useEffect, useRef } from 'react';

export const useModalAccessibility = (isOpen: boolean, onClose: () => void) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Handle escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Trap focus inside modal
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modalElement = modalRef.current;
    
    let firstFocusableElement: HTMLElement | null = null;
    let lastFocusableElement: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout>;

    if (modalElement) {
      const focusableContent = modalElement.querySelectorAll(focusableElementsString);
      const focusableElements = Array.from(focusableContent) as HTMLElement[];

      if (focusableElements.length > 0) {
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        // Focus the first element initially after standard browser mounting delay
        timer = setTimeout(() => {
          firstFocusableElement?.focus();
        }, 50);
      }
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement?.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement?.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  return modalRef;
};

export default useModalAccessibility;
