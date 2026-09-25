import { create } from 'zustand';

export type TabIndex = 0 | 1 | 2;
export type TabName = 'home' | 'workouts' | 'profile';

const TAB_INDEX_MAP: Record<TabName, TabIndex> = {
  home: 0,
  workouts: 1,
  profile: 2,
};

interface TabNavigationState {
  activeTab: TabIndex;
  setActiveTab: (tab: TabIndex | TabName) => void;
}

export const useTabNavigationStore = create<TabNavigationState>((set) => ({
  activeTab: 0,
  setActiveTab: (tab) => {
    const index = typeof tab === 'string' ? TAB_INDEX_MAP[tab] : tab;
    set({ activeTab: index });
  },
}));
