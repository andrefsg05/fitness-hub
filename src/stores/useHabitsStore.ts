import { create } from 'zustand';
import { Habit } from '@/types';
import { getDatabase } from '@/db/database';
import { HabitRepository } from '@/db/repositories/habitRepository';
import {
  getTodayDateString,
  scheduleHabitReminder,
  cancelHabitReminder,
  syncAllHabitsNotifications,
} from '@/services/notificationService';

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
  toggleCheckHabit: (habitId: string) => Promise<void>;
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
      // Sync notifications in background
      syncAllHabitsNotifications(active).catch((err) =>
        console.warn('Error syncing notifications in fetchHabits:', err)
      );
    } catch (err) {
      console.error('Error fetching habits in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  addHabit: async (name, frequency = 'daily', reminderTime = null) => {
    const repo = await getRepo();
    const newHabit = await repo.create(name, frequency, reminderTime);
    if (newHabit.is_active && newHabit.reminder_time) {
      scheduleHabitReminder(newHabit).catch(console.warn);
    }
    await get().fetchHabits();
  },

  toggleActive: async (habitId, isActive) => {
    const repo = await getRepo();
    await repo.toggleActive(habitId, isActive);
    const updatedHabits = get().habits.map((h) =>
      h.id === habitId ? { ...h, is_active: isActive ? 1 : 0 } : h
    );
    const target = updatedHabits.find((h) => h.id === habitId);
    if (target) {
      if (isActive && target.reminder_time) {
        scheduleHabitReminder(target).catch(console.warn);
      } else {
        cancelHabitReminder(habitId).catch(console.warn);
      }
    }
    await get().fetchHabits();
  },

  toggleCheckHabit: async (habitId) => {
    const todayStr = getTodayDateString();
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isCurrentlyChecked = habit.last_checked === todayStr;
    const nextChecked = !isCurrentlyChecked;
    const nextLastChecked = nextChecked ? todayStr : null;

    // Optimistic UI update
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, last_checked: nextLastChecked } : h
      ),
      activeHabits: state.activeHabits.map((h) =>
        h.id === habitId ? { ...h, last_checked: nextLastChecked } : h
      ),
    }));

    try {
      const repo = await getRepo();
      await repo.toggleCheckIn(habitId, nextChecked, todayStr);

      const updatedHabit: Habit = {
        ...habit,
        last_checked: nextLastChecked,
      };

      // Reschedule or update notification based on new status
      if (updatedHabit.is_active && updatedHabit.reminder_time) {
        scheduleHabitReminder(updatedHabit).catch(console.warn);
      }
    } catch (err) {
      console.error('Error toggling habit check:', err);
      // Revert on error
      await get().fetchHabits();
    }
  },

  deleteHabit: async (habitId) => {
    cancelHabitReminder(habitId).catch(console.warn);
    const repo = await getRepo();
    await repo.delete(habitId);
    await get().fetchHabits();
  },
}));
