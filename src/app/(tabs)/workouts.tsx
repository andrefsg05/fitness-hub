import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ActiveWorkoutBanner } from '@/components/ActiveWorkoutBanner';
import { WorkoutCard } from '@/components/WorkoutCard';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useDatabase } from '@/context/DatabaseContext';
import { Colors, Spacing } from '@/constants/theme';

export default function WorkoutsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const { recentWorkouts, history, isLoading, refresh } = useWorkouts();
  const { workoutTypeRepo } = useDatabase();

  const [refreshing, setRefreshing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCreateWorkoutType = async () => {
    if (!newTypeName.trim() || !workoutTypeRepo) return;
    await workoutTypeRepo.create(newTypeName.trim());
    setNewTypeName('');
    setShowNewTypeModal(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

      {/* Title */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pretitle, { color: colors.textSecondary }]}>My</Text>
          <Text style={[styles.title, { color: colors.text }]}>Workouts</Text>
        </View>
        <Pressable
          style={[styles.secondaryButton, { backgroundColor: colors.backgroundElement }]}
          onPress={() => setShowNewTypeModal(true)}>
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>+ Custom Type</Text>
        </Pressable>
      </View>

      {/* In Progress banner */}
      <ActiveWorkoutBanner />

      {/* Start Workout Button */}
      <Pressable
        style={({ pressed }) => [
          styles.ctaButton,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => router.push('/workout/active')}>
        <Text style={styles.ctaButtonText}>+ Start New Workout</Text>
      </Pressable>

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
      <Modal visible={showHistoryModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
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
        </View>
      </Modal>

      {/* Modal: Create Custom Workout Type */}
      <Modal visible={showNewTypeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Create Custom Workout Routine</Text>
            <Text style={[styles.dialogSubtitle, { color: colors.textSecondary }]}>
              Enter a name for your custom split or routine (e.g. "Upper A", "Arm Day").
            </Text>

            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="e.g. Arms & Shoulders"
              placeholderTextColor={colors.textSecondary}
              value={newTypeName}
              onChangeText={setNewTypeName}
              autoFocus
            />

            <View style={styles.dialogActions}>
              <Pressable
                style={[styles.dialogCancelBtn, { backgroundColor: colors.backgroundElement }]}
                onPress={() => setShowNewTypeModal(false)}>
                <Text style={[styles.dialogBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogConfirmBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateWorkoutType}>
                <Text style={[styles.dialogBtnText, { color: '#FFFFFF' }]}>Create</Text>
              </Pressable>
            </View>
          </View>
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
    paddingTop: Spacing.half,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  pretitle: {
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: Spacing.four,
    borderWidth: 1,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  dialogSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.three,
  },
  textInput: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: Spacing.four,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  dialogCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  dialogConfirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  dialogBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
