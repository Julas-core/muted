import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

WebBrowser.maybeCompleteAuthSession();

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatar_url?: string;
  birth_month?: string;
  birth_year?: string;
  country?: string;
  categories?: string[];
  onboarding_complete?: boolean;
  isGuest: boolean;
  created_at?: any;
}

interface AuthState {
  user: UserProfile | null;
  firebaseUser: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  setGuestMode: () => void;
  signIn: (email: string, name?: string) => void;
  signInWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  initSessionListener: () => () => void;
}

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest_user',
  name: 'Guest Explorer',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  isGuest: true,
  onboarding_complete: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isGuest: false,
  isLoading: true,
  isInitialized: false,
  isAuthModalOpen: false,
  authModalReason: 'Please sign in to continue',

  initSessionListener: () => {
    if (!isFirebaseConfigured) {
      // In demo mode without live Firebase keys, initialize without active user
      set({ isLoading: false, isInitialized: true, user: null, isGuest: false });
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        set({
          firebaseUser: null,
          user: get().isGuest ? DEFAULT_GUEST_USER : null,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      try {
        const profileRef = doc(db, 'profiles', currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          set({
            firebaseUser: currentUser,
            isGuest: false,
            isLoading: false,
            isInitialized: true,
            user: {
              id: currentUser.uid,
              email: currentUser.email || '',
              name: profileData.name || currentUser.displayName || 'Design Curator',
              avatar: profileData.avatar_url || currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
              avatar_url: profileData.avatar_url || currentUser.photoURL || '',
              birth_month: profileData.birth_month || '',
              birth_year: profileData.birth_year || '',
              country: profileData.country || '',
              categories: profileData.categories || [],
              onboarding_complete: Boolean(profileData.onboarding_complete),
              isGuest: false,
            },
          });
        } else {
          // Document does not exist yet; create default profile row
          const initialProfile = {
            id: currentUser.uid,
            name: currentUser.displayName || 'Design Curator',
            email: currentUser.email || '',
            avatar_url: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
            categories: [],
            onboarding_complete: false,
            created_at: serverTimestamp(),
          };

          await setDoc(profileRef, initialProfile, { merge: true });

          set({
            firebaseUser: currentUser,
            isGuest: false,
            isLoading: false,
            isInitialized: true,
            user: {
              ...initialProfile,
              avatar: initialProfile.avatar_url,
              isGuest: false,
            },
          });
        }
      } catch (err) {
        console.warn('Error fetching Firestore profile:', err);
        set({
          firebaseUser: currentUser,
          isGuest: false,
          isLoading: false,
          isInitialized: true,
          user: {
            id: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || 'Design Curator',
            avatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
            onboarding_complete: false,
            isGuest: false,
          },
        });
      }
    });

    return unsubscribe;
  },

  setGuestMode: () =>
    set({
      user: DEFAULT_GUEST_USER,
      isGuest: true,
      isLoading: false,
      isInitialized: true,
    }),

  signIn: (email: string, name = 'Design Curator') =>
    set({
      user: {
        id: 'user_101',
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        isGuest: false,
        onboarding_complete: false,
      },
      isGuest: false,
      isAuthModalOpen: false,
    }),

  signInWithEmail: async (email: string, password = 'MutedPassword123!') => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!isFirebaseConfigured) {
      // Mock / Offline mode fallback
      set({
        user: {
          id: `demo_${Date.now()}`,
          name: trimmedEmail.split('@')[0],
          email: trimmedEmail,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
          isGuest: false,
          onboarding_complete: false,
        },
        isGuest: false,
        isLoading: false,
      });
      return { success: true };
    }

    try {
      set({ isLoading: true });
      // Attempt sign in with email/password
      try {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } catch (signInErr: any) {
        // If user not found, automatically register them (seamless passwordless feel)
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        } else {
          throw signInErr;
        }
      }
      return { success: true };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message || 'Authentication failed.' };
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true });

      if (Platform.OS === 'web' && isFirebaseConfigured) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        return { success: true };
      }

      // Native / Fallback Google flow
      if (!isFirebaseConfigured) {
        // Mock fallback for immediate preview and testing
        set({
          user: {
            id: `google_${Date.now()}`,
            name: 'Google Explorer',
            email: 'google_user@muted.app',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            isGuest: false,
            onboarding_complete: false,
          },
          isGuest: false,
          isLoading: false,
        });
        return { success: true };
      }

      // Native OAuth using AuthSession
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'muted' });
      const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

      if (!googleClientId) {
        // If Google Client ID is not yet provided in env, fallback cleanly
        set({
          user: {
            id: `google_${Date.now()}`,
            name: 'Google Explorer',
            email: 'google_user@muted.app',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            isGuest: false,
            onboarding_complete: false,
          },
          isGuest: false,
          isLoading: false,
        });
        return { success: true };
      }

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&response_type=token&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      if (result.type === 'success' && result.url) {
        const parsed = new URL(result.url);
        const params = new URLSearchParams(parsed.hash.substring(1) || parsed.search.substring(1));
        const idToken = params.get('id_token') || params.get('access_token');
        if (idToken) {
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
          return { success: true };
        }
      }

      set({ isLoading: false });
      return { success: false, error: 'Google sign in was cancelled.' };
    } catch (err: any) {
      set({ isLoading: false });
      return { success: false, error: err.message || 'Google sign-in error.' };
    }
  },

  signOut: async () => {
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.warn('Error signing out of Firebase:', err);
    } finally {
      set({
        user: null,
        firebaseUser: null,
        isGuest: false,
      });
    }
  },

  updateProfileData: async (data: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({
      user: {
        ...currentUser,
        ...data,
      },
    });

    if (isFirebaseConfigured && !currentUser.isGuest) {
      try {
        const profileRef = doc(db, 'profiles', currentUser.id);
        await updateDoc(profileRef, {
          ...data,
          updated_at: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error updating profile in Firestore:', err);
      }
    }
  },

  setOnboardingComplete: async (complete: boolean) => {
    const currentUser = get().user;
    if (!currentUser) return;

    set({
      user: {
        ...currentUser,
        onboarding_complete: complete,
      },
    });

    if (isFirebaseConfigured && !currentUser.isGuest) {
      try {
        const profileRef = doc(db, 'profiles', currentUser.id);
        await updateDoc(profileRef, {
          onboarding_complete: complete,
          updated_at: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Error updating onboarding_complete in Firestore:', err);
      }
    }
  },

  openAuthModal: (reason = 'Please sign in to unlock this feature') =>
    set({ isAuthModalOpen: true, authModalReason: reason }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
