import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

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
    expect(screen.getByText('صياغة')).toBeInTheDocument();
  });

  it('contains the sender input field', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/اسمك أو اسم المؤسسة/i)).toBeInTheDocument();
  });
});
