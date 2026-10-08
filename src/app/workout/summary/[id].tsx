import { WorkoutSummaryContent } from '@/components/WorkoutSummaryContent';
import { Colors, Spacing } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { buildWorkoutCompletionInsights } from '@/services/workoutCompletionService';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useUserStore } from '@/stores/useUserStore';
import {
  ExerciseStagnationAlert,
  WorkoutCompletionInsights,
  WorkoutWithDetails,
} from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function RewardHeader({
  insights,
  workoutTypeName,
  userName,
  handlingAlert,
  onIgnoreStagnationAlert,
  onEnablePersistentStagnationAlerts,
}: {
  insights: WorkoutCompletionInsights;
  workoutTypeName: string;
  userName?: string;
  handlingAlert: { exerciseId: string; action: 'ignore' | 'persistent' } | null;
  onIgnoreStagnationAlert: (alert: ExerciseStagnationAlert) => void;
  onEnablePersistentStagnationAlerts: (alert: ExerciseStagnationAlert) => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  const hasPrs = insights.prs.length > 0;
  const greeting = userName ? `Great work, ${userName}!` : 'Great work!';

  let message = 'Another workout completed. Consistency is progress.';
  if (hasPrs && insights.hasVolumeImprovement) {
    message = 'New records and more volume — this was a standout session.';
  } else if (hasPrs) {
    message = 'You pushed your limits and set a new personal record.';
  } else if (insights.hasVolumeImprovement) {
    message = `You moved more weight than in your last ${workoutTypeName} workout.`;
  } else if (insights.isFirstWorkoutOfType) {
    message = `Your first ${workoutTypeName} workout is now your baseline.`;
  }

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!isMounted) return;

      if (reduceMotion) {
        opacity.setValue(1);
        scale.setValue(1);
        return;
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 160,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      isMounted = false;
    };
  }, [opacity, scale]);

  const accessibleSummary = [
    'Workout complete.',
    greeting,
    message,
    hasPrs ? `${insights.prs.length} new personal ${insights.prs.length === 1 ? 'record' : 'records'}.` : '',
    insights.hasVolumeImprovement && insights.volumeDelta !== null
      ? `${insights.volumeDelta.toLocaleString()} kilograms more volume than the previous workout.`
      : '',
  ].filter(Boolean).join(' ');

  return (
    <Animated.View
      style={[styles.rewardSection, { opacity, transform: [{ scale }] }]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={accessibleSummary}>
      <View style={[styles.successIcon, { backgroundColor: colors.accentSubtle }]}>
        <Ionicons name="checkmark" size={34} color={colors.accent} />
      </View>
      <Text accessibilityRole="header" style={[styles.eyebrow, { color: colors.accent }]}>
        WORKOUT COMPLETE
      </Text>
      <Text style={[styles.rewardTitle, { color: colors.text }]}>{greeting}</Text>
      <Text style={[styles.rewardMessage, { color: colors.textSecondary }]}>{message}</Text>

      {hasPrs ? (
        <View style={[styles.achievementCard, { backgroundColor: colors.accentSubtle, borderColor: colors.accent }]}>
          <View style={styles.achievementHeading}>
            <Ionicons name="trophy-outline" size={22} color={colors.accent} />
            <View style={styles.achievementHeadingText}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>
                {insights.prs.length} new {insights.prs.length === 1 ? 'personal record' : 'personal records'}
              </Text>
              <Text style={[styles.achievementLabel, { color: colors.textSecondary }]}>PERSONAL BEST</Text>
            </View>
          </View>

          {insights.prs.map((pr) => (
            <View key={pr.id} style={styles.prRow}>
              <Text style={[styles.prExercise, { color: colors.text }]}>{pr.exercise_name}</Text>
              <Text style={[styles.prValue, { color: colors.accent }]}>
                {pr.weight.toLocaleString()} kg × {pr.reps}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {insights.hasVolumeImprovement && insights.volumeDelta !== null ? (
        <View style={[styles.achievementCard, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
          <View style={styles.achievementHeading}>
            <Ionicons name="trending-up" size={22} color={colors.primary} />
            <View style={styles.achievementHeadingText}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>
                +{insights.volumeDelta.toLocaleString()} kg volume
                {insights.volumeDeltaPercentage !== null
                  ? ` · +${Math.round(insights.volumeDeltaPercentage)}%`
                  : ''}
              </Text>
              <Text style={[styles.achievementLabel, { color: colors.textSecondary }]}>VS. LAST {workoutTypeName.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {!hasPrs && !insights.hasVolumeImprovement && insights.isFirstWorkoutOfType ? (
        <View style={[styles.achievementCard, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
          <View style={styles.achievementHeading}>
            <Ionicons name="flag-outline" size={22} color={colors.primary} />
            <View style={styles.achievementHeadingText}>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>Baseline established</Text>
              <Text style={[styles.achievementLabel, { color: colors.textSecondary }]}>YOUR NEXT SESSION HAS A TARGET</Text>
            </View>
          </View>
        </View>
      ) : null}

      {insights.stagnationAlerts.map((alert) => {
        const isHandling = handlingAlert?.exerciseId === alert.exercise_id;
        const isIgnoring = isHandling && handlingAlert?.action === 'ignore';
        const isEnablingPersistent = isHandling && handlingAlert?.action === 'persistent';
        const isPersistent = alert.alert_mode === 'persistent';

        return (
          <View
            key={alert.exercise_id}
            style={[styles.stagnationCard, { backgroundColor: colors.warningSubtle, borderColor: colors.warning }]}
            accessibilityLiveRegion="polite">
            <View style={styles.achievementHeading}>
              <Ionicons accessible={false} name="alert-circle-outline" size={22} color={colors.warning} />
              <View style={styles.achievementHeadingText}>
                <Text style={[styles.achievementTitle, { color: colors.text }]}>{alert.exercise_name}</Text>
                <Text style={[styles.achievementLabel, { color: colors.textSecondary }]}>PROGRESS ALERT</Text>
              </View>
            </View>

            <Text style={[styles.stagnationMessage, { color: colors.textSecondary }]}>
              {isPersistent
                ? `You still have not beaten your ${alert.pr_weight.toLocaleString()} kg × ${alert.pr_reps} PR. Give this exercise extra attention next time.`
                : `No new PR in ${alert.non_pr_workout_count} workouts. Your current PR is ${alert.pr_weight.toLocaleString()} kg × ${alert.pr_reps}. Give this exercise extra attention next time.`}
            </Text>

            <View style={styles.stagnationActions}>
              <Pressable
                disabled={isHandling}
                onPress={() => onIgnoreStagnationAlert(alert)}
                style={({ pressed }) => [
                  styles.stagnationSecondaryButton,
                  { borderColor: colors.primary, opacity: pressed || isHandling ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Ignore ${alert.exercise_name} progress alert`}
                accessibilityHint="Hides this alert until three more workouts without a new personal record">
                {isIgnoring ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.stagnationSecondaryButtonText, { color: colors.primary }]}>Ignore</Text>
                )}
              </Pressable>
              <Pressable
                disabled={isHandling}
                onPress={() => onEnablePersistentStagnationAlerts(alert)}
                style={({ pressed }) => [
                  styles.stagnationPrimaryButton,
                  { backgroundColor: colors.primary, opacity: pressed || isHandling ? 0.82 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Keep reminding me about ${alert.exercise_name}`}
                accessibilityHint="Shows this alert after every workout without a new personal record until you beat it">
                {isEnablingPersistent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.stagnationPrimaryButtonText}>Keep reminding me</Text>
                )}
              </Pressable>
            </View>
          </View>
        );
      })}

      <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
    </Animated.View>
  );
}

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { workoutRepo, exercisePrRepo, exerciseStagnationRepo, isReady } = useDatabase();
  const user = useUserStore((state) => state.user);
  const prProgressAlertsEnabled = useSettingsStore((state) => state.prProgressAlertsEnabled);
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null);
  const [insights, setInsights] = useState<WorkoutCompletionInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [handlingAlert, setHandlingAlert] = useState<{
    exerciseId: string;
    action: 'ignore' | 'persistent';
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      if (
        !workoutRepo ||
        !exercisePrRepo ||
        !exerciseStagnationRepo ||
        !isReady ||
        !settingsLoaded ||
        !id
      ) return;

      try {
        setIsLoading(true);
        setHasError(false);

        const completedWorkout = await workoutRepo.getWorkoutDetails(id);
        if (!completedWorkout || completedWorkout.status !== 'completed') {
          throw new Error('Completed workout not found');
        }

        const [previousWorkout, workoutPrs, stagnationAlerts] = await Promise.all([
          workoutRepo.getLastCompletedWorkoutByType(
            completedWorkout.workout_type_id,
            completedWorkout.id
          ),
          exercisePrRepo.getPRsForWorkout(completedWorkout.id),
          prProgressAlertsEnabled
            ? exerciseStagnationRepo.getAlertsForWorkout(completedWorkout.id)
            : Promise.resolve<ExerciseStagnationAlert[]>([]),
        ]);

        if (!isMounted) return;
        setWorkout(completedWorkout);
        setInsights(
          buildWorkoutCompletionInsights(completedWorkout, previousWorkout, workoutPrs, stagnationAlerts)
        );
      } catch (error) {
        console.error('Error loading workout completion summary:', error);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [
    exercisePrRepo,
    exerciseStagnationRepo,
    id,
    isReady,
    prProgressAlertsEnabled,
    settingsLoaded,
    workoutRepo,
  ]);

  const dismissStagnationAlert = (exerciseId: string) => {
    setInsights((current) => current
      ? {
          ...current,
          stagnationAlerts: current.stagnationAlerts.filter((alert) => alert.exercise_id !== exerciseId),
        }
      : current);
  };

  const handleIgnoreStagnationAlert = async (alert: ExerciseStagnationAlert) => {
    if (!exerciseStagnationRepo || !id) return;

    try {
      setHandlingAlert({ exerciseId: alert.exercise_id, action: 'ignore' });
      await exerciseStagnationRepo.ignoreAlert(alert.exercise_id, id);
      dismissStagnationAlert(alert.exercise_id);
    } catch (error) {
      console.error('Error ignoring exercise stagnation alert:', error);
      Alert.alert('Unable to update alert', 'Please try again.');
    } finally {
      setHandlingAlert(null);
    }
  };

  const handleEnablePersistentStagnationAlerts = async (alert: ExerciseStagnationAlert) => {
    if (!exerciseStagnationRepo || !id) return;

    try {
      setHandlingAlert({ exerciseId: alert.exercise_id, action: 'persistent' });
      await exerciseStagnationRepo.enablePersistentAlerts(alert.exercise_id, id);
      dismissStagnationAlert(alert.exercise_id);
    } catch (error) {
      console.error('Error enabling persistent exercise stagnation alerts:', error);
      Alert.alert('Unable to update alert', 'Please try again.');
    } finally {
      setHandlingAlert(null);
    }
  };

  const handleDone = () => router.replace('/');

  if (isLoading) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.stateMessage, { color: colors.textSecondary }]}>Preparing your summary…</Text>
      </View>
    );
  }

  if (hasError || !workout || !insights) {
    return (
      <View style={[styles.centeredState, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={36} color={colors.danger} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load workout summary</Text>
        <Text style={[styles.stateMessage, { color: colors.textSecondary }]}>
          Your workout is saved. You can find it in your workout history.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.stateButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleDone}
          accessibilityRole="button">
          <Text style={styles.stateButtonText}>Go to home</Text>
        </Pressable>
      </View>
    );
  }

  const firstName = user?.name.trim().split(/\s+/)[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WorkoutSummaryContent
        workout={workout}
        bottomPadding={Spacing.four}
        leadingContent={
          <RewardHeader
            insights={insights}
            workoutTypeName={workout.workout_type_name}
            userName={firstName}
            handlingAlert={handlingAlert}
            onIgnoreStagnationAlert={handleIgnoreStagnationAlert}
            onEnablePersistentStagnationAlerts={handleEnablePersistentStagnationAlerts}
          />
        }
      />

      <SafeAreaView
        edges={['bottom']}
        style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            { backgroundColor: colors.accent, opacity: pressed ? 0.82 : 1 },
          ]}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Finish and return home">
          <Text style={[styles.doneButtonText, { color: colors.onAccent }]}>Done</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  stateMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.two,
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.three,
  },
  stateButton: {
    minHeight: 48,
    minWidth: 160,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  stateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rewardSection: {
    alignItems: 'center',
    paddingTop: Spacing.four,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  rewardTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  rewardMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    maxWidth: 340,
  },
  achievementCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  achievementHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementHeadingText: {
    flex: 1,
    marginLeft: Spacing.three,
  },
  stagnationCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  stagnationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  stagnationActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  stagnationSecondaryButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  stagnationSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stagnationPrimaryButton: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  stagnationPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  achievementLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginTop: 3,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  prExercise: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  prValue: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sectionDivider: {
    width: '100%',
    height: 1,
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  doneButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
