import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGuest: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isGuest: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  setGuestMode: () => void;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'guest_user',
    name: 'Guest Explorer',
    email: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    isGuest: true,
  },
  isGuest: true,
  isAuthModalOpen: false,
  authModalReason: 'Please sign in to continue',

  setGuestMode: () =>
    set({
      user: {
        id: 'guest_user',
        name: 'Guest Explorer',
        email: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        isGuest: true,
      },
      isGuest: true,
    }),

  signIn: (email: string, name = 'Design Curator') =>
    set({
      user: {
        id: 'user_101',
        name,
        email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        isGuest: false,
      },
      isGuest: false,
      isAuthModalOpen: false,
    }),

  signOut: () =>
    set({
      user: {
        id: 'guest_user',
        name: 'Guest Explorer',
        email: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        isGuest: true,
      },
      isGuest: true,
    }),

  openAuthModal: (reason = 'Please sign in to unlock this feature') =>
    set({ isAuthModalOpen: true, authModalReason: reason }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
