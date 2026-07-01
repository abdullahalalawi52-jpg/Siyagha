import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LetterForm } from './LetterForm';
import { useApp } from '../contexts/AppContext';

// Mock useApp
vi.mock('../contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

// Mock sub-tab components to simplify unit tests
vi.mock('./letter-form/BasicInfoTab', () => ({
  BasicInfoTab: () => <div data-testid="basic-info-tab">Basic Info Tab Content</div>,
}));
vi.mock('./letter-form/BrandingTab', () => ({
  BrandingTab: () => <div data-testid="branding-tab">Branding Tab Content</div>,
}));
vi.mock('./letter-form/SignatureTab', () => ({
  SignatureTab: () => <div data-testid="signature-tab">Signature Tab Content</div>,
}));

describe('LetterForm Tab Switcher Component', () => {
  it('should render the correct tab based on activeSection = basic', () => {
    vi.mocked(useApp).mockReturnValue({
      activeSection: 'basic',
      setActiveSection: vi.fn(),
      generateLetter: vi.fn(),
      currentVariables: [],
      replaceVariable: vi.fn(),
      isSavingTemplate: false,
      setIsSavingTemplate: vi.fn(),
      newTemplateName: '',
      setNewTemplateName: vi.fn(),
      handleSaveCustomTemplate: vi.fn(),
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<LetterForm />);

    expect(screen.getByTestId('basic-info-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('branding-tab')).not.toBeInTheDocument();
  });

  it('should render the correct tab based on activeSection = branding', () => {
    vi.mocked(useApp).mockReturnValue({
      activeSection: 'branding',
      setActiveSection: vi.fn(),
      generateLetter: vi.fn(),
      currentVariables: [],
      replaceVariable: vi.fn(),
      isSavingTemplate: false,
      setIsSavingTemplate: vi.fn(),
      newTemplateName: '',
      setNewTemplateName: vi.fn(),
      handleSaveCustomTemplate: vi.fn(),
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<LetterForm />);

    expect(screen.getByTestId('branding-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('basic-info-tab')).not.toBeInTheDocument();
  });

  it('should call setActiveSection when clicking tab headers', () => {
    const setActiveSectionMock = vi.fn();
    vi.mocked(useApp).mockReturnValue({
      activeSection: 'basic',
      setActiveSection: setActiveSectionMock,
      generateLetter: vi.fn(),
      currentVariables: [],
      replaceVariable: vi.fn(),
      isSavingTemplate: false,
      setIsSavingTemplate: vi.fn(),
      newTemplateName: '',
      setNewTemplateName: vi.fn(),
      handleSaveCustomTemplate: vi.fn(),
      appLang: 'ar',
      t: (ar: string, en: string) => ar,
    } as any);

    render(<LetterForm />);

    // Click "الهوية والترويسة" tab
    const brandingTabHeader = screen.getByRole('button', { name: /الهوية والترويسة/i });
    fireEvent.click(brandingTabHeader);
    expect(setActiveSectionMock).toHaveBeenCalledWith('branding');
  });
});
