import { ExercisePR } from '@/types';
import type { SQLiteDatabase } from 'expo-sqlite';

export class ExercisePrRepository {
  constructor(private db: SQLiteDatabase) {}

  async getActivePR(exerciseId: string): Promise<ExercisePR | null> {
    return await this.db.getFirstAsync<ExercisePR>(
      'SELECT id, exercise_id, workout_set_id, weight, reps, is_active, achieved_at FROM exercise_prs WHERE exercise_id = ? AND is_active = 1',
      exerciseId
    );
  }

  async getActivePRsForExercises(exerciseIds: string[]): Promise<Record<string, ExercisePR>> {
    if (exerciseIds.length === 0) {
      return {};
    }

    const placeholders = exerciseIds.map(() => '?').join(',');
    const rows = await this.db.getAllAsync<ExercisePR>(
      `SELECT id, exercise_id, workout_set_id, weight, reps, is_active, achieved_at 
       FROM exercise_prs 
       WHERE exercise_id IN (${placeholders}) AND is_active = 1`,
      ...exerciseIds
    );

    const record: Record<string, ExercisePR> = {};
    for (const row of rows) {
      record[row.exercise_id] = row;
    }
    return record;
  }

  async getPRHistory(exerciseId: string): Promise<ExercisePR[]> {
    return await this.db.getAllAsync<ExercisePR>(
      `SELECT id, exercise_id, workout_set_id, weight, reps, is_active, achieved_at 
       FROM exercise_prs 
       WHERE exercise_id = ? 
       ORDER BY achieved_at DESC`,
      exerciseId
    );
  }

  async saveNewPR(
    exerciseId: string,
    workoutSetId: string,
    weight: number,
    reps: number
  ): Promise<ExercisePR> {
    const id = `pr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const achievedAt = new Date().toISOString();

    await this.db.runAsync(
      'UPDATE exercise_prs SET is_active = 0 WHERE exercise_id = ? AND is_active = 1',
      exerciseId
    );

    await this.db.runAsync(
      `INSERT INTO exercise_prs (id, exercise_id, workout_set_id, weight, reps, is_active, achieved_at) 
       VALUES (?, ?, ?, ?, ?, 1, ?)`,
      id,
      exerciseId,
      workoutSetId,
      weight,
      reps,
      achievedAt
    );

    return {
      id,
      exercise_id: exerciseId,
      workout_set_id: workoutSetId,
      weight,
      reps,
      is_active: 1,
      achieved_at: achievedAt,
    };
  }
}
