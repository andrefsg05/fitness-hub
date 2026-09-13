import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase, initializeDatabase } from '@/db/database';
import {
  ExerciseRepository,
  HabitRepository,
  UserRepository,
  WorkoutRepository,
  WorkoutTypeRepository,
} from '@/db/repositories';

interface DatabaseContextValue {
  isReady: boolean;
  error: Error | null;
  db: SQLiteDatabase | null;
  userRepo: UserRepository | null;
  habitRepo: HabitRepository | null;
  workoutTypeRepo: WorkoutTypeRepository | null;
  exerciseRepo: ExerciseRepository | null;
  workoutRepo: WorkoutRepository | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  isReady: false,
  error: null,
  db: null,
  userRepo: null,
  habitRepo: null,
  workoutTypeRepo: null,
  exerciseRepo: null,
  workoutRepo: null,
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [repos, setRepos] = useState<Omit<DatabaseContextValue, 'isReady' | 'error'>>({
    db: null,
    userRepo: null,
    habitRepo: null,
    workoutTypeRepo: null,
    exerciseRepo: null,
    workoutRepo: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const database = await getDatabase();
        await initializeDatabase(database);

        if (isMounted) {
          setRepos({
            db: database,
            userRepo: new UserRepository(database),
            habitRepo: new HabitRepository(database),
            workoutTypeRepo: new WorkoutTypeRepository(database),
            exerciseRepo: new ExerciseRepository(database),
            workoutRepo: new WorkoutRepository(database),
          });
          setIsReady(true);
        }
      } catch (err: any) {
        console.error('Failed to initialize SQLite Database:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, error, ...repos }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export function useDatabase(): DatabaseContextValue {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
