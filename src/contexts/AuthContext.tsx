import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase isn't initialized (missing config), stop loading immediately
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      alert("الرجاء إعداد مفاتيح Firebase أولاً في ملف .env");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      let message = "حدث خطأ أثناء تسجيل الدخول";
      if (error && error.code) {
        message += ` (${error.code})`;
        if (error.code === 'auth/unauthorized-domain') {
          message += "\n\n⚠️ هذا النطاق غير مصرح به في Firebase Console. يرجى التأكد من إضافة 'abdullahalalawi52-jpg.github.io' إلى النطاقات المعتمدة (Authorized Domains) في إعدادات Authentication.";
        } else if (error.code === 'auth/configuration-not-found') {
          message += "\n\n⚠️ لم يتم تفعيل تسجيل الدخول بجوجل (Google Sign-In) في لوحة تحكم Firebase.";
        } else if (error.code === 'auth/popup-closed-by-user') {
          message += "\n\n⚠️ تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.";
        }
      } else if (error && error.message) {
        message += `: ${error.message}`;
      }
      alert(message);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
