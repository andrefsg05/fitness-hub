import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutActionBanner } from '@/components/WorkoutActionBanner';
import { WorkoutCard } from '@/components/WorkoutCard';
import { useWorkoutsStore } from '@/stores/useWorkoutsStore';
import { useHabitsStore } from '@/stores/useHabitsStore';
import { useActiveWorkoutStore } from '@/stores/useActiveWorkoutStore';
import { useUserStore } from '@/stores/useUserStore';
import { useTabNavigationStore } from '@/stores/useTabNavigationStore';
import { Colors, Spacing } from '@/constants/theme';
import { getTodayDateString } from '@/services/notificationService';

export default function HomeScreen() {
  const { setActiveTab } = useTabNavigationStore();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const { lastWorkout, isLoading: workoutsLoading, fetchWorkouts } = useWorkoutsStore();
  const {
    activeHabits,
    isLoading: habitsLoading,
    fetchHabits,
    toggleCheckHabit,
  } = useHabitsStore();
  const fetchActiveWorkout = useActiveWorkoutStore((state) => state.fetchActiveWorkout);
  const { user, latestWeight, isLoading: profileLoading, fetchProfile } = useUserStore();

  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(getTodayDateString());

  useEffect(() => {
    fetchWorkouts();
    fetchHabits();
    fetchActiveWorkout();
    fetchProfile();

    // Listen to AppState changes to refresh habits if resuming on a new day
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        const today = getTodayDateString();
        setCurrentDate(today);
        fetchHabits();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchWorkouts, fetchHabits, fetchActiveWorkout, fetchProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentDate(getTodayDateString());
    await Promise.all([fetchWorkouts(), fetchHabits(), fetchActiveWorkout(), fetchProfile()]);
    setRefreshing(false);
  };

  const isLoading = workoutsLoading || habitsLoading || profileLoading;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Athlete'}</Text>
        </View>

        {latestWeight && (
          <View style={styles.weightContainer}>
            <Text style={[styles.weightLabel, { color: colors.textSecondary }]}>Bodyweight</Text>
            <View style={[styles.weightDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.weightValue, { color: colors.text }]}>
              {latestWeight.weight} <Text style={[styles.weightUnit, { color: colors.textSecondary }]}>kg</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Workout Action (Start New or Resume Active) */}
      <WorkoutActionBanner />

      {/* Today's Habits & Reminders */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Reminders</Text>
        <Pressable onPress={() => setActiveTab('profile')}>
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
            const isChecked = habit.last_checked === currentDate;
            const streak = habit.streak_count ?? 0;

            return (
              <Pressable
                key={habit.id}
                style={[
                  styles.habitRow,
                  index < activeHabits.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                ]}
                onPress={() => toggleCheckHabit(habit.id)}>
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: isChecked ? colors.accent : colors.border },
                    isChecked && { backgroundColor: colors.accent },
                  ]}>
                  {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <View style={styles.habitInfo}>
                  <Text
                    style={[
                      styles.habitName,
                      { color: colors.text },
                      isChecked && styles.habitCompletedText,
                    ]}
                    numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <View style={styles.metaRow}>
                    {habit.reminder_time && (
                      <View style={[styles.timeBadge, { backgroundColor: colors.backgroundElement }]}>
                        <Ionicons name="alarm-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.text }]}>
                          {habit.reminder_time}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.frequencyBadge, { backgroundColor: colors.primarySubtle }]}>
                      <Text style={[styles.frequencyText, { color: colors.primary }]}>
                        {habit.frequency === 'weekdays' ? 'Weekdays' : habit.frequency === 'weekly' ? 'Weekly' : 'Daily'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Streak counter on the right edge */}
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={20} color={colors.primary} />
                  <Text style={[styles.streakCount, { color: scheme === 'light' ? colors.text : '#FFFFFF' }]}>
                    {streak}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Last Workout Summary */}
      <View style={[styles.sectionHeader, { marginTop: Spacing.four }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Last Workout</Text>
        <Pressable onPress={() => setActiveTab('workouts')}>
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
    paddingTop: Spacing.half,
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
  weightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  weightLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  weightDivider: {
    height: 1,
    width: '100%',
    minWidth: 64,
    marginVertical: 4,
    opacity: 0.7,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  weightUnit: {
    fontSize: 12,
    fontWeight: '500',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: Spacing.two,
    paddingRight: Spacing.one,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '800',
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
