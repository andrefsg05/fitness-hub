import { getDatabase } from '@/db/database';
import { ExercisePrRepository } from '@/db/repositories/exercisePrRepository';
import { WorkoutRepository } from '@/db/repositories/workoutRepository';
import { annotateSetsWithPRs } from '@/services/prService';
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
  addDropSet: (
    workoutSetId: string,
    weight: number,
    reps: number
  ) => Promise<void>;
  updateDropSet: (
    dropSetId: string,
    weight: number,
    reps: number
  ) => Promise<void>;
  deleteDropSet: (dropSetId: string) => Promise<void>;
  finishWorkout: (notes?: string | null) => Promise<void>;
  discardWorkout: () => Promise<void>;
}

const getRepos = async () => {
  const db = await getDatabase();
  return {
    workoutRepo: new WorkoutRepository(db),
    prRepo: new ExercisePrRepository(db),
  };
};

async function enrichWithLivePRs(
  workout: WorkoutWithDetails | null,
  prRepo: ExercisePrRepository
): Promise<WorkoutWithDetails | null> {
  if (!workout) return null;

  const exerciseIds = workout.exercises.map((e) => e.exercise_id);
  if (exerciseIds.length === 0) return workout;

  const activePRs = await prRepo.getActivePRsForExercises(exerciseIds);

  const enrichedExercises = workout.exercises.map((ex) => {
    const currentPR = activePRs[ex.exercise_id] || null;
    return {
      ...ex,
      sets: annotateSetsWithPRs(ex.sets, currentPR),
    };
  });

  return {
    ...workout,
    exercises: enrichedExercises,
  };
}

const refreshActiveWorkout = async (
  workoutRepo: WorkoutRepository,
  prRepo: ExercisePrRepository,
  set: (state: Partial<ActiveWorkoutState>) => void
): Promise<WorkoutWithDetails | null> => {
  const active = await workoutRepo.getActiveWorkout();
  const enriched = await enrichWithLivePRs(active, prRepo);
  set({ activeWorkout: enriched });
  return enriched;
};

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  activeWorkout: null,
  isLoading: false,

  fetchActiveWorkout: async () => {
    try {
      set({ isLoading: true });
      const { workoutRepo, prRepo } = await getRepos();
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error fetching active workout in store:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  startWorkout: async (workoutTypeId: string) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.startWorkout(workoutTypeId);
      return await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error starting workout in store:', err);
      return null;
    }
  },

  copyWorkout: async (sourceWorkout: WorkoutWithDetails) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      const currentActive = get().activeWorkout ?? (await workoutRepo.getActiveWorkout());

      if (!currentActive) {
        const newWorkout = await workoutRepo.createWorkoutFromTemplate(sourceWorkout);
        const enriched = await refreshActiveWorkout(workoutRepo, prRepo, set);
        return { isNew: true, count: enriched?.exercises.length ?? newWorkout.exercises.length };
      } else {
        const count = await workoutRepo.copyMissingExercisesToWorkout(
          currentActive.id,
          sourceWorkout.exercises
        );
        await refreshActiveWorkout(workoutRepo, prRepo, set);
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
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.addExerciseToWorkout(activeWorkout.id, exerciseId);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error adding exercise in store:', err);
    }
  },

  removeExercise: async (workoutExerciseId: string) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.removeExerciseFromWorkout(workoutExerciseId);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error removing exercise in store:', err);
    }
  },

  addSet: async (workoutExerciseId: string, setNumber: number, weight: number, reps: number) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.addSet(workoutExerciseId, setNumber, weight, reps);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error adding set in store:', err);
    }
  },

  updateSet: async (setId: string, weight: number, reps: number) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.updateSet(setId, weight, reps);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error updating set in store:', err);
    }
  },

  deleteSet: async (setId: string) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.deleteSet(setId);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error deleting set in store:', err);
    }
  },

  addDropSet: async (workoutSetId: string, weight: number, reps: number) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.addDropSet(workoutSetId, weight, reps);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error adding drop set in store:', err);
    }
  },

  updateDropSet: async (dropSetId: string, weight: number, reps: number) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.updateDropSet(dropSetId, weight, reps);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error updating drop set in store:', err);
    }
  },

  deleteDropSet: async (dropSetId: string) => {
    try {
      const { workoutRepo, prRepo } = await getRepos();
      await workoutRepo.deleteDropSet(dropSetId);
      await refreshActiveWorkout(workoutRepo, prRepo, set);
    } catch (err) {
      console.error('Error deleting drop set in store:', err);
    }
  },

  finishWorkout: async (notes: string | null = null) => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    try {
      const { workoutRepo } = await getRepos();
      await workoutRepo.finishWorkout(activeWorkout.id, notes);
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
      const { workoutRepo } = await getRepos();
      await workoutRepo.discardWorkout(activeWorkout.id);
      set({ activeWorkout: null });
    } catch (err) {
      console.error('Error discarding workout in store:', err);
    }
  },
}));
