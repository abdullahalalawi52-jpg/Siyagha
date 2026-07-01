import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from './FormContext';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    user: null,
  }),
}));

// Mock UIContext
const addToastMock = vi.fn();
const setIsLibraryOpenMock = vi.fn();
vi.mock('./UIContext', () => ({
  useUI: () => ({
    appLang: 'ar',
    addToast: addToastMock,
    setIsLibraryOpen: setIsLibraryOpenMock,
  }),
}));

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const FormHelperComponent = () => {
  const {
    form,
    setForm,
    careerProfile,
    setCareerProfile,
    brandVoiceProfiles,
    saveBrandVoiceProfile,
    deleteBrandVoiceProfile,
    applyTemplate,
    replaceVariable,
  } = useForm();

  return (
    <div>
      <div data-testid="senderName">{form.senderName}</div>
      <div data-testid="formality">{form.formality}</div>
      <div data-testid="careerName">{careerProfile.fullName}</div>
      <div data-testid="voiceCount">{brandVoiceProfiles.length}</div>
      
      <button
        onClick={() => setForm((prev) => ({ ...prev, senderName: 'Abdullah' }))}
        data-testid="btn-update-sender"
      >
        Update Sender
      </button>

      <button
        onClick={() => setCareerProfile({
          fullName: 'Abdullah',
          email: 'abdullah@siyagha.com',
          phone: '12345678',
          qualification: 'Degree',
          specialization: 'Tech',
          experienceYears: '5',
          skills: 'React'
        })}
        data-testid="btn-update-career"
      >
        Update Career
      </button>

      <button
        onClick={() => saveBrandVoiceProfile('Custom Voice', 'Strong profile')}
        data-testid="btn-save-voice"
      >
        Save Voice
      </button>

      <button
        onClick={() => {
          if (brandVoiceProfiles.length > 0) {
            deleteBrandVoiceProfile(brandVoiceProfiles[brandVoiceProfiles.length - 1].id);
          }
        }}
        data-testid="btn-delete-voice"
      >
        Delete Voice
      </button>
    </div>
  );
};

describe('FormContext & Provider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    render(
      <FormProvider>
        <FormHelperComponent />
      </FormProvider>
    );

    expect(screen.getByTestId('senderName').textContent).toBe('');
    expect(screen.getByTestId('careerName').textContent).toBe('');
    expect(screen.getByTestId('voiceCount').textContent).toBe('3'); // 3 default profiles
  });

  it('should update form values correctly', () => {
    render(
      <FormProvider>
        <FormHelperComponent />
      </FormProvider>
    );

    const updateBtn = screen.getByTestId('btn-update-sender');
    fireEvent.click(updateBtn);

    expect(screen.getByTestId('senderName').textContent).toBe('Abdullah');
  });

  it('should update career profile and persist to localStorage', () => {
    render(
      <FormProvider>
        <FormHelperComponent />
      </FormProvider>
    );

    const careerBtn = screen.getByTestId('btn-update-career');
    fireEvent.click(careerBtn);

    expect(screen.getByTestId('careerName').textContent).toBe('Abdullah');
    const saved = JSON.parse(localStorageMock.getItem('career_profile') || '{}');
    expect(saved.fullName).toBe('Abdullah');
  });

  it('should save and delete custom brand voices', () => {
    render(
      <FormProvider>
        <FormHelperComponent />
      </FormProvider>
    );

    const saveBtn = screen.getByTestId('btn-save-voice');
    fireEvent.click(saveBtn);
    expect(screen.getByTestId('voiceCount').textContent).toBe('4');

    const deleteBtn = screen.getByTestId('btn-delete-voice');
    fireEvent.click(deleteBtn);
    expect(screen.getByTestId('voiceCount').textContent).toBe('3');
  });
});
