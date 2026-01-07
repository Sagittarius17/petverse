import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let db: Firestore;

if (!getApps().length) {
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle private key newlines
  };

  // Check if all necessary environment variables are set
  if (!firebaseConfig.projectId || !firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
    console.warn("Firebase Admin SDK initialization skipped: Missing environment variables. Server-side Firestore operations will not be available.");
    // db remains undefined, operations will fail gracefully where db is used
  } else {
    initializeApp({
      credential: cert(firebaseConfig),
    });
    db = getFirestore();
  }
} else {
    // If the app is already initialized, get the existing firestore instance
    db = getFirestore();
}

export { db };
