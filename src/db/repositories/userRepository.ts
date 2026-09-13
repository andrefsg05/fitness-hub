import type { SQLiteDatabase } from 'expo-sqlite';
import { BodyweightLog, Goal, User } from '@/types';
import { DEFAULT_USER_ID } from '../seed';

export class UserRepository {
  constructor(private db: SQLiteDatabase) {}

  async getUser(userId: string = DEFAULT_USER_ID): Promise<User | null> {
    return await this.db.getFirstAsync<User>(
      'SELECT id, name, target_weight, created_at FROM users WHERE id = ?',
      userId
    );
  }

  async updateProfile(userId: string = DEFAULT_USER_ID, name: string, targetWeight: number | null): Promise<void> {
    await this.db.runAsync(
      'UPDATE users SET name = ?, target_weight = ? WHERE id = ?',
      name.trim(),
      targetWeight,
      userId
    );
  }

  // Goals
  async getGoals(userId: string = DEFAULT_USER_ID): Promise<Goal[]> {
    return await this.db.getAllAsync<Goal>(
      'SELECT id, user_id, title, target_date, is_completed, created_at FROM goals WHERE user_id = ? ORDER BY is_completed ASC, created_at DESC',
      userId
    );
  }

  async createGoal(title: string, targetDate: string | null = null, userId: string = DEFAULT_USER_ID): Promise<Goal> {
    const id = `goal-${Date.now()}`;
    await this.db.runAsync(
      'INSERT INTO goals (id, user_id, title, target_date, is_completed) VALUES (?, ?, ?, ?, 0)',
      id,
      userId,
      title.trim(),
      targetDate
    );
    return {
      id,
      user_id: userId,
      title: title.trim(),
      target_date: targetDate,
      is_completed: 0,
      created_at: new Date().toISOString(),
    };
  }

  async toggleGoalCompletion(goalId: string, isCompleted: boolean): Promise<void> {
    await this.db.runAsync(
      'UPDATE goals SET is_completed = ? WHERE id = ?',
      isCompleted ? 1 : 0,
      goalId
    );
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const result = await this.db.runAsync('DELETE FROM goals WHERE id = ?', goalId);
    return result.changes > 0;
  }

  // Bodyweight Logs
  async getLatestWeight(userId: string = DEFAULT_USER_ID): Promise<BodyweightLog | null> {
    return await this.db.getFirstAsync<BodyweightLog>(
      'SELECT id, user_id, weight, date, created_at FROM bodyweight_logs WHERE user_id = ? ORDER BY date DESC, created_at DESC LIMIT 1',
      userId
    );
  }

  async getWeightHistory(limit: number = 30, userId: string = DEFAULT_USER_ID): Promise<BodyweightLog[]> {
    return await this.db.getAllAsync<BodyweightLog>(
      'SELECT id, user_id, weight, date, created_at FROM bodyweight_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?',
      userId,
      limit
    );
  }

  async logWeight(weight: number, date: string = new Date().toISOString().split('T')[0], userId: string = DEFAULT_USER_ID): Promise<BodyweightLog> {
    const id = `bw-${Date.now()}`;
    await this.db.runAsync(
      'INSERT INTO bodyweight_logs (id, user_id, weight, date) VALUES (?, ?, ?, ?)',
      id,
      userId,
      weight,
      date
    );
    return {
      id,
      user_id: userId,
      weight,
      date,
      created_at: new Date().toISOString(),
    };
  }
}
