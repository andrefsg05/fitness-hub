import { create } from 'zustand';
import { BodyweightLog, Goal, User } from '@/types';
import { getDatabase } from '@/db/database';
import { UserRepository } from '@/db/repositories/userRepository';
import { WorkoutRepository } from '@/db/repositories/workoutRepository';
import { ExercisePrRepository } from '@/db/repositories/exercisePrRepository';

export interface MonthlyStats {
  workoutsCount: number;
  prsCount: number;
  monthName: string;
}

interface UserState {
  user: User | null;
  latestWeight: BodyweightLog | null;
  weightHistory: BodyweightLog[];
  goals: Goal[];
  monthlyStats: MonthlyStats;
  isLoading: boolean;
  isLoaded: boolean;
  fetchProfile: () => Promise<void>;
  completeOnboarding: (name: string, currentWeight: number) => Promise<void>;
  updateProfile: (name: string, targetWeight: number | null) => Promise<void>;
  logWeight: (weight: number, date?: string) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;
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
  monthlyStats: {
    workoutsCount: 0,
    prsCount: 0,
    monthName: '',
  },
  isLoading: false,
  isLoaded: false,

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const db = await getDatabase();
      const userRepo = new UserRepository(db);
      const workoutRepo = new WorkoutRepository(db);
      const prRepo = new ExercisePrRepository(db);

      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthName = now.toLocaleString('en-US', { month: 'long' });

      const [u, w, wh, g, workoutsCount, prsCount] = await Promise.all([
        userRepo.getUser(),
        userRepo.getLatestWeight(),
        userRepo.getWeightHistory(100),
        userRepo.getGoals(),
        workoutRepo.getCompletedWorkoutsCountForMonth(yearMonth),
        prRepo.getPRsCountForMonth(yearMonth),
      ]);

      set({
        user: u,
        latestWeight: w,
        weightHistory: wh,
        goals: g,
        monthlyStats: {
          workoutsCount,
          prsCount,
          monthName,
        },
      });
    } catch (err) {
      console.error('Error fetching user profile in store:', err);
    } finally {
      set({ isLoading: false, isLoaded: true });
    }
  },

  completeOnboarding: async (name: string, currentWeight: number) => {
    set({ isLoading: true });
    try {
      const repo = await getRepo();
      await repo.createUser(name);
      await repo.logWeight(currentWeight);
      await get().fetchProfile();
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

  deleteWeightLog: async (id: string) => {
    const repo = await getRepo();
    await repo.deleteWeightLog(id);
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
