import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { WorkoutActionBanner } from '@/components/WorkoutActionBanner';
import { WorkoutCard } from '@/components/WorkoutCard';
import { useWorkoutsStore } from '@/stores/useWorkoutsStore';
import { useActiveWorkoutStore } from '@/stores/useActiveWorkoutStore';
import { Colors, Spacing } from '@/constants/theme';

export default function WorkoutsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const { recentWorkouts, history, isLoading, fetchWorkouts } = useWorkoutsStore();
  const fetchActiveWorkout = useActiveWorkoutStore((state) => state.fetchActiveWorkout);

  const [refreshing, setRefreshing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  React.useEffect(() => {
    fetchWorkouts();
    fetchActiveWorkout();
  }, [fetchWorkouts, fetchActiveWorkout]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWorkouts(), fetchActiveWorkout()]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

      <AppHeader />

      {/* Title */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pretitle, { color: colors.textSecondary }]}>My</Text>
          <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
        </View>
        <View style={styles.statContainer}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Workouts</Text>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {history.length}
          </Text>
        </View>
      </View>

      {/* Workout Action (Start New or Resume Active) */}
      <WorkoutActionBanner />

      {/* Last 3 Workouts Section */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Workouts</Text>
        <Pressable onPress={() => setShowHistoryModal(true)} hitSlop={8}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : recentWorkouts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No workouts recorded yet. Start recording your sessions!
          </Text>
        </View>
      ) : (
        recentWorkouts.map((workout) => <WorkoutCard key={workout.id} workout={workout} />)
      )}

      {/* Modal: Full Workout History */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistoryModal(false)}>
        <SafeAreaView edges={['top', 'bottom']} style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Workout History</Text>
            <Pressable onPress={() => setShowHistoryModal(false)}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Done</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.historyList}>
            {history.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </ScrollView>
        </SafeAreaView>
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
    paddingTop: Spacing.half,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  statContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  statDivider: {
    height: 1,
    width: '100%',
    minWidth: 64,
    marginVertical: 4,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  pretitle: {
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
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
  historyList: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
});
