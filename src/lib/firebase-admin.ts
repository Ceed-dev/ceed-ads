/**
 * Initializes Firebase Admin SDK for server-side Firestore access.
 * - Uses service account credentials from GOOGLE_APPLICATION_CREDENTIALS
 * - Ensures singleton initialization in Next.js dev/hot-reload environments
 * - Exports `db` for Firestore read/write operations
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Prevent re-initializing Firebase Admin during hot reload (Next.js dev)
const firebaseAdminApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
      })
    : getApps()[0];

export const db = getFirestore(firebaseAdminApp);
