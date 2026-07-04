import React from 'react';
import { UIProvider, useUI, UIContextType } from './UIContext';
import { AuthProvider, useAuth, AuthContextType } from './AuthContext';
import { FormProvider, useForm, FormContextType } from './FormContext';
import { LetterProvider, useLetter, LetterContextType } from './LetterContext';

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

  return React.useMemo(
    () => ({
      ...ui,
      ...auth,
      ...form,
      ...letter,
    }),
    [ui, auth, form, letter]
  );
};
