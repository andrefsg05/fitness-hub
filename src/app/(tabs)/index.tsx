import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActiveWorkoutBanner } from '@/components/ActiveWorkoutBanner';
import { WorkoutCard } from '@/components/WorkoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useHabits } from '@/hooks/useHabits';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Colors, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const { lastWorkout, isLoading: workoutsLoading, refresh: refreshWorkouts } = useWorkouts();
  const { activeHabits, isLoading: habitsLoading, toggleActive, refresh: refreshHabits } = useHabits();
  const { user, latestWeight, isLoading: profileLoading, refresh: refreshProfile } = useUserProfile();

  const [refreshing, setRefreshing] = useState(false);
  const [completedHabitIds, setCompletedHabitIds] = useState<Record<string, boolean>>({});

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshWorkouts(), refreshHabits(), refreshProfile()]);
    setRefreshing(false);
  };

  const toggleHabitCheck = (habitId: string) => {
    setCompletedHabitIds((prev) => ({
      ...prev,
      [habitId]: !prev[habitId],
    }));
  };

  const isLoading = workoutsLoading || habitsLoading || profileLoading;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Athlete'} 👋</Text>
        </View>

        {latestWeight && (
          <View style={[styles.weightBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.weightLabel, { color: colors.textSecondary }]}>Bodyweight</Text>
            <Text style={[styles.weightValue, { color: colors.text }]}>
              {latestWeight.weight} <Text style={{ fontSize: 11 }}>kg</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Active Workout in Progress Notification */}
      <ActiveWorkoutBanner />

      {/* Primary Call to Action */}
      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => router.push('/workout/active')}>
        <Text style={styles.ctaButtonText}>+ Start New Workout</Text>
      </Pressable>

      {/* Today's Habits & Reminders */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Habits & Reminders</Text>
        <Pressable onPress={() => router.push('/profile')}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>Manage</Text>
        </Pressable>
      </View>

      {activeHabits.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No active habits configured.
          </Text>
        </View>
      ) : (
        <View style={[styles.habitsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {activeHabits.map((habit, index) => {
            const isChecked = !!completedHabitIds[habit.id];
            return (
              <Pressable
                key={habit.id}
                style={[
                  styles.habitRow,
                  index < activeHabits.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
                onPress={() => toggleHabitCheck(habit.id)}>
                <View style={[styles.checkbox, isChecked && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: colors.text }, isChecked && styles.habitCompletedText]}>
                    {habit.name}
                  </Text>
                  {habit.reminder_time && (
                    <Text style={[styles.habitTime, { color: colors.textSecondary }]}>
                      ⏰ Reminder: {habit.reminder_time}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Last Workout Summary */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Completed Workout</Text>
        <Pressable onPress={() => router.push('/workouts')}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>All Workouts</Text>
        </Pressable>
      </View>

      {lastWorkout ? (
        <WorkoutCard workout={lastWorkout} />
      ) : (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No completed workouts yet. Start your first session!
          </Text>
        </View>
      )}

      <View style={{ height: Spacing.six }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    paddingTop: Spacing.five,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  weightBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  weightLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.two,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  habitsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  habitCompletedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  habitTime: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: 14,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
