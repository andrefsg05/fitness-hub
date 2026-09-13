import { useCallback, useEffect, useState } from 'react';
import { useDatabase } from '@/context/DatabaseContext';
import { BodyweightLog, Goal, User } from '@/types';

export function useUserProfile() {
  const { userRepo, isReady } = useDatabase();
  const [user, setUser] = useState<User | null>(null);
  const [latestWeight, setLatestWeight] = useState<BodyweightLog | null>(null);
  const [weightHistory, setWeightHistory] = useState<BodyweightLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userRepo || !isReady) return;

    try {
      setIsLoading(true);
      const [u, w, wh, g] = await Promise.all([
        userRepo.getUser(),
        userRepo.getLatestWeight(),
        userRepo.getWeightHistory(30),
        userRepo.getGoals(),
      ]);

      setUser(u);
      setLatestWeight(w);
      setWeightHistory(wh);
      setGoals(g);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userRepo, isReady]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (name: string, targetWeight: number | null) => {
    if (!userRepo) return;
    await userRepo.updateProfile(user?.id, name, targetWeight);
    await fetchProfile();
  };

  const logWeight = async (weight: number, date?: string) => {
    if (!userRepo) return;
    await userRepo.logWeight(weight, date);
    await fetchProfile();
  };

  const addGoal = async (title: string, targetDate: string | null = null) => {
    if (!userRepo) return;
    await userRepo.createGoal(title, targetDate);
    await fetchProfile();
  };

  const toggleGoal = async (goalId: string, isCompleted: boolean) => {
    if (!userRepo) return;
    await userRepo.toggleGoalCompletion(goalId, isCompleted);
    await fetchProfile();
  };

  const deleteGoal = async (goalId: string) => {
    if (!userRepo) return;
    await userRepo.deleteGoal(goalId);
    await fetchProfile();
  };

  return {
    user,
    latestWeight,
    weightHistory,
    goals,
    isLoading,
    refresh: fetchProfile,
    updateProfile,
    logWeight,
    addGoal,
    toggleGoal,
    deleteGoal,
  };
}
