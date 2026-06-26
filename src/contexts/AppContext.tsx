import React from 'react';
import { UIProvider, useUI, UIContextType } from './UIContext';
import { FormProvider, useForm, FormContextType } from './FormContext';
import { LetterProvider, useLetter, LetterContextType } from './LetterContext';

export interface AppContextType extends UIContextType, FormContextType, LetterContextType {}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UIProvider>
      <FormProvider>
        <LetterProvider>
          {children}
        </LetterProvider>
      </FormProvider>
    </UIProvider>
  );
};

export const useApp = (): AppContextType => {
  const ui = useUI();
  const form = useForm();
  const letter = useLetter();
  return {
    ...ui,
    ...form,
    ...letter,
  };
};
