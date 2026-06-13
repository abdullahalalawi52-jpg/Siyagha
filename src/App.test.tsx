import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// We need to mock matchMedia since jsdom doesn't support it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

describe('App Component', () => {
  it('renders the main title correctly', () => {
    render(<App />);
    expect(screen.getByText('منشئ الخطابات')).toBeInTheDocument();
  });

  it('contains the sender input field', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/اسمك أو اسم المؤسسة/i)).toBeInTheDocument();
  });
});
