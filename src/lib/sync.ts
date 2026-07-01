import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';
import { UserCloudData } from '../types';

export const syncUserDataToCloud = async (user: User, localData: Partial<UserCloudData>) => {
  if (!db || !user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      data: localData,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Error syncing to cloud:", error);
  }
};

export const listenToCloudData = (user: User, onDataUpdate: (data: Partial<UserCloudData>) => void) => {
  if (!db || !user) return () => {};
  
  const userRef = doc(db, 'users', user.uid);
  return onSnapshot(userRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      if (data && data.data) {
        onDataUpdate(data.data);
      }
    }
  });
};
