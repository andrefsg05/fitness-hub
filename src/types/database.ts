export interface User {
  id: string;
  name: string;
  target_weight: number | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_date: string | null;
  is_completed: number; // 0 or 1
  created_at: string;
}

export interface BodyweightLog {
  id: string;
  user_id: string;
  weight: number;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: 'daily' | 'weekdays' | 'weekly';
  reminder_time: string | null; // HH:MM
  is_active: number; // 0 or 1
  last_checked?: string | null; // YYYY-MM-DD
  created_at: string;
}

export interface WorkoutType {
  id: string;
  name: string;
  is_custom: number; // 0 or 1
}

export interface Exercise {
  id: string;
  name: string;
  category: string; // Workout type or muscle category (e.g., "Push", "Pull", "Legs")
  is_custom: number; // 0 or 1
}

export type WorkoutStatus = 'in_progress' | 'completed';

export interface Workout {
  id: string;
  workout_type_id: string;
  date: string; // YYYY-MM-DD
  status: WorkoutStatus;
  notes: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order_index: number;
  notes: string | null;
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
}
