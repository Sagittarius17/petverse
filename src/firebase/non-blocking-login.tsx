'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  Unsubscribe,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Firestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

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
      profilePicture: user.photoURL || '',
      createdAt: serverTimestamp(),
      role: 'User', // Default role
      status: 'Active', // Default status
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

/** Initiate Google sign-in and create user document if new (non-blocking). */
export async function initiateGoogleSignIn(auth: Auth, firestore: Firestore): Promise<void> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if the user document already exists
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // If the user document does not exist, create it.
    if (!userDoc.exists()) {
      const { displayName, email, photoURL, uid } = user;
      const firstName = displayName ? displayName.split(' ')[0] : '';
      const lastName = displayName ? displayName.split(' ').slice(1).join(' ') : '';
      
      await setDoc(userDocRef, {
        id: uid,
        username: displayName || email,
        email: email,
        firstName: firstName,
        lastName: lastName,
        profilePicture: photoURL || '',
        createdAt: serverTimestamp(),
        role: 'User',
        status: 'Active',
      });
    }
  } catch (error) {
    // Re-throw to be handled by the UI, without logging here.
    throw error;
  }
}

    