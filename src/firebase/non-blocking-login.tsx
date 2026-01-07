'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  Unsubscribe,
} from 'firebase/auth';
import { Firestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up and create user document (non-blocking). */
export async function initiateEmailSignUp(
  authInstance: Auth,
  firestore: Firestore,
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;

    // Update the user's profile with their full name
    await updateProfile(user, { displayName: fullName });

    // Create a corresponding user document in Firestore
    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      id: user.uid,
      username: fullName, // Or derive from email if needed
      email: user.email,
      firstName: fullName.split(' ')[0] || '',
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      createdAt: serverTimestamp(),
      role: 'User', // Default role
    });

  } catch (error) {
    console.error("Error during sign-up process:", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(authInstance, email, password)
      .then(() => resolve())
      .catch((error) => reject(error));
  });
}
