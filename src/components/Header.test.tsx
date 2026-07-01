import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

// Mock contexts
const mockUseApp = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../contexts/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock motion
vi.mock('motion/react', () => ({
  motion: {
    div: React.forwardRef(({ children, initial, animate, exit, transition, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for unauthenticated offline user in Arabic', () => {
    mockUseApp.mockReturnValue({
      appLang: 'ar',
      setAppLang: vi.fn(),
      darkMode: false,
      toggleDarkMode: vi.fn(),
      isOnline: false,
      savedLetters: [],
      setIsArchiveOpen: vi.fn(),
      t: (ar: string, en: string) => ar,
    });

    mockUseAuth.mockReturnValue({
      user: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Header />);

    // Logo title is rendered
    expect(screen.getByText('صياغة')).toBeInTheDocument();
    // Offline status is visible
    expect(screen.getByText('أوفلاين')).toBeInTheDocument();
    // Login button is shown
    expect(screen.getByRole('button', { name: /دخول/i })).toBeInTheDocument();
    // Archive count badge is not present (0 letters)
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders user details and archive count when authenticated and online', () => {
    mockUseApp.mockReturnValue({
      appLang: 'ar',
      setAppLang: vi.fn(),
      darkMode: true,
      toggleDarkMode: vi.fn(),
      isOnline: true,
      savedLetters: [{ id: '1', subject: 'Test' }, { id: '2', subject: 'Test 2' }],
      setIsArchiveOpen: vi.fn(),
      t: (ar: string, en: string) => ar,
    });

    mockUseAuth.mockReturnValue({
      user: { displayName: 'عبد الله العلوي', email: 'test@example.com' },
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Header />);

    // Online status is shown
    expect(screen.getByText('متصل')).toBeInTheDocument();
    // User name is displayed
    expect(screen.getByText('عبد الله العلوي')).toBeInTheDocument();
    // Logout button is shown
    expect(screen.getByRole('button', { name: /خروج/i })).toBeInTheDocument();
    // Archive count badge displays 2
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('triggers language toggle and theme toggle click events', () => {
    const setAppLangMock = vi.fn();
    const toggleDarkModeMock = vi.fn();
    
    mockUseApp.mockReturnValue({
      appLang: 'ar',
      setAppLang: setAppLangMock,
      darkMode: false,
      toggleDarkMode: toggleDarkModeMock,
      isOnline: true,
      savedLetters: [],
      setIsArchiveOpen: vi.fn(),
      t: (ar: string, en: string) => ar,
    });

    mockUseAuth.mockReturnValue({
      user: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(<Header />);

    // Click language toggle button
    const langBtn = screen.getByRole('button', { name: /تغيير اللغة/i });
    fireEvent.click(langBtn);
    expect(setAppLangMock).toHaveBeenCalledWith('en');

    // Click theme toggle button
    const themeBtn = screen.getByTitle('الوضع الداكن');
    fireEvent.click(themeBtn);
    expect(toggleDarkModeMock).toHaveBeenCalled();
  });

  it('calls auth login and logout actions respectively', () => {
    const signInMock = vi.fn();
    const signOutMock = vi.fn();

    // 1. Check Login trigger
    mockUseApp.mockReturnValue({
      appLang: 'ar',
      setAppLang: vi.fn(),
      darkMode: false,
      toggleDarkMode: vi.fn(),
      isOnline: true,
      savedLetters: [],
      setIsArchiveOpen: vi.fn(),
      t: (ar: string, en: string) => ar,
    });

    mockUseAuth.mockReturnValue({
      user: null,
      signInWithGoogle: signInMock,
      signOut: signOutMock,
    });

    const { rerender } = render(<Header />);
    const loginBtn = screen.getByRole('button', { name: /دخول/i });
    fireEvent.click(loginBtn);
    expect(signInMock).toHaveBeenCalled();

    // 2. Check Logout trigger
    mockUseAuth.mockReturnValue({
      user: { email: 'user@example.com' },
      signInWithGoogle: vi.fn(),
      signOut: signOutMock,
    });

    rerender(<Header />);
    const logoutBtn = screen.getByRole('button', { name: /خروج/i });
    fireEvent.click(logoutBtn);
    expect(signOutMock).toHaveBeenCalled();
  });
});
