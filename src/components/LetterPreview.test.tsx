import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LetterPreview } from './LetterPreview';
import { useApp } from '../contexts/AppContext';

// Mock useApp
vi.mock('../contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

// Mock child components to isolate tests
vi.mock('./letter-preview/PreviewToolbar', () => ({
  PreviewToolbar: () => <div data-testid="preview-toolbar">Toolbar Mock</div>,
}));
vi.mock('./letter-preview/PreviewPaper', () => ({
  PreviewPaper: () => <div data-testid="preview-paper">Paper Mock</div>,
}));

describe('LetterPreview Component', () => {
  it('should render both Toolbar and Paper content correctly', () => {
    vi.mocked(useApp).mockReturnValue({
      appLang: 'ar',
    } as any);

    render(<LetterPreview />);

    expect(screen.getByTestId('preview-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('preview-paper')).toBeInTheDocument();
  });
});
