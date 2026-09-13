import type { SQLiteDatabase } from 'expo-sqlite';
import { WorkoutType } from '@/types';

export class WorkoutTypeRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<WorkoutType[]> {
    return await this.db.getAllAsync<WorkoutType>(
      'SELECT id, name, is_custom FROM workout_types ORDER BY is_custom ASC, name ASC'
    );
  }

  async getById(id: string): Promise<WorkoutType | null> {
    return await this.db.getFirstAsync<WorkoutType>(
      'SELECT id, name, is_custom FROM workout_types WHERE id = ?',
      id
    );
  }

  async create(name: string): Promise<WorkoutType> {
    const id = `wt-custom-${Date.now()}`;
    await this.db.runAsync(
      'INSERT INTO workout_types (id, name, is_custom) VALUES (?, ?, 1)',
      id,
      name.trim()
    );
    return { id, name: name.trim(), is_custom: 1 };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.runAsync(
      'DELETE FROM workout_types WHERE id = ? AND is_custom = 1',
      id
    );
    return result.changes > 0;
  }
}
