import { Colors } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { Exercise, ExercisePR } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Estimated One Rep Max (Epley Formula)
function calculateEstimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  const estimated = weight * (1 + reps / 30);
  return Math.round(estimated * 10) / 10;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export default function ExercisePrsScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const isDark = scheme === 'dark';

  const { exerciseRepo, exercisePrRepo, isReady } = useDatabase();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(exerciseId || null);
  const [prs, setPrs] = useState<ExercisePR[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isLoadingPrs, setIsLoadingPrs] = useState(false);

  // Exercise selection modal state
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load all exercises
  useEffect(() => {
    async function loadExercises() {
      if (!exerciseRepo || !isReady) return;
      try {
        setIsLoadingExercises(true);
        const allExercises = await exerciseRepo.getAll();
        setExercises(allExercises);

        // If no exerciseId provided or current selected isn't set, default to first or requested
        if (!selectedExerciseId) {
          if (exerciseId) {
            setSelectedExerciseId(exerciseId);
          } else if (allExercises.length > 0) {
            setSelectedExerciseId(allExercises[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching exercises:', err);
      } finally {
        setIsLoadingExercises(false);
      }
    }

    loadExercises();
  }, [exerciseRepo, isReady, exerciseId]);

  // Update selected if query param changes
  useEffect(() => {
    if (exerciseId && exerciseId !== selectedExerciseId) {
      setSelectedExerciseId(exerciseId);
    }
  }, [exerciseId]);

  // 2. Load PRs when selectedExerciseId changes
  useEffect(() => {
    async function loadPrs() {
      if (!exercisePrRepo || !isReady || !selectedExerciseId) {
        setPrs([]);
        return;
      }

      try {
        setIsLoadingPrs(true);
        const history = await exercisePrRepo.getPRHistory(selectedExerciseId);
        setPrs(history);
      } catch (err) {
        console.error('Error fetching PRs for exercise:', err);
      } finally {
        setIsLoadingPrs(false);
      }
    }

    loadPrs();
  }, [exercisePrRepo, isReady, selectedExerciseId]);

  const selectedExercise = useMemo(() => {
    return exercises.find((e) => e.id === selectedExerciseId) || null;
  }, [exercises, selectedExerciseId]);

  // Active PR: either explicitly flagged as active or the latest record
  const activePr = useMemo(() => {
    return prs.find((p) => p.is_active === 1) || (prs.length > 0 ? prs[0] : null);
  }, [prs]);

  // Historical PRs: all others excluding the active PR
  const previousPrs = useMemo(() => {
    if (!activePr) return [];
    return prs.filter((p) => p.id !== activePr.id);
  }, [prs, activePr]);

  // Filtered exercises for the selection modal
  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.category && e.category.toLowerCase().includes(q))
    );
  }, [exercises, searchQuery]);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExerciseId(exercise.id);
    setIsSelectorOpen(false);
    setSearchQuery('');
  };

  const active1RM = activePr
    ? calculateEstimatedOneRepMax(activePr.weight, activePr.reps)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Records</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Selector Bar */}
        <View style={styles.selectorSection}>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            SELECTED EXERCISE
          </Text>
          <Pressable
            onPress={() => setIsSelectorOpen(true)}
            style={({ pressed }) => [
              styles.exercisePickerButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={styles.exercisePickerInfo}>
              <View style={[styles.pickerIconBadge, { backgroundColor: colors.primarySubtle }]}>
                <Ionicons name="barbell-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.pickerTextContainer}>
                <Text
                  style={[styles.pickerExerciseName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {selectedExercise ? selectedExercise.name : 'Select Exercise'}
                </Text>
                {selectedExercise?.category ? (
                  <Text style={[styles.pickerExerciseCategory, { color: colors.textSecondary }]}>
                    {selectedExercise.category}
                  </Text>
                ) : null}
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Content Area */}
        {isLoadingExercises || isLoadingPrs ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Active PR Card */}
            <View style={styles.cardSection}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                CURRENT RECORD
              </Text>

              {activePr ? (
                <View
                  style={[
                    styles.activePrCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isDark ? '#f59e0b40' : '#fcd34d',
                    },
                  ]}
                >
                  <View style={styles.activePrBadgeRow}>
                    <View
                      style={[
                        styles.activeBadge,
                        { backgroundColor: isDark ? '#ec8a0030' : '#FEF3C7' },
                      ]}
                    >
                      <Ionicons
                        name="trophy"
                        size={13}
                        color={isDark ? '#FBBF24' : '#D97706'}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.activeBadgeText,
                          { color: isDark ? '#FBBF24' : '#B45309' },
                        ]}
                      >
                        CURRENT PR
                      </Text>
                    </View>
                    <Text style={[styles.activePrDate, { color: colors.textSecondary }]}>
                      {formatDate(activePr.achieved_at)}
                    </Text>
                  </View>

                  <View style={styles.activePrMainRow}>
                    <View style={styles.activePrMetric}>
                      <Text style={[styles.activePrValue, { color: colors.text }]}>
                        {activePr.weight}
                        <Text style={[styles.activePrUnit, { color: colors.primary }]}> kg</Text>
                      </Text>
                      <Text style={[styles.activePrLabel, { color: colors.textSecondary }]}>
                        WEIGHT
                      </Text>
                    </View>

                    <View style={[styles.activePrMetricDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.activePrMetric}>
                      <Text style={[styles.activePrValue, { color: colors.text }]}>
                        {activePr.reps}
                      </Text>
                      <Text style={[styles.activePrLabel, { color: colors.textSecondary }]}>
                        REPS
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.activePrFooter,
                      {
                        backgroundColor: colors.backgroundElement,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.oneRmBadge}>
                      <Ionicons name="flash-outline" size={14} color={colors.primary} />
                      <Text style={[styles.oneRmLabel, { color: colors.textSecondary }]}>
                        Estimated 1RM:
                      </Text>
                      <Text style={[styles.oneRmValue, { color: colors.text }]}>
                        {active1RM} kg
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyPrCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
                    <Ionicons name="barbell-outline" size={28} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.emptyPrTitle, { color: colors.text }]}>
                    No records yet
                  </Text>
                  <Text style={[styles.emptyPrText, { color: colors.textSecondary }]}>
                    No personal records logged for this exercise yet. Complete sets in your workouts to set your first PR!
                  </Text>
                </View>
              )}
            </View>

            {/* Previous PRs History Section */}
            {activePr && (
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    PREVIOUS RECORDS
                  </Text>
                </View>

                {previousPrs.length === 0 ? (
                  <View
                    style={[
                      styles.singlePrNotice,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                    <Text style={[styles.singlePrNoticeText, { color: colors.textSecondary }]}>
                      This is your first record for this exercise. As you progress, previous records will appear here!
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.historyList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {previousPrs.map((pastPr, idx) => {
                      const past1RM = calculateEstimatedOneRepMax(pastPr.weight, pastPr.reps);
                      const isLast = idx === previousPrs.length - 1;

                      return (
                        <View key={pastPr.id}>
                          <View style={styles.historyRow}>
                            <View style={styles.historyLeft}>
                              <View style={[styles.historyDot, { backgroundColor: colors.textSecondary }]} />
                              <View>
                                <View style={styles.historyStatsRow}>
                                  <Text style={[styles.historyWeight, { color: colors.text }]}>
                                    {pastPr.weight} <Text style={styles.historyUnit}>kg</Text>
                                  </Text>
                                  <Text style={[styles.historyTimes, { color: colors.textSecondary }]}>
                                    ×
                                  </Text>
                                  <Text style={[styles.historyReps, { color: colors.text }]}>
                                    {pastPr.reps} <Text style={styles.historyUnit}>reps</Text>
                                  </Text>
                                </View>
                                <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                                  {formatDate(pastPr.achieved_at)}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.historyRight}>
                              <Text style={[styles.historyOneRm, { color: colors.textSecondary }]}>
                                1RM ~{past1RM} kg
                              </Text>
                            </View>
                          </View>
                          {!isLast && (
                            <View
                              style={[styles.historyRowSeparator, { backgroundColor: colors.border }]}
                            />
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={isSelectorOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSelectorOpen(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Exercise</Text>
            <Pressable
              onPress={() => setIsSelectorOpen(false)}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Search Box */}
          <View style={styles.modalSearchContainer}>
            <View
              style={[
                styles.modalSearchInputWrapper,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Search exercise by name or category..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Exercises List */}
          <ScrollView
            contentContainerStyle={styles.modalListContent}
            keyboardShouldPersistTaps="handled"
          >
            {filteredExercises.length === 0 ? (
              <View style={styles.modalEmptyContainer}>
                <Text style={[styles.modalEmptyText, { color: colors.textSecondary }]}>
                  No exercises found.
                </Text>
              </View>
            ) : (
              filteredExercises.map((ex) => {
                const isSelected = ex.id === selectedExerciseId;
                return (
                  <Pressable
                    key={ex.id}
                    onPress={() => handleSelectExercise(ex)}
                    style={({ pressed }) => [
                      styles.modalExerciseItem,
                      {
                        backgroundColor: isSelected
                          ? colors.primarySubtle
                          : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <View style={styles.modalExerciseLeft}>
                      <Text
                        style={[
                          styles.modalExerciseName,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {ex.name}
                      </Text>
                      {ex.category ? (
                        <Text style={[styles.modalExerciseCategory, { color: colors.textSecondary }]}>
                          {ex.category}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorSection: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  exercisePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  exercisePickerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  pickerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerExerciseName: {
    fontSize: 15,
    fontWeight: '700',
  },
  pickerExerciseCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  cardSection: {
    marginBottom: 24,
  },
  activePrCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activePrBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activePrDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  activePrMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  activePrMetric: {
    alignItems: 'center',
    flex: 1,
  },
  activePrMetricDivider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
  },
  activePrValue: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  activePrUnit: {
    fontSize: 16,
    fontWeight: '600',
  },
  activePrLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  activePrFooter: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oneRmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  oneRmLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  oneRmValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyPrCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyPrTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyPrText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  historySection: {
    marginBottom: 20,
  },
  historyHeader: {
    marginBottom: 8,
  },
  singlePrNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  singlePrNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  historyList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  historyStatsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  historyWeight: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyUnit: {
    fontSize: 11,
    fontWeight: '500',
  },
  historyTimes: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 2,
  },
  historyReps: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyOneRm: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyRowSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 32,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalSearchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  modalListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalEmptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 14,
  },
  modalExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalExerciseLeft: {
    flex: 1,
  },
  modalExerciseName: {
    fontSize: 15,
  },
  modalExerciseCategory: {
    fontSize: 12,
    marginTop: 2,
  },
});
