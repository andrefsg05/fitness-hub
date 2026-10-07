import { ExerciseStagnationAlertMode, Workout, WorkoutExercise, WorkoutSet } from './database';

export interface WorkoutSetInput {
  set_number: number;
  weight: number;
  reps: number;
}

export interface WorkoutDropSetInput {
  drop_order: number;
  weight: number;
  reps: number;
}


export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise_name: string;
  category: string;
  sets: WorkoutSet[];
  active_pr?: { weight: number; reps: number } | null;
}

export interface WorkoutWithDetails extends Workout {
  workout_type_name: string;
  exercises: WorkoutExerciseWithDetails[];
  total_sets: number;
  total_volume: number; // calculated sum(weight * reps)
}

export interface WorkoutSummary {
  id: string;
  workout_type_id: string;
  workout_type_name: string;
  date: string;
  status: Workout['status'];
  total_exercises: number;
  total_sets: number;
  total_volume: number;
  notes: string | null;
  created_at: string;
}

export interface WorkoutPrAchievement {
  id: string;
  exercise_id: string;
  exercise_name: string;
  workout_set_id: string;
  weight: number;
  reps: number;
  achieved_at: string;
}

export interface ExerciseStagnationAlert {
  exercise_id: string;
  exercise_name: string;
  non_pr_workout_count: number;
  alert_mode: ExerciseStagnationAlertMode;
  pr_weight: number;
  pr_reps: number;
}

export interface WorkoutCompletionInsights {
  prs: WorkoutPrAchievement[];
  stagnationAlerts: ExerciseStagnationAlert[];
  previousVolume: number | null;
  volumeDelta: number | null;
  volumeDeltaPercentage: number | null;
  hasVolumeImprovement: boolean;
  isFirstWorkoutOfType: boolean;
}
