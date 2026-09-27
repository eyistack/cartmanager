import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  getDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { GroceryItem, ShoppingTrip, PantryStaple, MonthlyBudget } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize custom database instance if firestoreDatabaseId is provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export interface UserCloudData {
  items: GroceryItem[];
  trips: ShoppingTrip[];
  staples: PantryStaple[];
  budgets: MonthlyBudget[];
  currency?: string;
  recentStore?: string;
  lastUpdated?: string;
}

// Sign in with Google Popup
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    console.error('Google Sign-in Error:', error);
    throw error;
  }
}

// Sign in with Email & Password
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    throw error;
  }
}

// Register new user with Email & Password
export async function registerWithEmail(email: string, pass: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    throw error;
  }
}

// Sign out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Helper to recursively remove undefined keys for Firestore serialization
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as any;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj as Record<string, any>)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as any;
  }
  return obj;
}

// Sync user data to Firestore
export async function saveUserDataToFirestore(userId: string, data: UserCloudData): Promise<boolean> {
  if (!userId) return false;
  try {
    const userDocRef = doc(db, 'users', userId);
    const sanitized = sanitizeForFirestore({
      items: data.items || [],
      trips: data.trips || [],
      staples: data.staples || [],
      budgets: data.budgets || [],
      currency: data.currency || 'INR',
      recentStore: data.recentStore || '',
      lastUpdated: new Date().toISOString(),
    });
    await setDoc(userDocRef, sanitized, { merge: true });
    return true;
  } catch (error: any) {
    console.error('Failed to sync data to Firestore:', error);
    throw error;
  }
}

// Subscribe to real-time updates for a user
export function subscribeToUserData(
  userId: string, 
  onData: (data: UserCloudData, exists: boolean) => void,
  onError?: (error: Error) => void
) {
  if (!userId) return () => {};
  const userDocRef = doc(db, 'users', userId);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserCloudData;
        onData(data, true);
      } else {
        // Document doesn't exist yet on Firestore
        onData({
          items: [],
          trips: [],
          staples: [],
          budgets: [],
        }, false);
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}

// Fetch initial user data once
export async function fetchUserData(userId: string): Promise<UserCloudData | null> {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserCloudData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}
