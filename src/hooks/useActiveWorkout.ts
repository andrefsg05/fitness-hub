import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { WorkoutWithDetails } from '@/types';

export function useActiveWorkout() {
  const { workoutRepo, isReady } = useDatabase();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveWorkout = useCallback(async () => {
    if (!workoutRepo || !isReady) return;

    try {
      setIsLoading(true);
      const active = await workoutRepo.getActiveWorkout();
      setActiveWorkout(active);
    } catch (err) {
      console.error('Error fetching active workout:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workoutRepo, isReady]);

  useEffect(() => {
    fetchActiveWorkout();
  }, [fetchActiveWorkout]);

  const startWorkout = async (workoutTypeId: string) => {
    if (!workoutRepo) return null;
    const workout = await workoutRepo.startWorkout(workoutTypeId);
    await fetchActiveWorkout();
    return workout;
  };

  const addExercise = async (exerciseId: string) => {
    if (!workoutRepo || !activeWorkout) return;
    await workoutRepo.addExerciseToWorkout(activeWorkout.id, exerciseId);
    await fetchActiveWorkout();
  };

  const removeExercise = async (workoutExerciseId: string) => {
    if (!workoutRepo) return;
    await workoutRepo.removeExerciseFromWorkout(workoutExerciseId);
    await fetchActiveWorkout();
  };

  const addSet = async (workoutExerciseId: string, setNumber: number, weight: number, reps: number) => {
    if (!workoutRepo) return;
    await workoutRepo.addSet(workoutExerciseId, setNumber, weight, reps);
    await fetchActiveWorkout();
  };

  const updateSet = async (setId: string, weight: number, reps: number) => {
    if (!workoutRepo) return;
    await workoutRepo.updateSet(setId, weight, reps);
    await fetchActiveWorkout();
  };

  const deleteSet = async (setId: string) => {
    if (!workoutRepo) return;
    await workoutRepo.deleteSet(setId);
    await fetchActiveWorkout();
  };

  const finishWorkout = async (notes: string | null = null) => {
    if (!workoutRepo || !activeWorkout) return;
    await workoutRepo.finishWorkout(activeWorkout.id, notes);
    setActiveWorkout(null);
  };

  const discardWorkout = async () => {
    if (!workoutRepo || !activeWorkout) return;
    await workoutRepo.discardWorkout(activeWorkout.id);
    setActiveWorkout(null);
  };

  return {
    activeWorkout,
    isLoading,
    refresh: fetchActiveWorkout,
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    deleteSet,
    finishWorkout,
    discardWorkout,
  };
}
