import { findBestSet, isBetterSet } from '@/services/prService';
import {
  ExercisePR,
  Workout,
  WorkoutDropSet,
  WorkoutExercise,
  WorkoutExerciseWithDetails,
  WorkoutSet,
  WorkoutSummary,
  WorkoutWithDetails,
} from '@/types';
import type { SQLiteDatabase } from 'expo-sqlite';

export class WorkoutRepository {
  constructor(private db: SQLiteDatabase) { }

  // 1. Live / In-Progress Workout lifecycle
  async getActiveWorkout(): Promise<WorkoutWithDetails | null> {
    const active = await this.db.getFirstAsync<Workout>(
      "SELECT id, workout_type_id, date, status, notes, created_at FROM workouts WHERE status = 'in_progress' ORDER BY created_at DESC LIMIT 1"
    );

    if (!active) {
      return null;
    }

    return await this.getWorkoutDetails(active.id);
  }

  async startWorkout(workoutTypeId: string, date: string = new Date().toISOString().split('T')[0]): Promise<Workout> {
    // Check if there is already an active workout
    const existing = await this.getActiveWorkout();
    if (existing) {
      return existing;
    }

    const id = `workout-${Date.now()}`;
    await this.db.runAsync(
      "INSERT INTO workouts (id, workout_type_id, date, status, notes) VALUES (?, ?, ?, 'in_progress', NULL)",
      id,
      workoutTypeId,
      date
    );

    return {
      id,
      workout_type_id: workoutTypeId,
      date,
      status: 'in_progress',
      notes: null,
      created_at: new Date().toISOString(),
    };
  }

