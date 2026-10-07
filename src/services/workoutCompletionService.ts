import {
  WorkoutCompletionInsights,
  WorkoutPrAchievement,
  WorkoutWithDetails,
} from '@/types';

export function buildWorkoutCompletionInsights(
  workout: WorkoutWithDetails,
  previousWorkout: WorkoutWithDetails | null,
  prs: WorkoutPrAchievement[]
): WorkoutCompletionInsights {
  const previousVolume = previousWorkout?.total_volume ?? null;
  const volumeDelta = previousVolume === null
    ? null
    : workout.total_volume - previousVolume;
  const hasVolumeImprovement = volumeDelta !== null && volumeDelta > 0;
  const volumeDeltaPercentage = volumeDelta !== null && volumeDelta > 0 && previousVolume !== null && previousVolume > 0
    ? (volumeDelta / previousVolume) * 100
    : null;

  return {
    prs,
    previousVolume,
    volumeDelta,
    volumeDeltaPercentage,
    hasVolumeImprovement,
    isFirstWorkoutOfType: previousWorkout === null,
  };
}
