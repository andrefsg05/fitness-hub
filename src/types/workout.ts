import { Exercise, Workout, WorkoutExercise, WorkoutSet, WorkoutType } from './database';

export interface WorkoutSetInput {
  set_number: number;
  weight: number;
  reps: number;
}

export interface WorkoutExerciseWithDetails extends WorkoutExercise {
  exercise_name: string;
  category: string;
  sets: WorkoutSet[];
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
