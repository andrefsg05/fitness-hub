import { create } from 'zustand';
import { BodyweightLog, Goal, User } from '@/types';
import { getDatabase } from '@/db/database';
import { UserRepository } from '@/db/repositories/userRepository';

interface UserState {
  user: User | null;
  latestWeight: BodyweightLog | null;
  weightHistory: BodyweightLog[];
  goals: Goal[];
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (name: string, targetWeight: number | null) => Promise<void>;
  logWeight: (weight: number, date?: string) => Promise<void>;
  addGoal: (title: string, targetDate?: string | null) => Promise<void>;
  toggleGoal: (goalId: string, isCompleted: boolean) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

const getRepo = async () => {
  const db = await getDatabase();
  return new UserRepository(db);
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  latestWeight: null,
  weightHistory: [],
  goals: [],
  isLoading: false,

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const repo = await getRepo();
      const [u, w, wh, g] = await Promise.all([
        repo.getUser(),
        repo.getLatestWeight(),
        repo.getWeightHistory(30),
        repo.getGoals(),
      ]);

      set({
        user: u,
        latestWeight: w,
        weightHistory: wh,
        goals: g,
      });
    } catch (err) {
      console.error('Error fetching user profile in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (name: string, targetWeight: number | null) => {
    const { user } = get();
    const repo = await getRepo();
    await repo.updateProfile(user?.id, name, targetWeight);
    await get().fetchProfile();
  },

  logWeight: async (weight: number, date?: string) => {
    const repo = await getRepo();
    await repo.logWeight(weight, date);
    await get().fetchProfile();
  },

  addGoal: async (title: string, targetDate: string | null = null) => {
    const repo = await getRepo();
    await repo.createGoal(title, targetDate);
    await get().fetchProfile();
  },

  toggleGoal: async (goalId: string, isCompleted: boolean) => {
    const repo = await getRepo();
    await repo.toggleGoalCompletion(goalId, isCompleted);
    await get().fetchProfile();
  },

  deleteGoal: async (goalId: string) => {
    const repo = await getRepo();
    await repo.deleteGoal(goalId);
    await get().fetchProfile();
  },
}));
