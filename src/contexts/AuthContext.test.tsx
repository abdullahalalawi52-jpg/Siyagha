import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock UIContext
const addToastMock = vi.fn();
vi.mock('./UIContext', () => ({
  useUI: () => ({
    addToast: addToastMock,
  }),
}));

// Mock Firebase functions
const onAuthStateChangedMock = vi.fn();
const signInWithPopupMock = vi.fn();
const signOutMock = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (authVal: any, callback: any) => {
    onAuthStateChangedMock(authVal, callback);
    callback(null); // initialize with null user
    return () => {};
  },
  signInWithPopup: (auth: any, provider: any) => signInWithPopupMock(auth, provider),
  signOut: (auth: any) => signOutMock(auth),
  GoogleAuthProvider: class {},
}));

// Mock ../lib/firebase
vi.mock('../lib/firebase', () => ({
  auth: { mockAuthObject: true },
  googleProvider: { mockProviderObject: true },
}));

const AuthHelperComponent = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'anonymous'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <button onClick={signInWithGoogle} data-testid="btn-login">Login</button>
      <button onClick={signOut} data-testid="btn-logout">Logout</button>
    </div>
  );
};

describe('AuthContext & Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with anonymous user and loading false', () => {
    render(
      <AuthProvider>
        <AuthHelperComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('ready');
    expect(screen.getByTestId('user').textContent).toBe('anonymous');
  });

  it('should call signInWithPopup on login click', async () => {
    signInWithPopupMock.mockResolvedValueOnce({
      user: { email: 'test@siyagha.com' }
    });

    render(
      <AuthProvider>
        <AuthHelperComponent />
      </AuthProvider>
    );

    const loginBtn = screen.getByTestId('btn-login');
    fireEvent.click(loginBtn);

    expect(signInWithPopupMock).toHaveBeenCalled();
  });

  it('should call firebase signOut on logout click', async () => {
    signOutMock.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <AuthHelperComponent />
      </AuthProvider>
    );

    const logoutBtn = screen.getByTestId('btn-logout');
    fireEvent.click(logoutBtn);

    expect(signOutMock).toHaveBeenCalled();
  });
});
