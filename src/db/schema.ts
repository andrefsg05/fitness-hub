export const SCHEMA_SQL = `
-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_weight REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Goals
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target_date TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bodyweight Logs
CREATE TABLE IF NOT EXISTS bodyweight_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  weight REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Habits
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT NOT NULL,
  reminder_time TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_checked TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Workout Types
CREATE TABLE IF NOT EXISTS workout_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_custom INTEGER NOT NULL DEFAULT 0
);

-- 6. Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0
);

-- 7. Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  workout_type_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (workout_type_id) REFERENCES workout_types(id)
);

-- 8. Workout Exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- 9. Workout Sets
CREATE TABLE IF NOT EXISTS workout_sets (
  id TEXT PRIMARY KEY,
  workout_exercise_id TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight REAL NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_workouts_status_date ON workouts(status, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_bodyweight_logs_date ON bodyweight_logs(date DESC);
`;
