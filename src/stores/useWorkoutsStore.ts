import { create } from 'zustand';
import { WorkoutSummary } from '@/types';
import { getDatabase } from '@/db/database';
import { WorkoutRepository } from '@/db/repositories/workoutRepository';

interface WorkoutsState {
  lastWorkout: WorkoutSummary | null;
  recentWorkouts: WorkoutSummary[];
  history: WorkoutSummary[];
  isLoading: boolean;
  fetchWorkouts: () => Promise<void>;
}

const getRepo = async () => {
  const db = await getDatabase();
  return new WorkoutRepository(db);
};

export const useWorkoutsStore = create<WorkoutsState>((set) => ({
  lastWorkout: null,
  recentWorkouts: [],
  history: [],
  isLoading: false,

  fetchWorkouts: async () => {
    try {
      set({ isLoading: true });
      const repo = await getRepo();
      const [last, recent, all] = await Promise.all([
        repo.getLastCompletedWorkout(),
        repo.getRecentWorkouts(3),
        repo.getWorkoutHistory(50, 0),
      ]);

      set({
        lastWorkout: last,
        recentWorkouts: recent,
        history: all,
      });
    } catch (err) {
      console.error('Error fetching workouts in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
