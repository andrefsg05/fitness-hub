import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { ExerciseStagnationAlert } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WorkoutProgressReminderProps {
  workoutTypeName: string;
  alerts: ExerciseStagnationAlert[];
  isStarting: boolean;
  hasStartError: boolean;
  onBack: () => void;
  onStart: () => void;
}

export function WorkoutProgressReminder({
  workoutTypeName,
  alerts,
  isStarting,
  hasStartError,
  onBack,
  onStart,
}: WorkoutProgressReminderProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const buttonTextColor = scheme === 'dark' ? colors.background : colors.card;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentWidth}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            disabled={isStarting}
            accessibilityRole="button"
            accessibilityLabel="Back to workout selection"
            accessibilityState={{ disabled: isStarting }}
            style={({ pressed }) => [styles.backButton, { opacity: pressed || isStarting ? 0.5 : 1 }]}>
            <Ionicons accessible={false} name="arrow-back" size={22} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
          </Pressable>
          <View style={[styles.routineBadge, { backgroundColor: colors.primarySubtle }]}>
            <Text style={[styles.routineText, { color: colors.primary }]}>{workoutTypeName}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            A little extra focus today
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {alerts.length === 1 ? '1 exercise has an active PR progress alert' : `${alerts.length} exercises have active PR progress alerts`} for your {workoutTypeName} workout.
          </Text>

          <View style={styles.alerts}>
            {alerts.map((alert) => (
              <View key={alert.exercise_id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeading}>
                  <View style={[styles.alertIcon, { backgroundColor: colors.warningSubtle }]}>
                    <Ionicons accessible={false} name="alert-circle-outline" size={20} color={colors.warning} />
                  </View>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>{alert.exercise_name}</Text>
                </View>
                <Text style={[styles.alertMessage, { color: colors.textSecondary }]}>
                  No new PR in {alert.non_pr_workout_count} {alert.non_pr_workout_count === 1 ? 'workout' : 'workouts'} with this exercise.
                </Text>
                <View style={[styles.prRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.prLabel, { color: colors.textSecondary }]}>CURRENT PR</Text>
                  <Text style={[styles.prValue, { color: colors.text }]}>
                    {alert.pr_weight.toLocaleString()} kg × {alert.pr_reps} reps
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={[styles.footnote, { color: colors.textSecondary }]}>
            Keep these exercises in mind as you plan your session.
          </Text>
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          {hasStartError && (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
              Unable to start your workout. Please try again.
            </Text>
          )}
          <Pressable
            onPress={onStart}
            disabled={isStarting}
            accessibilityRole="button"
            accessibilityState={{ disabled: isStarting, busy: isStarting }}
            style={({ pressed }) => [styles.startButton, { backgroundColor: colors.primary, opacity: pressed || isStarting ? 0.7 : 1 }]}>
            {isStarting && <ActivityIndicator color={buttonTextColor} />}
            <Text style={[styles.startButtonText, { color: buttonTextColor }]}>{isStarting ? 'Starting workout…' : `Start ${workoutTypeName} Workout`}</Text>
            {!isStarting && <Ionicons accessible={false} name="arrow-forward" size={20} color={buttonTextColor} />}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWidth: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  backButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backText: { fontSize: 16, fontWeight: '600' },
  routineBadge: { flexShrink: 1, paddingHorizontal: 12, paddingVertical: Spacing.two, borderRadius: 12 },
  routineText: { fontSize: 13, fontWeight: '700' },
  scrollContent: { padding: Spacing.four, paddingTop: Spacing.three },
  heroIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, marginBottom: Spacing.two },
  subtitle: { fontSize: 16, lineHeight: 24 },
  alerts: { gap: Spacing.three, marginTop: Spacing.four },
  card: { borderWidth: 1, borderRadius: 20, padding: Spacing.three },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  alertIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exerciseName: { flex: 1, fontSize: 17, fontWeight: '700' },
  alertMessage: { fontSize: 14, lineHeight: 21, marginTop: Spacing.two },
  prRow: { borderTopWidth: 1, marginTop: Spacing.three, paddingTop: Spacing.three, gap: Spacing.one },
  prLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  prValue: { fontSize: 22, fontWeight: '700' },
  footnote: { marginTop: Spacing.three, fontSize: 13, lineHeight: 20 },
  footer: { padding: Spacing.three, borderTopWidth: 1 },
  error: { fontSize: 14, lineHeight: 21, marginBottom: Spacing.two },
  startButton: { minHeight: 56, borderRadius: 16, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  startButtonText: { flexShrink: 1, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
