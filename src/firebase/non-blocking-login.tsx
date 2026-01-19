
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { Firestore, doc, setDoc, serverTimestamp, getDoc, writeBatch, query, collection, where, getDocs } from 'firebase/firestore';

/** Initiate anonymous sign-in. This is an async operation. */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  // signInAnonymously returns a promise, which should be returned to the caller.
  // Map the UserCredential result to void to match the promise signature.
  return signInAnonymously(authInstance).then(() => {});
}

/** Initiate email/password sign-up and create user document (non-blocking). */
export async function initiateEmailSignUp(
  authInstance: Auth,
  firestore: Firestore,
  email: string,
  password: string,
  fullName: string,
  username: string
): Promise<void> {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;

    // Update the user's profile with their full name
    await updateProfile(user, { displayName: fullName });
    
    // Use a batch to write to users and usernames collections atomically
    const batch = writeBatch(firestore);
    
    const userDocRef = doc(firestore, 'users', user.uid);
    batch.set(userDocRef, {
      id: user.uid,
      username: username,
      displayName: fullName,
      email: user.email,
      firstName: fullName.split(' ')[0] || '',
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      profilePicture: user.photoURL || '',
      createdAt: serverTimestamp(),
      role: 'User', // Default role
      status: 'Active', // Default status
    });
    
    const usernameDocRef = doc(firestore, 'usernames', username);
    batch.set(usernameDocRef, { uid: user.uid });

    await batch.commit();
  } catch (error) { 
    console.error("Error during sign-up process:", error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

async function findUniqueUsername(firestore: Firestore, baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!username) username = 'user'; // fallback
    let attempts = 0;
    let finalUsername = username;

    while (attempts < 5) {
        const usernameRef = doc(firestore, "usernames", finalUsername);
        const snapshot = await getDoc(usernameRef);
        if (!snapshot.exists()) {
            return finalUsername;
        }
        // If username exists, append a random number and try again
        finalUsername = `${username}_${Math.floor(Math.random() * 1000)}`;
        attempts++;
    }
    // Fallback if we can't find a unique username after a few tries
    return `${username}_${Date.now()}`;
}

/** Initiate Google sign-in and create user document if new (non-blocking). */
export async function initiateGoogleSignIn(auth: Auth, firestore: Firestore): Promise<UserCredential> {
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
      
      const baseUsername = email ? email.split('@')[0] : displayName?.replace(/\s/g, '') || 'user';
      const username = await findUniqueUsername(firestore, baseUsername);

      const batch = writeBatch(firestore);
      batch.set(userDocRef, {
        id: uid,
        username: username,
        displayName: displayName || email,
        email: email,
        firstName: firstName,
        lastName: lastName,
        profilePicture: photoURL || '',
        createdAt: serverTimestamp(),
        role: 'User',
        status: 'Active',
      });

      const usernameDocRef = doc(firestore, 'usernames', username);
      batch.set(usernameDocRef, { uid: uid });

      await batch.commit();
    }
    return result;
  } catch (error) {
    // Re-throw to be handled by the UI, without logging here.
    throw error;
  }
}
