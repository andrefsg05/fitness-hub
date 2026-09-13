import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useActiveWorkout } from '@/hooks/useActiveWorkout';
import { useDatabase } from '@/context/DatabaseContext';
import { Exercise, WorkoutType } from '@/types';
import { Colors, Spacing } from '@/constants/theme';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const {
    activeWorkout,
    isLoading,
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    deleteSet,
    finishWorkout,
    discardWorkout,
  } = useActiveWorkout();

  const { workoutTypeRepo, exerciseRepo } = useDatabase();

  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedWorkoutTypeId, setSelectedWorkoutTypeId] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      if (workoutTypeRepo && exerciseRepo) {
        const [types, exs] = await Promise.all([
          workoutTypeRepo.getAll(),
          exerciseRepo.getAll(),
        ]);
        setWorkoutTypes(types);
        setAvailableExercises(exs);
        if (types.length > 0) {
          setSelectedWorkoutTypeId(types[0].id);
        }
      }
    }
    loadInitialData();
  }, [workoutTypeRepo, exerciseRepo]);

  const handleStartWorkout = async () => {
    if (!selectedWorkoutTypeId) return;
    await startWorkout(selectedWorkoutTypeId);
  };

  const handleAddExerciseToWorkout = async (exerciseId: string) => {
    await addExercise(exerciseId);
    setShowAddExerciseModal(false);
  };

  const handleAddSetToExercise = async (workoutExerciseId: string, currentSetsCount: number, lastWeight: number, lastReps: number) => {
    await addSet(workoutExerciseId, currentSetsCount + 1, lastWeight, lastReps);
  };

  const handleFinish = async () => {
    await finishWorkout(notes.trim() || null);
    router.replace('/');
  };

  const handleDiscard = () => {
    // In web and mobile Alert or confirmation
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout? All recorded sets will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            await discardWorkout();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // State 1: No active workout -> Start Screen
  if (!activeWorkout) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Start Workout</Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select your workout routine to begin recording:
        </Text>

        <View style={styles.typesGrid}>
          {workoutTypes.map((type) => {
            const isSelected = selectedWorkoutTypeId === type.id;
            return (
              <Pressable
                key={type.id}
                style={[
                  styles.typeCard,
                  { backgroundColor: isSelected ? colors.primarySubtle : colors.card, borderColor: isSelected ? colors.primary : colors.border },
                ]}
                onPress={() => setSelectedWorkoutTypeId(type.id)}>
                <Text style={[styles.typeName, { color: isSelected ? colors.primary : colors.text }]}>
                  {type.name}
                </Text>
                {type.is_custom === 1 && (
                  <Text style={[styles.customBadge, { color: colors.textSecondary }]}>Custom</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleStartWorkout}>
          <Text style={styles.primaryBtnText}>Begin Workout Session 🚀</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // State 2: Active workout in progress
  const filteredExercises = availableExercises.filter(
    (ex) => !activeWorkout.exercises.some((we) => we.exercise_id === ex.id)
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.activeTag, { color: colors.accent }]}>● LIVE WORKOUT</Text>
          <Text style={[styles.title, { color: colors.text }]}>{activeWorkout.workout_type_name}</Text>
        </View>

        <Pressable style={styles.discardBtn} onPress={handleDiscard}>
          <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13 }}>Discard</Text>
        </Pressable>
      </View>

      {/* Exercises List */}
      {activeWorkout.exercises.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No exercises added yet. Tap below to select exercises for your {activeWorkout.workout_type_name} routine.
          </Text>
        </View>
      ) : (
        activeWorkout.exercises.map((we, index) => (
          <View key={we.id} style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.exerciseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  {index + 1}. {we.exercise_name}
                </Text>
                <Text style={[styles.exerciseCategory, { color: colors.textSecondary }]}>{we.category}</Text>
              </View>
              <Pressable onPress={() => removeExercise(we.id)} style={{ padding: 4 }}>
                <Text style={{ color: colors.danger, fontSize: 12 }}>Remove</Text>
              </Pressable>
            </View>

            {/* Sets Table */}
            <View style={styles.setTableHeader}>
              <Text style={[styles.setTh, { width: 40, color: colors.textSecondary }]}>SET</Text>
              <Text style={[styles.setTh, { flex: 1, color: colors.textSecondary }]}>KG</Text>
              <Text style={[styles.setTh, { flex: 1, color: colors.textSecondary }]}>REPS</Text>
              <Text style={[styles.setTh, { width: 36, color: colors.textSecondary }]}></Text>
            </View>

            {we.sets.map((set, sIdx) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setNumber, { color: colors.textSecondary }]}>{sIdx + 1}</Text>
                <TextInput
                  style={[styles.setInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  keyboardType="numeric"
                  defaultValue={set.weight > 0 ? String(set.weight) : ''}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  onEndEditing={(e) => {
                    const w = parseFloat(e.nativeEvent.text) || 0;
                    updateSet(set.id, w, set.reps);
                  }}
                />
                <TextInput
                  style={[styles.setInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  keyboardType="numeric"
                  defaultValue={set.reps > 0 ? String(set.reps) : ''}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                  onEndEditing={(e) => {
                    const r = parseInt(e.nativeEvent.text, 10) || 0;
                    updateSet(set.id, set.weight, r);
                  }}
                />
                <Pressable onPress={() => deleteSet(set.id)} style={styles.deleteSetBtn}>
                  <Text style={{ color: colors.danger, fontSize: 14 }}>✕</Text>
                </Pressable>
              </View>
            ))}

            <Pressable
              style={[styles.addSetBtn, { backgroundColor: colors.backgroundElement }]}
              onPress={() => {
                const lastSet = we.sets[we.sets.length - 1];
                handleAddSetToExercise(we.id, we.sets.length, lastSet?.weight ?? 0, lastSet?.reps ?? 0);
              }}>
              <Text style={[styles.addSetBtnText, { color: colors.primary }]}>+ Add Set</Text>
            </Pressable>
          </View>
        ))
      )}

      {/* Add Exercise Button */}
      <Pressable
        style={[styles.addExerciseBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
        onPress={() => setShowAddExerciseModal(true)}>
        <Text style={[styles.addExerciseBtnText, { color: colors.text }]}>+ Add Exercise</Text>
      </Pressable>

      {/* Workout Notes */}
      <View style={{ marginTop: Spacing.four }}>
        <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Workout Notes (optional)</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="e.g. Great energy today, good pump on bench"
          placeholderTextColor={colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {/* Finish Workout CTA */}
      <Pressable
        style={[styles.finishBtn, { backgroundColor: colors.accent }]}
        onPress={handleFinish}>
        <Text style={styles.finishBtnText}>Finish Workout ✓</Text>
      </Pressable>

      {/* Modal: Select Exercise */}
      <Modal visible={showAddExerciseModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Exercise</Text>
            <Pressable onPress={() => setShowAddExerciseModal(false)}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Done</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.exerciseSelectionList}>
            {filteredExercises.map((ex) => (
              <Pressable
                key={ex.id}
                style={[styles.exerciseSelectItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleAddExerciseToWorkout(ex.id)}>
                <View>
                  <Text style={[styles.exerciseSelectName, { color: colors.text }]}>{ex.name}</Text>
                  <Text style={[styles.exerciseSelectCategory, { color: colors.textSecondary }]}>{ex.category}</Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>+ Add</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  backBtn: {
    marginBottom: Spacing.two,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  activeTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.three,
  },
  typesGrid: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  typeCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeName: {
    fontSize: 16,
    fontWeight: '700',
  },
  customBadge: {
    fontSize: 12,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  discardBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  setTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  setTh: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 8,
  },
  setNumber: {
    width: 36,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
  },
  setInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteSetBtn: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addSetBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addExerciseBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  addExerciseBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  finishBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  finishBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 14,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: Spacing.two,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseSelectionList: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  exerciseSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  exerciseSelectName: {
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseSelectCategory: {
    fontSize: 12,
    marginTop: 2,
  },
});
