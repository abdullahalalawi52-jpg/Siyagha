import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OcrModal } from './OcrModal';
import { useApp } from '../../contexts/AppContext';

// Mock useApp
vi.mock('../../contexts/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('OcrModal Component', () => {
  const setIsOcrOpenMock = vi.fn();
  const handleOcrUploadMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOcrOpen is false', () => {
    vi.mocked(useApp).mockReturnValue({
      isOcrOpen: false,
      setIsOcrOpen: setIsOcrOpenMock,
      ocrLoading: false,
      ocrError: '',
      handleOcrUpload: handleOcrUploadMock,
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<OcrModal />);
    expect(screen.queryByText(/واجهة استخراج النصوص/i)).not.toBeInTheDocument();
  });

  it('should render correctly when isOcrOpen is true', () => {
    vi.mocked(useApp).mockReturnValue({
      isOcrOpen: true,
      setIsOcrOpen: setIsOcrOpenMock,
      ocrLoading: false,
      ocrError: '',
      handleOcrUpload: handleOcrUploadMock,
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<OcrModal />);
    expect(screen.getByText(/واجهة استخراج النصوص/i)).toBeInTheDocument();
  });

  it('should trigger close handler when clicking the close button', () => {
    vi.mocked(useApp).mockReturnValue({
      isOcrOpen: true,
      setIsOcrOpen: setIsOcrOpenMock,
      ocrLoading: false,
      ocrError: '',
      handleOcrUpload: handleOcrUploadMock,
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<OcrModal />);
    const closeBtn = screen.getByRole('button', { name: /إغلاق النافذة/i });
    fireEvent.click(closeBtn);
    expect(setIsOcrOpenMock).toHaveBeenCalledWith(false);
  });

  it('should display loading indicator when ocrLoading is true', () => {
    vi.mocked(useApp).mockReturnValue({
      isOcrOpen: true,
      setIsOcrOpen: setIsOcrOpenMock,
      ocrLoading: true,
      ocrError: '',
      handleOcrUpload: handleOcrUploadMock,
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<OcrModal />);
    expect(screen.getByText(/جاري استخراج النصوص/i)).toBeInTheDocument();
  });

  it('should display error message when ocrError is present', () => {
    vi.mocked(useApp).mockReturnValue({
      isOcrOpen: true,
      setIsOcrOpen: setIsOcrOpenMock,
      ocrLoading: false,
      ocrError: 'فشل معالجة الصورة',
      handleOcrUpload: handleOcrUploadMock,
      appLang: 'ar',
      t: (ar: string) => ar,
    } as any);

    render(<OcrModal />);
    expect(screen.getByText('فشل معالجة الصورة')).toBeInTheDocument();
  });
});
