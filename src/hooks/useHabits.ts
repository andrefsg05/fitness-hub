import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { Habit } from '@/types';

export function useHabits() {
  const { habitRepo, isReady } = useDatabase();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeHabits, setActiveHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    if (!habitRepo || !isReady) return;

    try {
      setIsLoading(true);
      const [all, active] = await Promise.all([
        habitRepo.getAll(),
        habitRepo.getActive(),
      ]);
      setHabits(all);
      setActiveHabits(active);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setIsLoading(false);
    }
  }, [habitRepo, isReady]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (
    name: string,
    frequency: 'daily' | 'weekdays' | 'weekly' = 'daily',
    reminderTime: string | null = null
  ) => {
    if (!habitRepo) return;
    await habitRepo.create(name, frequency, reminderTime);
    await fetchHabits();
  };

  const toggleActive = async (habitId: string, isActive: boolean) => {
    if (!habitRepo) return;
    await habitRepo.toggleActive(habitId, isActive);
    await fetchHabits();
  };

  const deleteHabit = async (habitId: string) => {
    if (!habitRepo) return;
    await habitRepo.delete(habitId);
    await fetchHabits();
  };

  return {
    habits,
    activeHabits,
    isLoading,
    refresh: fetchHabits,
    addHabit,
    toggleActive,
    deleteHabit,
  };
}
