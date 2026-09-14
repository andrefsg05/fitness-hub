import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { WorkoutWithDetails, WorkoutExerciseWithDetails } from '@/types';
import { Colors, Spacing } from '@/constants/theme';

interface WorkoutDetailsProps {
  workout: WorkoutWithDetails;
  onClose?: () => void;
  showCloseButton?: boolean;
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

      {/* Sets Table */}
      <View style={[styles.setsTable, { borderTopColor: colors.border }]}>
        {/* Table Header */}
        <View style={styles.setRow}>
          <Text style={[styles.setHeaderText, { color: colors.textSecondary }, styles.setCol]}>SET</Text>
          <Text style={[styles.setHeaderText, { color: colors.textSecondary }, styles.weightCol]}>WEIGHT</Text>
          <Text style={[styles.setHeaderText, { color: colors.textSecondary }, styles.repsCol]}>REPS</Text>
        </View>

        {exercise.sets.map((set) => (
          <View
            key={set.id}
            style={[
              styles.setRow,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <Text style={[styles.setNumberText, { color: colors.textSecondary }, styles.setCol]}>
              {set.set_number}
            </Text>
            <Text style={[styles.setValueText, { color: colors.text }, styles.weightCol]}>
              {set.weight} <Text style={styles.unitText}>kg</Text>
            </Text>
            <Text style={[styles.setValueText, { color: colors.text }, styles.repsCol]}>
              {set.reps}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function WorkoutDetails({ workout, onClose, showCloseButton = true }: WorkoutDetailsProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderExercise = ({ item }: { item: WorkoutExerciseWithDetails }) => (
    <ExerciseCard exercise={item} colors={colors} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <View style={styles.headerSection}>
        {showCloseButton && (
          <Pressable
            style={[styles.closeButton, { backgroundColor: colors.backgroundElement }]}
            onPress={onClose}
            hitSlop={12}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
          </Pressable>
        )}

        {/* Drag Handle Indicator */}
        {showCloseButton && (
          <View style={[styles.dragHandle, { backgroundColor: colors.textSecondary }]} />
        )}

        <Text style={[styles.workoutTypeName, { color: colors.text }]}>
          {workout.workout_type_name}
        </Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {formattedDate}
        </Text>

        {/* Stats Row */}
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

        {/* Notes */}
        {workout.notes && (
          <View style={[styles.notesContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.notesText, { color: colors.text }]}>{workout.notes}</Text>
          </View>
        )}

        {/* Section Title */}
        <Text style={[styles.exercisesSectionTitle, { color: colors.text }]}>Exercises</Text>
      </View>

      {/* Scrollable Exercise List */}
      <FlatList
        data={workout.exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.exerciseList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No exercises recorded for this workout.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  dragHandle: {
    width: 100,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.four,
    opacity: 0.3,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  workoutTypeName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
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
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    marginBottom: 4,
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
  exerciseList: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
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
    paddingVertical: 8,
  },
  setCol: {
    width: 48,
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
