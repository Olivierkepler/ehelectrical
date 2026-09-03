import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

/**
 * Browser-only Firebase client for Kepler Web Auth (Phase 2B).
 * Configuration comes exclusively from NEXT_PUBLIC_FIREBASE_*.
 * Do not initialize Firebase Admin here.
 */

type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? "";
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  const storageBucket =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
  const messagingSenderId =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseClientConfigured(): boolean {
  return readFirebaseClientConfig() !== null;
}

export function getMissingFirebaseClientEnvKeys(): string[] {
  const checks: Array<[string, string | undefined]> = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
    [
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    ],
    [
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ],
    [
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    ],
    [
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    ],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
  ];

  return checks
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);
}

let appSingleton: FirebaseApp | null = null;
let authSingleton: Auth | null = null;

/**
 * Lazily initializes Firebase App + Auth.
 * Throws a development-friendly error if public client config is missing.
 * Safe to call only from product/auth client paths — not from marketing.
 */
export function getFirebaseApp(): FirebaseApp {
  if (appSingleton) {
    return appSingleton;
  }

  const config = readFirebaseClientConfig();

  if (!config) {
    const missing = getMissingFirebaseClientEnvKeys().join(", ");
    throw new Error(
      `Kepler Firebase client is not configured. Set the NEXT_PUBLIC_FIREBASE_* variables in .env.local (missing: ${missing}). Use the same Firebase project as Kepler mobile.`,
    );
  }

  appSingleton =
    getApps().length === 0 ? initializeApp(config) : getApp();

  return appSingleton;
}

export function getFirebaseAuth(): Auth {
  if (authSingleton) {
    return authSingleton;
  }

  authSingleton = getAuth(getFirebaseApp());
  return authSingleton;
}
