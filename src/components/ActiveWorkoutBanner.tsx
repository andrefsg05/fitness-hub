import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { Colors, Spacing } from '@/constants/theme';

export function ActiveWorkoutBanner() {
  const { activeWorkout } = useActiveWorkout();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  if (!activeWorkout) return null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={() => router.push('/workout/active')}>
      <View style={styles.content}>
        <View style={styles.pulseDot} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Workout in Progress</Text>
          <Text style={styles.subtitle}>
            {activeWorkout.workout_type_name} • {activeWorkout.exercises.length} Exercises • {activeWorkout.total_sets} Sets
          </Text>
        </View>
      </View>
      <View style={styles.resumeBadge}>
        <Text style={styles.resumeText}>Resume →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    borderRadius: 14,
    marginVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  resumeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  resumeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
