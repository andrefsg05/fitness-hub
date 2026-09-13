import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { WorkoutSummary } from '@/types';

export function useWorkouts() {
  const { workoutRepo, isReady } = useDatabase();
  const [lastWorkout, setLastWorkout] = useState<WorkoutSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [history, setHistory] = useState<WorkoutSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkouts = useCallback(async () => {
    if (!workoutRepo || !isReady) return;

    try {
      setIsLoading(true);
      const [last, recent, all] = await Promise.all([
        workoutRepo.getLastCompletedWorkout(),
        workoutRepo.getRecentWorkouts(3),
        workoutRepo.getWorkoutHistory(50, 0),
      ]);

      setLastWorkout(last);
      setRecentWorkouts(recent);
      setHistory(all);
    } catch (err) {
      console.error('Error fetching workouts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [workoutRepo, isReady]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    lastWorkout,
    recentWorkouts,
    history,
    isLoading,
    refresh: fetchWorkouts,
  };
}
