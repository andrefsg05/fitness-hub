import { create } from 'zustand';
import { Habit } from '@/types';
import { getDatabase } from '@/db/database';
import { HabitRepository } from '@/db/repositories/habitRepository';

interface HabitsState {
  habits: Habit[];
  activeHabits: Habit[];
  isLoading: boolean;
  fetchHabits: () => Promise<void>;
  addHabit: (
    name: string,
    frequency?: 'daily' | 'weekdays' | 'weekly',
    reminderTime?: string | null
  ) => Promise<void>;
  toggleActive: (habitId: string, isActive: boolean) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
}

const getRepo = async () => {
  const db = await getDatabase();
  return new HabitRepository(db);
};

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  activeHabits: [],
  isLoading: false,

  fetchHabits: async () => {
    try {
      set({ isLoading: true });
      const repo = await getRepo();
      const [all, active] = await Promise.all([
        repo.getAll(),
        repo.getActive(),
      ]);
      set({ habits: all, activeHabits: active });
    } catch (err) {
      console.error('Error fetching habits in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addHabit: async (name, frequency = 'daily', reminderTime = null) => {
    const repo = await getRepo();
    await repo.create(name, frequency, reminderTime);
    await get().fetchHabits();
  },

  toggleActive: async (habitId, isActive) => {
    const repo = await getRepo();
    await repo.toggleActive(habitId, isActive);
    await get().fetchHabits();
  },

  deleteHabit: async (habitId) => {
    const repo = await getRepo();
    await repo.delete(habitId);
    await get().fetchHabits();
  },
}));