  async finishWorkout(workoutId: string, notes: string | null = null): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        "UPDATE workouts SET status = 'completed', notes = ? WHERE id = ?",
        notes,
        workoutId
      );

      // Evaluate PRs for each exercise in this workout
      const exerciseRows = await this.db.getAllAsync<{ id: string; exercise_id: string }>(
        'SELECT id, exercise_id FROM workout_exercises WHERE workout_id = ?',
        workoutId
      );

      for (const exRow of exerciseRows) {
        // Only standard sets count for PR calculation, excluding dropsets
        const sets = await this.db.getAllAsync<WorkoutSet>(
          'SELECT id, workout_exercise_id, set_number, weight, reps FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_number ASC',
          exRow.id
        );

        const bestSet = findBestSet(sets);
        if (!bestSet) {
          continue;
        }

        const currentActivePR = await this.db.getFirstAsync<ExercisePR>(
          'SELECT id, exercise_id, workout_set_id, weight, reps, is_active, achieved_at FROM exercise_prs WHERE exercise_id = ? AND is_active = 1',
          exRow.exercise_id
        );

        let isNewRecord = false;
        if (!currentActivePR) {
          isNewRecord = true;
        } else if (isBetterSet(bestSet, currentActivePR)) {
          isNewRecord = true;
        }

        if (isNewRecord) {
          if (currentActivePR) {
            await this.db.runAsync(
              'UPDATE exercise_prs SET is_active = 0 WHERE id = ?',
              currentActivePR.id
            );
          }

          const prId = `pr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          await this.db.runAsync(
            "INSERT INTO exercise_prs (id, exercise_id, workout_set_id, weight, reps, is_active, achieved_at) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))",
            prId,
            exRow.exercise_id,
            bestSet.id,
            bestSet.weight,
            bestSet.reps
          );
        }
      }
    });
  }

  async discardWorkout(workoutId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM workouts WHERE id = ?', workoutId);
  }

  async createWorkoutFromTemplate(sourceWorkout: WorkoutWithDetails): Promise<WorkoutWithDetails> {
    const existing = await this.getActiveWorkout();
    if (existing) {
      throw new Error('An active workout is already in progress');
    }

    const workoutId = `workout-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await this.db.runAsync(
      "INSERT INTO workouts (id, workout_type_id, date, status, notes) VALUES (?, ?, ?, 'in_progress', NULL)",
      workoutId,
      sourceWorkout.workout_type_id,
      today
    );

    let orderIndex = 0;
    for (const ex of sourceWorkout.exercises) {
      const weId = `we-${Date.now()}-${orderIndex}-${Math.random().toString(36).substring(2, 7)}`;
      await this.db.runAsync(
        'INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, notes) VALUES (?, ?, ?, ?, ?)',
        weId,
        workoutId,
        ex.exercise_id,
        orderIndex,
        ex.notes ?? null
      );

      let setNum = 1;
      for (const set of ex.sets) {
        const setId = `ws-${Date.now()}-${orderIndex}-${setNum}-${Math.random().toString(36).substring(2, 7)}`;
        await this.db.runAsync(
          'INSERT INTO workout_sets (id, workout_exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
          setId,
          weId,
          set.set_number ?? setNum,
          set.weight,
          set.reps
        );

        if (set.drop_sets && set.drop_sets.length > 0) {
          let dropNum = 1;
          for (const drop of set.drop_sets) {
            const dropId = `wds-${Date.now()}-${orderIndex}-${setNum}-${dropNum}-${Math.random().toString(36).substring(2, 7)}`;
            await this.db.runAsync(
              'INSERT INTO workout_drop_sets (id, workout_set_id, drop_order, weight, reps) VALUES (?, ?, ?, ?, ?)',
              dropId,
              setId,
              drop.drop_order ?? dropNum,
              drop.weight,
              drop.reps
            );
            dropNum++;
          }
        }

        setNum++;
      }

      if (ex.sets.length === 0) {
        const setId = `ws-${Date.now()}-${orderIndex}-1-${Math.random().toString(36).substring(2, 7)}`;
        await this.db.runAsync(
          'INSERT INTO workout_sets (id, workout_exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
          setId,
          weId,
          1,
          0,
          0
        );
      }

      orderIndex++;
    }

    const created = await this.getWorkoutDetails(workoutId);
    if (!created) {
      throw new Error('Failed to retrieve copied workout');
    }
    return created;
  }

  async copyMissingExercisesToWorkout(
    targetWorkoutId: string,
    sourceExercises: WorkoutExerciseWithDetails[]
  ): Promise<number> {
    const existing = await this.db.getAllAsync<{ exercise_id: string }>(
      'SELECT exercise_id FROM workout_exercises WHERE workout_id = ?',
      targetWorkoutId
    );
    const existingExerciseIds = new Set(existing.map((e) => e.exercise_id));

    const maxOrderRow = await this.db.getFirstAsync<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM workout_exercises WHERE workout_id = ?',
      targetWorkoutId
    );
    let nextOrder = (maxOrderRow?.max_order ?? -1) + 1;

    let addedCount = 0;
    for (const ex of sourceExercises) {
      if (existingExerciseIds.has(ex.exercise_id)) {
        continue;
      }
      existingExerciseIds.add(ex.exercise_id);

      const weId = `we-${Date.now()}-${nextOrder}-${Math.random().toString(36).substring(2, 7)}`;
      await this.db.runAsync(
        'INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, notes) VALUES (?, ?, ?, ?, ?)',
        weId,
        targetWorkoutId,
        ex.exercise_id,
        nextOrder,
        ex.notes ?? null
      );

      let setNum = 1;
      for (const set of ex.sets) {
        const setId = `ws-${Date.now()}-${nextOrder}-${setNum}-${Math.random().toString(36).substring(2, 7)}`;
        await this.db.runAsync(
          'INSERT INTO workout_sets (id, workout_exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
          setId,
          weId,
          set.set_number ?? setNum,
          set.weight,
          set.reps
        );

        if (set.drop_sets && set.drop_sets.length > 0) {
          let dropNum = 1;
          for (const drop of set.drop_sets) {
            const dropId = `wds-${Date.now()}-${nextOrder}-${setNum}-${dropNum}-${Math.random().toString(36).substring(2, 7)}`;
            await this.db.runAsync(
              'INSERT INTO workout_drop_sets (id, workout_set_id, drop_order, weight, reps) VALUES (?, ?, ?, ?, ?)',
              dropId,
              setId,
              drop.drop_order ?? dropNum,
              drop.weight,
              drop.reps
            );
            dropNum++;
          }
        }

        setNum++;
      }

      if (ex.sets.length === 0) {
        const setId = `ws-${Date.now()}-${nextOrder}-1-${Math.random().toString(36).substring(2, 7)}`;
        await this.db.runAsync(
          'INSERT INTO workout_sets (id, workout_exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
          setId,
          weId,
          1,
          0,
          0
        );
      }

      nextOrder++;
      addedCount++;
    }

    return addedCount;
  }

  // 2. Managing exercises and sets inside a workout
  async addExerciseToWorkout(workoutId: string, exerciseId: string): Promise<WorkoutExercise> {
    const id = `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // Find current max order index
    const maxOrder = await this.db.getFirstAsync<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM workout_exercises WHERE workout_id = ?',
      workoutId
    );
    const nextOrder = (maxOrder?.max_order ?? -1) + 1;

    await this.db.runAsync(
      'INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, notes) VALUES (?, ?, ?, ?, NULL)',
      id,
      workoutId,
      exerciseId,
      nextOrder
    );

    // Auto-create set 1 with 0kg x 0 reps as starting template
    await this.addSet(id, 1, 0, 0);

    return {
      id,
      workout_id: workoutId,
      exercise_id: exerciseId,
      order_index: nextOrder,
      notes: null,
    };
  }

  async removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM workout_exercises WHERE id = ?', workoutExerciseId);
  }

  async addSet(workoutExerciseId: string, setNumber: number, weight: number, reps: number): Promise<WorkoutSet> {
    const id = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    await this.db.runAsync(
      'INSERT INTO workout_sets (id, workout_exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
      id,
      workoutExerciseId,
      setNumber,
      weight,
      reps
    );

    return {
      id,
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      weight,
      reps,
    };
  }

  async updateSet(setId: string, weight: number, reps: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE workout_sets SET weight = ?, reps = ? WHERE id = ?',
      weight,
      reps,
      setId
    );
  }

  async deleteSet(setId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM workout_sets WHERE id = ?', setId);
  }

  async addDropSet(workoutSetId: string, weight: number, reps: number): Promise<WorkoutDropSet> {
    const maxOrder = await this.db.getFirstAsync<{ max_order: number | null }>(
      'SELECT MAX(drop_order) as max_order FROM workout_drop_sets WHERE workout_set_id = ?',
      workoutSetId
    );
    const nextOrder = (maxOrder?.max_order ?? 0) + 1;
    const id = `wds-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await this.db.runAsync(
      'INSERT INTO workout_drop_sets (id, workout_set_id, drop_order, weight, reps) VALUES (?, ?, ?, ?, ?)',
      id,
      workoutSetId,
      nextOrder,
      weight,
      reps
    );

    return {
      id,
      workout_set_id: workoutSetId,
      drop_order: nextOrder,
      weight,
      reps,
    };
  }

  async updateDropSet(dropSetId: string, weight: number, reps: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE workout_drop_sets SET weight = ?, reps = ? WHERE id = ?',
      weight,
      reps,
      dropSetId
    );
  }

  async deleteDropSet(dropSetId: string): Promise<void> {
    await this.db.runAsync('DELETE FROM workout_drop_sets WHERE id = ?', dropSetId);
  }

  // 3. Queries and Summaries
  async getLastCompletedWorkout(): Promise<WorkoutSummary | null> {
    const workouts = await this.getRecentWorkouts(1);
    return workouts.length > 0 ? workouts[0] : null;
  }

  async getLastCompletedWorkoutByType(
    workoutTypeId: string,
    excludeWorkoutId?: string
  ): Promise<WorkoutWithDetails | null> {
    const query = excludeWorkoutId
      ? "SELECT id FROM workouts WHERE workout_type_id = ? AND status = 'completed' AND id != ? ORDER BY date DESC, created_at DESC LIMIT 1"
      : "SELECT id FROM workouts WHERE workout_type_id = ? AND status = 'completed' ORDER BY date DESC, created_at DESC LIMIT 1";

    const row = excludeWorkoutId
      ? await this.db.getFirstAsync<{ id: string }>(query, workoutTypeId, excludeWorkoutId)
      : await this.db.getFirstAsync<{ id: string }>(query, workoutTypeId);

    if (!row) {
      return null;
    }

    return await this.getWorkoutDetails(row.id);
  }

  async getRecentWorkouts(limit: number = 3): Promise<WorkoutSummary[]> {
    return await this.getWorkoutSummaries(limit, 0);
  }

  async getWorkoutHistory(limit: number = 20, offset: number = 0): Promise<WorkoutSummary[]> {
    return await this.getWorkoutSummaries(limit, offset);
  }

  private async getWorkoutSummaries(limit: number, offset: number): Promise<WorkoutSummary[]> {
    const query = `
      SELECT 
        w.id,
        w.workout_type_id,
        wt.name AS workout_type_name,
        w.date,
        w.status,
        w.notes,
        w.created_at,
        COUNT(DISTINCT we.id) AS total_exercises,
        COUNT(DISTINCT ws.id) AS total_sets,
        (
          COALESCE(SUM(ws.weight * ws.reps), 0) + 
          COALESCE((
            SELECT SUM(wds.weight * wds.reps)
            FROM workout_drop_sets wds
            JOIN workout_sets ws2 ON wds.workout_set_id = ws2.id
            JOIN workout_exercises we2 ON ws2.workout_exercise_id = we2.id
            WHERE we2.workout_id = w.id
          ), 0)
        ) AS total_volume
      FROM workouts w
      JOIN workout_types wt ON w.workout_type_id = wt.id
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id
      WHERE w.status = 'completed'
      GROUP BY w.id
      ORDER BY w.date DESC, w.created_at DESC
      LIMIT ? OFFSET ?
    `;

    return await this.db.getAllAsync<WorkoutSummary>(query, limit, offset);
  }

  async getWorkoutDetails(workoutId: string): Promise<WorkoutWithDetails | null> {
    const workoutRow = await this.db.getFirstAsync<{
      id: string;
      workout_type_id: string;
      workout_type_name: string;
      date: string;
      status: Workout['status'];
      notes: string | null;
      created_at: string;
    }>(
      `SELECT w.id, w.workout_type_id, wt.name AS workout_type_name, w.date, w.status, w.notes, w.created_at
       FROM workouts w
       JOIN workout_types wt ON w.workout_type_id = wt.id
       WHERE w.id = ?`,
      workoutId
    );

    if (!workoutRow) {
      return null;
    }

    const exerciseRows = await this.db.getAllAsync<{
      id: string;
      workout_id: string;
      exercise_id: string;
      exercise_name: string;
      category: string;
      order_index: number;
      notes: string | null;
    }>(
      `SELECT 
        we.id, 
        we.workout_id, 
        we.exercise_id, 
        e.name AS exercise_name, 
        e.category, 
        we.order_index, 
        we.notes
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = ?
       ORDER BY we.order_index ASC`,
      workoutId
    );

    let totalSets = 0;
    let totalVolume = 0;
    const exercises: WorkoutExerciseWithDetails[] = [];

    for (const exRow of exerciseRows) {
      const setRows = await this.db.getAllAsync<{
        id: string;
        workout_exercise_id: string;
        set_number: number;
        weight: number;
        reps: number;
        is_pr: number;
      }>(
        `SELECT ws.id, ws.workout_exercise_id, ws.set_number, ws.weight, ws.reps,
                CASE WHEN ep.id IS NOT NULL THEN 1 ELSE 0 END AS is_pr
         FROM workout_sets ws
         LEFT JOIN exercise_prs ep ON ep.workout_set_id = ws.id AND ep.is_active = 1
         WHERE ws.workout_exercise_id = ? 
         ORDER BY ws.set_number ASC`,
        exRow.id
      );

      const sets: WorkoutSet[] = [];
      for (const row of setRows) {
        totalSets += 1;
        totalVolume += row.weight * row.reps;

        const dropSets = await this.db.getAllAsync<WorkoutDropSet>(
          'SELECT id, workout_set_id, drop_order, weight, reps FROM workout_drop_sets WHERE workout_set_id = ? ORDER BY drop_order ASC',
          row.id
        );

        for (const drop of dropSets) {
          totalVolume += drop.weight * drop.reps;
        }

        sets.push({
          id: row.id,
          workout_exercise_id: row.workout_exercise_id,
          set_number: row.set_number,
          weight: row.weight,
          reps: row.reps,
          is_pr: Boolean(row.is_pr),
          drop_sets: dropSets,
        });
      }

      exercises.push({
        id: exRow.id,
        workout_id: exRow.workout_id,
        exercise_id: exRow.exercise_id,
        exercise_name: exRow.exercise_name,
        category: exRow.category,
        order_index: exRow.order_index,
        notes: exRow.notes,
        sets,
      });
    }

    return {
      id: workoutRow.id,
      workout_type_id: workoutRow.workout_type_id,
      workout_type_name: workoutRow.workout_type_name,
      date: workoutRow.date,
      status: workoutRow.status,
      notes: workoutRow.notes,
      created_at: workoutRow.created_at,
      exercises,
      total_sets: totalSets,
      total_volume: totalVolume,
    };
  }

  async getCompletedWorkoutsCountForMonth(yearMonth: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM workouts WHERE status = 'completed' AND date LIKE ?",
      `${yearMonth}%`
    );
    return result?.count ?? 0;
  }
}
