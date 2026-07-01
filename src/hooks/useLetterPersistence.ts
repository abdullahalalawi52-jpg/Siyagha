import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { SavedLetter } from '../types';
import { syncUserDataToCloud, listenToCloudData } from '../lib/sync';

import { LetterFormState } from '../types';
import { UIContextType } from '../contexts/UIContext';

export interface UseLetterPersistenceProps {
  user: User | null;
  form: LetterFormState;
  setForm: React.Dispatch<React.SetStateAction<LetterFormState>>;
  generatedLetter: string;
  updateLetterContent: (content: string) => void;
  favoriteTemplates: { type: string; subType: string }[];
  favoritePredefined: string[];
  setFavoriteTemplates: (val: { type: string; subType: string }[]) => void;
  setFavoritePredefined: (val: string[]) => void;
  ui: UIContextType;
}

export const useLetterPersistence = ({
  user,
  form,
  setForm,
  generatedLetter,
  updateLetterContent,
  favoriteTemplates,
  favoritePredefined,
  setFavoriteTemplates,
  setFavoritePredefined,
  ui,
}: UseLetterPersistenceProps) => {
  const [savedLetters, setSavedLetters] = useState<SavedLetter[]>([]);
  const [savedStatus, setSavedStatus] = useState(false);
  const [draftStatus, setDraftStatus] = useState(false);

  // Load local saved letters
  useEffect(() => {
    try {
      let saved = localStorage.getItem('saved_letters');
      if (!saved) {
        saved = localStorage.getItem('savedLetters');
        if (saved) {
          localStorage.setItem('saved_letters', saved);
          localStorage.removeItem('savedLetters');
        }
      }
      if (saved) {
        setSavedLetters(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading saved letters:', e);
    }
  }, []);

  // Sync state to Local Storage and Firebase
  const updateSavedLettersAndSync = (letters: SavedLetter[]) => {
    setSavedLetters(letters);
    localStorage.setItem('saved_letters', JSON.stringify(letters));
    if (user) {
      syncUserDataToCloud(user, {
        savedLetters: letters,
        favoriteTemplates,
        favoritePredefined,
      });
    }
  };

  // Sync from Firebase
  useEffect(() => {
    if (!user) return;
    const unsubscribe = listenToCloudData(user, (data) => {
      if (data.savedLetters) {
        setSavedLetters(data.savedLetters);
        localStorage.setItem('saved_letters', JSON.stringify(data.savedLetters));
      }
      if (data.favoriteTemplates) {
        setFavoriteTemplates(data.favoriteTemplates);
        localStorage.setItem('favoriteTemplates', JSON.stringify(data.favoriteTemplates));
      }
      if (data.favoritePredefined) {
        setFavoritePredefined(data.favoritePredefined);
        localStorage.setItem('favoritePredefined', JSON.stringify(data.favoritePredefined));
      }
    });
    return () => unsubscribe();
  }, [user, setFavoriteTemplates, setFavoritePredefined]);

  // Toggle pin
  const handleTogglePin = (e: React.MouseEvent, letterId: string) => {
    e.stopPropagation();
    const updated = savedLetters.map((l) =>
      l.id === letterId ? { ...l, isPinned: !l.isPinned } : l
    );
    updateSavedLettersAndSync(updated);
  };

  // Save letters
  const handleSave = () => {
    if (!generatedLetter) return;
    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      subject: form.subject || 'خطاب بدون عنوان',
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      content: generatedLetter,
      type: form.type,
      isDraft: false,
      formData: form,
      tags: ui.pendingTags.length > 0 ? [...ui.pendingTags] : undefined,
      savedAt: Date.now(),
    };
    const updated = [newLetter, ...savedLetters];
    updateSavedLettersAndSync(updated);
    ui.setPendingTags([]);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSaveDraft = () => {
    const newLetter: SavedLetter = {
      id: Date.now().toString(),
      subject: form.subject || 'مسودة خطاب',
      date: new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
      content: generatedLetter || '',
      type: form.type,
      isDraft: true,
      formData: form,
    };
    const updated = [newLetter, ...savedLetters];
    updateSavedLettersAndSync(updated);
    setDraftStatus(true);
    setTimeout(() => setDraftStatus(false), 2000);
  };

  const handleLoadSaved = (letter: SavedLetter) => {
    updateLetterContent(letter.content);
    if (letter.formData) {
      setForm(letter.formData);
    }
    ui.setIsArchiveOpen(false);
  };

  return {
    savedLetters,
    setSavedLetters,
    savedStatus,
    draftStatus,
    handleTogglePin,
    handleSave,
    handleSaveDraft,
    handleLoadSaved,
  };
};
