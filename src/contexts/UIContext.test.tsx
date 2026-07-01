import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { UIProvider, useUI } from './UIContext';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  }),
});

const UIHelperComponent = () => {
  const { appLang, setAppLang, darkMode, toggleDarkMode, toasts, addToast, removeToast } = useUI();
  return (
    <div>
      <div data-testid="lang">{appLang}</div>
      <div data-testid="theme">{darkMode ? 'dark' : 'light'}</div>
      <button onClick={() => setAppLang('en')} data-testid="btn-en">Set English</button>
      <button onClick={toggleDarkMode} data-testid="btn-theme">Toggle Theme</button>
      <button onClick={() => addToast('Test Notification', 'success')} data-testid="btn-toast">Add Toast</button>
      <div data-testid="toasts-list">
        {toasts.map((t) => (
          <div key={t.id} data-testid={`toast-${t.type}`}>
            {t.message}
            <button onClick={() => removeToast(t.id)} data-testid={`close-${t.id}`}>X</button>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('UIContext & Provider', () => {
  it('should initialize with default Arabic language and light theme', () => {
    render(
      <UIProvider>
        <UIHelperComponent />
      </UIProvider>
    );

    expect(screen.getByTestId('lang').textContent).toBe('ar');
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('should change application language to English', () => {
    render(
      <UIProvider>
        <UIHelperComponent />
      </UIProvider>
    );

    fireEvent.click(screen.getByTestId('btn-en'));
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('should toggle dark mode and update classList on documentElement', () => {
    render(
      <UIProvider>
        <UIHelperComponent />
      </UIProvider>
    );

    const toggleBtn = screen.getByTestId('btn-theme');
    
    // Toggle to Dark Mode
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Toggle back to Light Mode
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should add and remove toast notifications correctly', () => {
    render(
      <UIProvider>
        <UIHelperComponent />
      </UIProvider>
    );

    const toastBtn = screen.getByTestId('btn-toast');
    fireEvent.click(toastBtn);

    expect(screen.getAllByText('Test Notification')[0]).toBeInTheDocument();
    expect(screen.getByTestId('toast-success')).toBeInTheDocument();
  });
});
