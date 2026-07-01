import React from 'react';
import { UIProvider, useUI, UIContextType } from './UIContext';
import { AuthProvider, useAuth } from './AuthContext';
import { FormProvider, useForm, FormContextType } from './FormContext';
import { LetterProvider, useLetter, LetterContextType } from './LetterContext';

// We combine AuthContextType into AppContextType as well to expose useAuth fields through useApp
import { AuthContextType } from './AuthContext';

export interface AppContextType extends UIContextType, AuthContextType, FormContextType, LetterContextType {}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <FormProvider>
          <LetterProvider>
            {children}
          </LetterProvider>
        </FormProvider>
      </AuthProvider>
    </UIProvider>
  );
};

export const useApp = (): AppContextType => {
  const ui = useUI();
  const auth = useAuth();
  const form = useForm();
  const letter = useLetter();
  return {
    ...ui,
    ...auth,
    ...form,
    ...letter,
  };
};
