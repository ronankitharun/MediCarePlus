import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isDoctor: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const isAdminEmail = firebaseUser.email === '2000030868cse@gmail.com';
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // If it's the admin email but role isn't admin, update it
          if (isAdminEmail && userData.role !== 'admin') {
            const updatedUser = { ...userData, role: 'admin' as const };
            await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser, { merge: true });
            setUser(updatedUser);
          } else {
            setUser(userData);
          }
        } else {
          // Create new user profile if it doesn't exist
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous User',
            role: isAdminEmail ? 'admin' : 'patient',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isDoctor: user?.role === 'doctor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
