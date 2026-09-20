import type { SQLiteDatabase } from 'expo-sqlite';
import { Habit } from '@/types';
import { DEFAULT_USER_ID } from '../seed';

export class HabitRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(userId: string = DEFAULT_USER_ID): Promise<Habit[]> {
    return await this.db.getAllAsync<Habit>(
      'SELECT id, user_id, name, frequency, reminder_time, is_active, last_checked, created_at FROM habits WHERE user_id = ? ORDER BY is_active DESC, reminder_time ASC, created_at DESC',
      userId
    );
  }

  async getActive(userId: string = DEFAULT_USER_ID): Promise<Habit[]> {
    return await this.db.getAllAsync<Habit>(
      'SELECT id, user_id, name, frequency, reminder_time, is_active, last_checked, created_at FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY reminder_time ASC',
      userId
    );
  }

  async create(
    name: string,
    frequency: 'daily' | 'weekdays' | 'weekly' = 'daily',
    reminderTime: string | null = null,
    userId: string = DEFAULT_USER_ID
  ): Promise<Habit> {
    const id = `habit-${Date.now()}`;
    await this.db.runAsync(
      'INSERT INTO habits (id, user_id, name, frequency, reminder_time, is_active, last_checked) VALUES (?, ?, ?, ?, ?, 1, NULL)',
      id,
      userId,
      name.trim(),
      frequency,
      reminderTime
    );
    return {
      id,
      user_id: userId,
      name: name.trim(),
      frequency,
      reminder_time: reminderTime,
      is_active: 1,
      last_checked: null,
      created_at: new Date().toISOString(),
    };
  }

  async toggleCheckIn(habitId: string, isChecked: boolean, dateStr: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE habits SET last_checked = ? WHERE id = ?',
      isChecked ? dateStr : null,
      habitId
    );
  }

  async toggleActive(habitId: string, isActive: boolean): Promise<void> {
    await this.db.runAsync(
      'UPDATE habits SET is_active = ? WHERE id = ?',
      isActive ? 1 : 0,
      habitId
    );
  }

  async delete(habitId: string): Promise<boolean> {
    const result = await this.db.runAsync('DELETE FROM habits WHERE id = ?', habitId);
    return result.changes > 0;
  }
}
