import type { SQLiteDatabase } from 'expo-sqlite';
import { Exercise } from '@/types';

export class ExerciseRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<Exercise[]> {
    return await this.db.getAllAsync<Exercise>(
      'SELECT id, name, category, is_custom FROM exercises ORDER BY category ASC, name ASC'
    );
  }

  async getByCategory(category: string): Promise<Exercise[]> {
    return await this.db.getAllAsync<Exercise>(
      'SELECT id, name, category, is_custom FROM exercises WHERE category = ? ORDER BY name ASC',
      category
    );
  }

  async getById(id: string): Promise<Exercise | null> {
    return await this.db.getFirstAsync<Exercise>(
      'SELECT id, name, category, is_custom FROM exercises WHERE id = ?',
      id
    );
  }

  async create(name: string, category: string): Promise<Exercise> {
    const id = `ex-custom-${Date.now()}`;
    await this.db.runAsync(
      'INSERT INTO exercises (id, name, category, is_custom) VALUES (?, ?, ?, 1)',
      id,
      name.trim(),
      category.trim()
    );
    return { id, name: name.trim(), category: category.trim(), is_custom: 1 };
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.runAsync(
      'DELETE FROM exercises WHERE id = ? AND is_custom = 1',
      id
    );
    return result.changes > 0;
  }
}
