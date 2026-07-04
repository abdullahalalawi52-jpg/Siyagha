import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { UIProvider, useUI } from '../contexts/UIContext';

const TestThemeToggleComponent: React.FC = () => {
  const { darkMode, toggleDarkMode } = useUI();
  return (
    <div>
      <span data-testid="theme-status">{darkMode ? 'dark' : 'light'}</span>
      <button data-testid="toggle-btn" onClick={toggleDarkMode}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('Dark Mode Functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should initialize theme correctly and support theme toggling', () => {
    render(
      <UIProvider>
        <TestThemeToggleComponent />
      </UIProvider>
    );

    const toggleBtn = screen.getByTestId('toggle-btn');
    const status = screen.getByTestId('theme-status');

    // Initial state check
    const isDarkInitially = document.documentElement.classList.contains('dark');
    expect(status.textContent).toBe(isDarkInitially ? 'dark' : 'light');

    // Toggle theme
    fireEvent.click(toggleBtn);

    // Verify dark class toggled on document.documentElement
    expect(document.documentElement.classList.contains('dark')).toBe(!isDarkInitially);
    expect(status.textContent).toBe(!isDarkInitially ? 'dark' : 'light');

    // Verify persistence in localStorage using key 'theme'
    expect(localStorage.getItem('theme')).toBe(!isDarkInitially ? 'dark' : 'light');
  });
});
