import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AvatarState {
    avatarId: number | null; // null means default initial
    customImage: string | null; // Base64 string for custom upload
    setAvatar: (id: number, customImage?: string | null) => void;
}

export const useAvatarStore = create<AvatarState>()(
    persist(
        (set) => ({
            avatarId: null,
            customImage: null,
            setAvatar: (id: number, customImage: string | null = null) =>
                set({ avatarId: id, customImage: customImage }),
        }),
        {
            name: 'user-avatar-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);
