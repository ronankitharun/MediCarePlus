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
      console.log('Auth state changed:', firebaseUser ? `User logged in: ${firebaseUser.uid}` : 'User logged out');
      
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const isAdminEmail = firebaseUser.email === '2000030868cse@gmail.com';
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('User document found:', userData.role);
            
            // If it's the admin email but role isn't admin, update it
            if (isAdminEmail && userData.role !== 'admin') {
              console.log('Updating user to admin role');
              const updatedUser = { ...userData, role: 'admin' as const };
              await setDoc(userDocRef, updatedUser, { merge: true });
              setUser(updatedUser);
            } else {
              setUser(userData);
            }
          } else {
            console.log('Creating new user profile');
            // Create new user profile if it doesn't exist
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anonymous User',
              role: isAdminEmail ? 'admin' : 'patient',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newUser);
              setUser(newUser);
            } catch (createErr) {
              console.error('Error creating user profile:', createErr);
              // Fallback to local user state if Firestore write fails
              setUser(newUser);
            }
          }
        } catch (err) {
          console.error('Error in AuthContext onAuthStateChanged:', err);
          // Fallback to basic user info if Firestore read fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous User',
            role: firebaseUser.email === '2000030868cse@gmail.com' ? 'admin' : 'patient',
            createdAt: new Date().toISOString(),
          });
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
