import type { SQLiteDatabase } from 'expo-sqlite';

export class SettingsRepository {
  constructor(private db: SQLiteDatabase) {}

  async getSetting(key: string, defaultValue: string | null = null): Promise<string | null> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?',
      key
    );
    return row ? row.value : defaultValue;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.db.runAsync(
      'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
      key,
      value
    );
  }
}
