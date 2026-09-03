"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { getFirebaseAuth, isFirebaseClientConfigured } from "@/lib/kepler/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeDisplayName(displayName: string): string {
  return displayName.trim().replace(/\s+/g, " ");
}

/**
 * Browser Firebase Auth provider for Kepler Web.
 * Email/password only — matches Kepler mobile.
 * Does not call the Kepler API (Phase 2B).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseClientConfigured();

  useEffect(() => {
    if (!configured) {
      setUser(null);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, [configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      async signIn(email: string, password: string) {
        const auth = getFirebaseAuth();
        await signInWithEmailAndPassword(
          auth,
          normalizeEmail(email),
          password,
        );
      },
      async signUp(displayName: string, email: string, password: string) {
        const name = normalizeDisplayName(displayName);

        if (!name) {
          throw new Error("Enter a valid full name.");
        }

        const auth = getFirebaseAuth();
        const credential = await createUserWithEmailAndPassword(
          auth,
          normalizeEmail(email),
          password,
        );

        await updateProfile(credential.user, {
          displayName: name,
        });
      },
      async signOut() {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
      },
    }),
    [user, loading, configured],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
