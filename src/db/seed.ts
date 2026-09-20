import type { SQLiteDatabase } from 'expo-sqlite';

export const SEED_WORKOUT_TYPES = [
  { id: 'wt-push', name: 'Push', is_custom: 0 },
  { id: 'wt-pull', name: 'Pull', is_custom: 0 },
  { id: 'wt-legs', name: 'Legs', is_custom: 0 },
  { id: 'wt-upper', name: 'Upper Body', is_custom: 0 },
  { id: 'wt-lower', name: 'Lower Body', is_custom: 0 },
  { id: 'wt-fullbody', name: 'Full Body', is_custom: 0 },
  { id: 'wt-cardio', name: 'Cardio', is_custom: 0 },
];

export const SEED_EXERCISES = [
  // Push exercises
  { id: 'ex-bench-press', name: 'Barbell Bench Press', category: 'Push', is_custom: 0 },
  { id: 'ex-incline-db-press', name: 'Incline Dumbbell Press', category: 'Push', is_custom: 0 },
  { id: 'ex-overhead-press', name: 'Overhead Press (OHP)', category: 'Push', is_custom: 0 },
  { id: 'ex-lateral-raise', name: 'Dumbbell Lateral Raise', category: 'Push', is_custom: 0 },
  { id: 'ex-triceps-pushdown', name: 'Triceps Rope Pushdown', category: 'Push', is_custom: 0 },
  { id: 'ex-dips', name: 'Triceps Dips', category: 'Push', is_custom: 0 },
  { id: 'ex-cable-flyes', name: 'Cable Chest Flyes', category: 'Push', is_custom: 0 },

  // Pull exercises
  { id: 'ex-deadlift', name: 'Barbell Deadlift', category: 'Pull', is_custom: 0 },
  { id: 'ex-barbell-row', name: 'Barbell Bent-Over Row', category: 'Pull', is_custom: 0 },
  { id: 'ex-lat-pulldown', name: 'Lat Pulldown', category: 'Pull', is_custom: 0 },
  { id: 'ex-seated-cable-row', name: 'Seated Cable Row', category: 'Pull', is_custom: 0 },
  { id: 'ex-face-pull', name: 'Face Pull', category: 'Pull', is_custom: 0 },
  { id: 'ex-db-bicep-curl', name: 'Incline Dumbbell Curl', category: 'Pull', is_custom: 0 },
  { id: 'ex-hammer-curl', name: 'Dumbbell Hammer Curl', category: 'Pull', is_custom: 0 },

  // Legs exercises
  { id: 'ex-back-squat', name: 'Barbell Back Squat', category: 'Legs', is_custom: 0 },
  { id: 'ex-romanian-deadlift', name: 'Romanian Deadlift (RDL)', category: 'Legs', is_custom: 0 },
  { id: 'ex-leg-press', name: 'Leg Press', category: 'Legs', is_custom: 0 },
  { id: 'ex-leg-extension', name: 'Leg Extension', category: 'Legs', is_custom: 0 },
  { id: 'ex-leg-curl', name: 'Lying Leg Curl', category: 'Legs', is_custom: 0 },
  { id: 'ex-standing-calf-raise', name: 'Standing Calf Raise', category: 'Legs', is_custom: 0 },
  { id: 'ex-bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs', is_custom: 0 },

  // Upper Body exercises
  { id: 'ex-pull-up', name: 'Pull-Up', category: 'Upper Body', is_custom: 0 },
  { id: 'ex-db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'Upper Body', is_custom: 0 },
  { id: 'ex-chest-supported-row', name: 'Chest Supported Row', category: 'Upper Body', is_custom: 0 },
  { id: 'ex-skull-crusher', name: 'Skull Crusher', category: 'Upper Body', is_custom: 0 },

  // Lower Body exercises
  { id: 'ex-front-squat', name: 'Barbell Front Squat', category: 'Lower Body', is_custom: 0 },
  { id: 'ex-hip-thrust', name: 'Barbell Hip Thrust', category: 'Lower Body', is_custom: 0 },
  { id: 'ex-seated-calf-raise', name: 'Seated Calf Raise', category: 'Lower Body', is_custom: 0 },

  // Full Body exercises
  { id: 'ex-clean-press', name: 'Clean & Press', category: 'Full Body', is_custom: 0 },
  { id: 'ex-trap-bar-deadlift', name: 'Trap Bar Deadlift', category: 'Full Body', is_custom: 0 },
  { id: 'ex-push-up', name: 'Push-Up', category: 'Full Body', is_custom: 0 },
  { id: 'ex-kettlebell-swing', name: 'Kettlebell Swing', category: 'Full Body', is_custom: 0 },

  // Cardio exercises
  { id: 'ex-treadmill', name: 'Treadmill Running', category: 'Cardio', is_custom: 0 },
  { id: 'ex-rowing', name: 'Rowing Machine', category: 'Cardio', is_custom: 0 },
  { id: 'ex-stationary-bike', name: 'Stationary Bike', category: 'Cardio', is_custom: 0 },
];

export const DEFAULT_USER_ID = 'user-primary';

export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  // Seed workout types
  for (const type of SEED_WORKOUT_TYPES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO workout_types (id, name, is_custom) VALUES (?, ?, ?)',
      type.id,
      type.name,
      type.is_custom
    );
  }

  // Seed exercises
  for (const ex of SEED_EXERCISES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO exercises (id, name, category, is_custom) VALUES (?, ?, ?, ?)',
      ex.id,
      ex.name,
      ex.category,
      ex.is_custom
    );
  }
}
