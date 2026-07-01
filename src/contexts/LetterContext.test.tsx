import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { LetterProvider, useLetter } from './LetterContext';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'user_123' },
  }),
}));

// Mock UIContext
const addToastMock = vi.fn();
vi.mock('./UIContext', () => ({
  useUI: () => ({
    appLang: 'ar',
    addToast: addToastMock,
    setIsLoading: vi.fn(),
    setIsLibraryOpen: vi.fn(),
    setIsSigningOpen: vi.fn(),
  }),
}));

// Mock FormContext
vi.mock('./FormContext', () => ({
  useForm: () => ({
    form: {
      type: 'إداري/رسمي',
      subType: 'طلب وظيفة',
      senderName: 'Test Sender',
      senderPhone: '123456',
      senderEmail: 'sender@test.com',
      recipientName: 'Manager',
      recipientRole: 'HR',
      subject: 'Test Subject',
      details: 'Test Details',
      tone: 'رسمي',
      formality: 'عالي',
      language: 'ar',
      date: '2026-07-01',
    },
    setForm: vi.fn(),
    favoriteTemplates: [],
    favoritePredefined: [],
    setFavoriteTemplates: vi.fn(),
    setFavoritePredefined: vi.fn(),
    autoGenerate: false,
  }),
}));

// Mock navigator.clipboard
const writeTextMock = vi.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: writeTextMock,
  },
  writable: true,
});

const LetterHelperComponent = () => {
  const {
    generatedLetter,
    updateLetterContent,
    handleUndo,
    handleRedo,
    handleCopy,
    copied,
  } = useLetter();

  return (
    <div>
      <div data-testid="letterContent">{generatedLetter}</div>
      <div data-testid="copiedStatus">{copied ? 'copied' : 'not-copied'}</div>
      <button onClick={() => updateLetterContent('New Letter Content')} data-testid="btn-update">
        Update Content
      </button>
      <button onClick={handleUndo} data-testid="btn-undo">
        Undo
      </button>
      <button onClick={handleRedo} data-testid="btn-redo">
        Redo
      </button>
      <button onClick={handleCopy} data-testid="btn-copy">
        Copy
      </button>
    </div>
  );
};

describe('LetterContext & Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty letter content', () => {
    render(
      <LetterProvider>
        <LetterHelperComponent />
      </LetterProvider>
    );

    expect(screen.getByTestId('letterContent').textContent).toBe('');
  });

  it('should update content and manage undo/redo history correctly', () => {
    render(
      <LetterProvider>
        <LetterHelperComponent />
      </LetterProvider>
    );

    const updateBtn = screen.getByTestId('btn-update');
    
    // First update
    fireEvent.click(updateBtn);
    expect(screen.getByTestId('letterContent').textContent).toBe('New Letter Content');

    // Undo
    const undoBtn = screen.getByTestId('btn-undo');
    fireEvent.click(undoBtn);
    expect(screen.getByTestId('letterContent').textContent).toBe('');

    // Redo
    const redoBtn = screen.getByTestId('btn-redo');
    fireEvent.click(redoBtn);
    expect(screen.getByTestId('letterContent').textContent).toBe('New Letter Content');
  });

  it('should copy letter content to clipboard on copy click', () => {
    render(
      <LetterProvider>
        <LetterHelperComponent />
      </LetterProvider>
    );

    // Update content first
    fireEvent.click(screen.getByTestId('btn-update'));

    // Copy to clipboard
    const copyBtn = screen.getByTestId('btn-copy');
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('New Letter Content');
    expect(screen.getByTestId('copiedStatus').textContent).toBe('copied');
  });
});
