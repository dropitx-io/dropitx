import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged as onAuthStateChangedImpl,
  setPersistence,
  browserLocalPersistence,
  type Unsubscribe,
  type User,
} from "firebase/auth";
import { auth } from "./client";

setPersistence(auth, browserLocalPersistence).catch(() => {
  // Non-fatal: ephemeral persistence still allows sign-in.
});

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

export async function signInWithGoogle(): Promise<void> {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw err;
  }
}

export async function signInWithGitHub(): Promise<void> {
  const provider = new GithubAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw err;
  }
}

export async function handleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  return result?.user ?? null;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function updateUserPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  await updatePassword(user, newPassword);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthStateChanged(cb: (user: User | null) => void): Unsubscribe {
  return onAuthStateChangedImpl(auth, cb);
}

export { auth };
