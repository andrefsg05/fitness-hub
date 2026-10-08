import { create } from 'zustand';

export type TabIndex = 0 | 1 | 2;
export type TabName = 'home' | 'workouts' | 'profile';
export type ProfileTabKey = 'progress' | 'goals' | 'reminders' | 'settings';

const TAB_INDEX_MAP: Record<TabName, TabIndex> = {
  home: 0,
  workouts: 1,
  profile: 2,
};

interface TabNavigationState {
  activeTab: TabIndex;
  profileTab: ProfileTabKey;
  setActiveTab: (tab: TabIndex | TabName) => void;
  setProfileTab: (tab: ProfileTabKey) => void;
}

export const useTabNavigationStore = create<TabNavigationState>((set) => ({
  activeTab: 0,
  profileTab: 'progress',
  setActiveTab: (tab) => {
    const index = typeof tab === 'string' ? TAB_INDEX_MAP[tab] : tab;
    set({ activeTab: index });
  },
  setProfileTab: (tab) => set({ profileTab: tab }),
}));
