import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { Colors, Spacing } from '@/constants/theme';

export function WorkoutActionBanner() {
  const { activeWorkout, refresh } = useActiveWorkout();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  // Refresh active workout whenever the host screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handlePress = () => {
    router.push('/workout/active');
  };

  // If there is an ongoing workout, display the active banner with details and "Resume"
  if (activeWorkout) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.container,
          styles.activeContainer,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={handlePress}>
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

  // Otherwise, display the "+ Start New Workout" button
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        styles.startButton,
        { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={handlePress}>
      <Text style={styles.startButtonText}>+ Start New Workout</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
    borderRadius: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  // Button state styles
  startButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Active banner state styles
  activeContainer: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
