import { ExerciseStagnationAlert, ExerciseStagnationState } from '@/types';
import type { SQLiteDatabase } from 'expo-sqlite';

export class ExerciseStagnationRepository {
  constructor(private db: SQLiteDatabase) {}

  async recordExerciseResult(
    exerciseId: string,
    workoutId: string,
    setNewPr: boolean
  ): Promise<void> {
    if (setNewPr) {
      await this.db.runAsync(
        `INSERT INTO exercise_stagnation_states (
           exercise_id, non_pr_workout_count, next_alert_at, alert_mode, last_counted_workout_id, last_action_workout_id
         ) VALUES (?, 0, 3, 'threshold', NULL, NULL)
         ON CONFLICT(exercise_id) DO UPDATE SET
           non_pr_workout_count = 0,
           next_alert_at = 3,
           alert_mode = 'threshold',
           last_counted_workout_id = NULL,
           last_action_workout_id = NULL`,
        exerciseId
      );
      return;
    }

    const state = await this.db.getFirstAsync<ExerciseStagnationState>(
      `SELECT exercise_id, non_pr_workout_count, next_alert_at, alert_mode, last_counted_workout_id, last_action_workout_id
       FROM exercise_stagnation_states
       WHERE exercise_id = ?`,
      exerciseId
    );

    if (!state) {
      await this.db.runAsync(
        `INSERT INTO exercise_stagnation_states (
           exercise_id, non_pr_workout_count, next_alert_at, alert_mode, last_counted_workout_id, last_action_workout_id
         ) VALUES (?, 1, 3, 'threshold', ?, NULL)`,
        exerciseId,
        workoutId
      );
      return;
    }

    await this.db.runAsync(
      `UPDATE exercise_stagnation_states
       SET non_pr_workout_count = ?, last_counted_workout_id = ?
       WHERE exercise_id = ?`,
      state.non_pr_workout_count + 1,
      workoutId,
      exerciseId
    );
  }

  async getAlertsForWorkout(workoutId: string): Promise<ExerciseStagnationAlert[]> {
    return await this.db.getAllAsync<ExerciseStagnationAlert>(
      `SELECT
         state.exercise_id,
         e.name AS exercise_name,
         state.non_pr_workout_count,
         state.alert_mode,
         pr.weight AS pr_weight,
         pr.reps AS pr_reps
       FROM exercise_stagnation_states state
       JOIN exercises e ON e.id = state.exercise_id
       JOIN exercise_prs pr ON pr.exercise_id = state.exercise_id AND pr.is_active = 1
       WHERE state.last_counted_workout_id = ?
         AND (state.last_action_workout_id IS NULL OR state.last_action_workout_id != ?)
         AND (state.non_pr_workout_count >= state.next_alert_at OR state.alert_mode = 'persistent')
       ORDER BY e.name ASC`,
      workoutId,
      workoutId
    );
  }

  async ignoreAlert(exerciseId: string, workoutId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE exercise_stagnation_states
       SET next_alert_at = non_pr_workout_count + 3,
           alert_mode = 'threshold',
           last_action_workout_id = ?
       WHERE exercise_id = ?`,
      workoutId,
      exerciseId
    );
  }

  async enablePersistentAlerts(exerciseId: string, workoutId: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE exercise_stagnation_states
       SET alert_mode = 'persistent', last_action_workout_id = ?
       WHERE exercise_id = ?`,
      workoutId,
      exerciseId
    );
  }
}
