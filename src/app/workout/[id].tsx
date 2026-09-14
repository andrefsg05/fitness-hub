import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/context/DatabaseContext';
import { WorkoutWithDetails } from '@/types';
import { WorkoutDetails } from '@/components/WorkoutDetails';
import { Colors } from '@/constants/theme';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const { workoutRepo, isReady } = useDatabase();
  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWorkout() {
      if (!workoutRepo || !isReady || !id) return;

      try {
        setIsLoading(true);
        const details = await workoutRepo.getWorkoutDetails(id);
        setWorkout(details);
      } catch (err) {
        console.error('Error loading workout details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkout();
  }, [workoutRepo, isReady, id]);

  if (isLoading || !workout) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <WorkoutDetails
      workout={workout}
      onClose={() => router.back()}
      showCloseButton
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
