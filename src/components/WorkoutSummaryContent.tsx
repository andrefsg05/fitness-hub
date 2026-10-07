import { PrBadge } from '@/components/PrBadge';
import { Colors, Spacing } from '@/constants/theme';
import { WorkoutExerciseWithDetails, WorkoutWithDetails } from '@/types';
import type { ReactNode } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

interface WorkoutSummaryContentProps {
  workout: WorkoutWithDetails;
  leadingContent?: ReactNode;
  bottomPadding?: number;
}

function ExerciseCard({
  exercise,
  colors,
}: {
  exercise: WorkoutExerciseWithDetails;
  colors: (typeof Colors)['light'] | (typeof Colors)['dark'];
}) {
  return (
    <View style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.exerciseHeader}>
        <Text style={[styles.exerciseName, { color: colors.text }]}>{exercise.exercise_name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primarySubtle }]}>
          <Text style={[styles.categoryText, { color: colors.primary }]}>{exercise.category}</Text>
        </View>
      </View>

      <View style={[styles.setsTable, { borderTopColor: colors.border }]}>
        <View style={styles.setRow}>
          <Text style={[styles.setHeaderText, { color: colors.textSecondary }, styles.setCol]}>SET</Text>
          <Text style={[styles.setHeaderText, { color: colors.textSecondary }, styles.weightCol]}>WEIGHT</Text>
          <Text style={[styles.setHeaderText, { color: colors.textSecondary }, styles.repsCol]}>REPS</Text>
        </View>

        {exercise.sets.map((set) => (
          <View key={set.id}>
            <View style={[styles.setRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.setNumberText, { color: colors.textSecondary }, styles.setCol]}>
                {set.set_number}
              </Text>
              <Text style={[styles.setValueText, { color: colors.text }, styles.weightCol]}>
                {set.weight} <Text style={styles.unitText}>kg</Text>
              </Text>
              <View style={styles.repsCell}>
                <Text style={[styles.setValueText, { color: colors.text }]}>{set.reps}</Text>
                {set.is_pr ? (
                  <View style={styles.repsPrBadge}>
                    <PrBadge exerciseId={exercise.exercise_id} />
                  </View>
                ) : null}
              </View>
            </View>

            {set.drop_sets?.map((drop, index) => (
              <View
                key={drop.id}
                style={[
                  styles.setRow,
                  styles.dropSetRow,
                  { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}>
                <Text style={[styles.dropSetLabel, { color: colors.textSecondary }, styles.setCol]}>
                  {index + 1}º drop
                </Text>
                <Text style={[styles.dropSetValueText, { color: colors.textSecondary }, styles.weightCol]}>
                  {drop.weight} <Text style={styles.unitText}>kg</Text>
                </Text>
                <View style={styles.repsCell}>
                  <Text style={[styles.dropSetValueText, { color: colors.textSecondary }]}>
                    {drop.reps}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function WorkoutSummaryContent({
  workout,
  leadingContent,
  bottomPadding = Spacing.six,
}: WorkoutSummaryContentProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <FlatList
      data={workout.exercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ExerciseCard exercise={item} colors={colors} />}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {leadingContent}

          <Text style={[styles.workoutTypeName, { color: colors.text }]}>
            {workout.workout_type_name}
          </Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formattedDate}</Text>

          <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{workout.total_sets}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Sets</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {workout.total_volume.toLocaleString()} <Text style={styles.unitText}>kg</Text>
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Volume</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>{workout.exercises.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Exercises</Text>
            </View>
          </View>

          {workout.notes ? (
            <View style={[styles.notesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
              <Text style={[styles.notesText, { color: colors.text }]}>{workout.notes}</Text>
            </View>
          ) : null}

          <Text style={[styles.exercisesSectionTitle, { color: colors.text }]}>Exercises</Text>
        </>
      }
      ListEmptyComponent={
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No exercises recorded for this workout.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
  },
  workoutTypeName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: Spacing.five,
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    marginTop: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.one,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exercisesSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    borderWidth: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  categoryBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: Spacing.two,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  setsTable: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  setCol: {
    width: 56,
    textAlign: 'center',
  },
  weightCol: {
    flex: 1,
    textAlign: 'center',
  },
  repsCol: {
    flex: 1,
    textAlign: 'center',
  },
  repsCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  repsPrBadge: {
    position: 'absolute',
    right: Spacing.two,
  },
  setHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  setValueText: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dropSetRow: {
    paddingVertical: 5,
  },
  dropSetLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  dropSetValueText: {
    fontSize: 13,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    borderRadius: 14,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
