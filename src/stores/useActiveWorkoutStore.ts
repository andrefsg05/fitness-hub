import { getDatabase } from '@/db/database';
import { WorkoutRepository } from '@/db/repositories/workoutRepository';
import { useWorkoutsStore } from '@/stores/useWorkoutsStore';
import { WorkoutWithDetails } from '@/types';
import { create } from 'zustand';

interface ActiveWorkoutState {
  activeWorkout: WorkoutWithDetails | null;
  isLoading: boolean;
  fetchActiveWorkout: () => Promise<void>;
  startWorkout: (workoutTypeId: string) => Promise<WorkoutWithDetails | null>;
  copyWorkout: (
    sourceWorkout: WorkoutWithDetails
  ) => Promise<{ isNew: boolean; count: number }>;
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

  copyWorkout: async (sourceWorkout: WorkoutWithDetails) => {
    try {
      const repo = await getRepo();
      const currentActive = get().activeWorkout ?? (await repo.getActiveWorkout());

      if (!currentActive) {
        const newWorkout = await repo.createWorkoutFromTemplate(sourceWorkout);
        set({ activeWorkout: newWorkout });
        return { isNew: true, count: newWorkout.exercises.length };
      } else {
        const count = await repo.copyMissingExercisesToWorkout(
          currentActive.id,
          sourceWorkout.exercises
        );
        const updated = await repo.getActiveWorkout();
        set({ activeWorkout: updated });
        return { isNew: false, count };
      }
    } catch (err) {
      console.error('Error copying workout in store:', err);
      throw err;
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
