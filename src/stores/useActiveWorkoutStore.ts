import { create } from 'zustand';
import { WorkoutWithDetails } from '@/types';
import { getDatabase } from '@/db/database';
import { WorkoutRepository } from '@/db/repositories/workoutRepository';
import { useWorkoutsStore } from '@/stores/useWorkoutsStore';

interface ActiveWorkoutState {
  activeWorkout: WorkoutWithDetails | null;
  isLoading: boolean;
  fetchActiveWorkout: () => Promise<void>;
  startWorkout: (workoutTypeId: string) => Promise<WorkoutWithDetails | null>;
  addExercise: (exerciseId: string) => Promise<void>;
  removeExercise: (workoutExerciseId: string) => Promise<void>;
  addSet: (
    workoutExerciseId: string,
    setNumber: number,
    weight: number,
    reps: number
  ) => Promise<void>;
  updateSet: (setId: string, weight: number, reps: number) => Promise<void>;
  deleteSet: (setId: string) => Promise<void>;
  finishWorkout: (notes?: string | null) => Promise<void>;
  discardWorkout: () => Promise<void>;
}

const getRepo = async () => {
  const db = await getDatabase();
  return new WorkoutRepository(db);
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  activeWorkout: null,
  isLoading: false,

  fetchActiveWorkout: async () => {
    try {
      set({ isLoading: true });
      const repo = await getRepo();
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
    } catch (err) {
      console.error('Error fetching active workout in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  startWorkout: async (workoutTypeId: string) => {
    try {
      const repo = await getRepo();
      await repo.startWorkout(workoutTypeId);
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
      return active;
    } catch (err) {
      console.error('Error starting workout in store:', err);
      return null;
    }
  },

  addExercise: async (exerciseId: string) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    try {
      const repo = await getRepo();
      await repo.addExerciseToWorkout(activeWorkout.id, exerciseId);
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
    } catch (err) {
      console.error('Error adding exercise in store:', err);
    }
  },

  removeExercise: async (workoutExerciseId: string) => {
    try {
      const repo = await getRepo();
      await repo.removeExerciseFromWorkout(workoutExerciseId);
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
    } catch (err) {
      console.error('Error removing exercise in store:', err);
    }
  },

  addSet: async (workoutExerciseId: string, setNumber: number, weight: number, reps: number) => {
    try {
      const repo = await getRepo();
      await repo.addSet(workoutExerciseId, setNumber, weight, reps);
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
    } catch (err) {
      console.error('Error adding set in store:', err);
    }
  },

  updateSet: async (setId: string, weight: number, reps: number) => {
    try {
      const repo = await getRepo();
      await repo.updateSet(setId, weight, reps);
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
    } catch (err) {
      console.error('Error updating set in store:', err);
    }
  },

  deleteSet: async (setId: string) => {
    try {
      const repo = await getRepo();
      await repo.deleteSet(setId);
      const active = await repo.getActiveWorkout();
      set({ activeWorkout: active });
    } catch (err) {
      console.error('Error deleting set in store:', err);
    }
  },

  finishWorkout: async (notes: string | null = null) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    try {
      const repo = await getRepo();
      await repo.finishWorkout(activeWorkout.id, notes);
      set({ activeWorkout: null });
      useWorkoutsStore.getState().fetchWorkouts();
    } catch (err) {
      console.error('Error finishing workout in store:', err);
    }
  },

  discardWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    try {
      const repo = await getRepo();
      await repo.discardWorkout(activeWorkout.id);
      set({ activeWorkout: null });
    } catch (err) {
      console.error('Error discarding workout in store:', err);
    }
  },
}));
