import { Colors, Spacing } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { ExerciseStagnationAlert } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function alertMessage(alert: ExerciseStagnationAlert): string {
  if (alert.alert_mode === 'persistent') {
    return `You still have not beaten your ${alert.pr_weight.toLocaleString()} kg × ${alert.pr_reps} PR. Give this exercise extra attention next time.`;
  }

  return `No new PR in ${alert.non_pr_workout_count} workouts. Your current PR is ${alert.pr_weight.toLocaleString()} kg × ${alert.pr_reps}. Give this exercise extra attention next time.`;
}

export default function ProgressAlertsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { exerciseStagnationRepo, isReady } = useDatabase();
  const [alerts, setAlerts] = useState<ExerciseStagnationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [ignoringExerciseId, setIgnoringExerciseId] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    if (!exerciseStagnationRepo || !isReady) return;

    try {
      setIsLoading(true);
      setHasError(false);
      setAlerts(await exerciseStagnationRepo.getActiveAlerts());
    } catch (error) {
      console.error('Error loading progress alerts:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseStagnationRepo, isReady]);

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts])
  );

  const handleIgnore = (alert: ExerciseStagnationAlert) => {
    Alert.alert(
      'Ignore progress alert?',
      `Hide the ${alert.exercise_name} alert until three more workouts without a new PR.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ignore',
          onPress: async () => {
            if (!exerciseStagnationRepo) return;

            try {
              setIgnoringExerciseId(alert.exercise_id);
              await exerciseStagnationRepo.ignoreAlert(alert.exercise_id);
              setAlerts((current) => current.filter((item) => item.exercise_id !== alert.exercise_id));
            } catch (error) {
              console.error('Error ignoring progress alert:', error);
              Alert.alert('Unable to update alert', 'Please try again.');
            } finally {
              setIgnoringExerciseId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Close progress alerts">
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Progress Alerts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : hasError ? (
        <View style={styles.centeredState}>
          <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
          <Text style={[styles.stateTitle, { color: colors.text }]}>Unable to load alerts</Text>
          <Pressable
            onPress={loadAlerts}
            style={({ pressed }) => [styles.retryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading progress alerts">
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : alerts.length === 0 ? (
        <View style={styles.centeredState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentSubtle }]}>
            <Ionicons name="checkmark" size={28} color={colors.accent} />
          </View>
          <Text style={[styles.stateTitle, { color: colors.text }]}>No active progress alerts</Text>
          <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>You are all caught up.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>Exercises that may need extra attention in your next workout.</Text>
          {alerts.map((alert) => {
            const isIgnoring = ignoringExerciseId === alert.exercise_id;

            return (
              <View key={alert.exercise_id} style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.warning }]}>
                <View style={styles.alertHeading}>
                  <View style={[styles.alertIcon, { backgroundColor: colors.warningSubtle }]}>
                    <Ionicons accessible={false} name="alert-circle-outline" size={21} color={colors.warning} />
                  </View>
                  <View style={styles.alertHeadingText}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>{alert.exercise_name}</Text>
                    <Text style={[styles.alertLabel, { color: colors.textSecondary }]}>PROGRESS ALERT</Text>
                  </View>
                </View>
                <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>{alertMessage(alert)}</Text>
                <Pressable
                  onPress={() => handleIgnore(alert)}
                  disabled={isIgnoring}
                  style={({ pressed }) => [
                    styles.ignoreButton,
                    { borderColor: colors.border, opacity: pressed || isIgnoring ? 0.6 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ignore ${alert.exercise_name} progress alert`}
                  accessibilityHint="Hides this alert until three more workouts without a new personal record">
                  {isIgnoring ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[styles.ignoreButtonText, { color: colors.primary }]}>Ignore</Text>}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 56, paddingHorizontal: Spacing.three, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  headerButton: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  headerSpacer: { width: 44 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  intro: { fontSize: 14, lineHeight: 21 },
  alertCard: { borderWidth: 1, borderRadius: 20, padding: Spacing.three },
  alertHeading: { flexDirection: 'row', alignItems: 'center' },
  alertIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.two },
  alertHeadingText: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '700' },
  alertLabel: { fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  alertMessage: { fontSize: 14, lineHeight: 21, marginTop: Spacing.three },
  ignoreButton: { minHeight: 44, marginTop: Spacing.three, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ignoreButtonText: { fontSize: 14, fontWeight: '700' },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  stateTitle: { marginTop: Spacing.three, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  stateSubtitle: { marginTop: Spacing.one, fontSize: 14, textAlign: 'center' },
  retryButton: { minHeight: 44, paddingHorizontal: Spacing.three, borderRadius: 10, justifyContent: 'center', marginTop: Spacing.three },
  retryButtonText: { color: '#FFFFFF', fontWeight: '700' },
});
