import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useHabits } from '@/hooks/useHabits';
import { useDatabase } from '@/context/DatabaseContext';
import { Colors, Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const { user, latestWeight, goals, logWeight, addGoal, toggleGoal, deleteGoal, refresh: refreshProfile } = useUserProfile();
  const { habits, addHabit, toggleActive, deleteHabit, refresh: refreshHabits } = useHabits();
  const { exerciseRepo } = useDatabase();

  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');

  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitTime, setHabitTime] = useState('08:00');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekdays' | 'weekly'>('daily');

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState('Push');

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), refreshHabits()]);
    setRefreshing(false);
  };

  const handleLogWeight = async () => {
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed <= 0) return;
    await logWeight(parsed);
    setWeightInput('');
    setShowWeightModal(false);
  };

  const handleAddGoal = async () => {
    if (!goalTitle.trim()) return;
    await addGoal(goalTitle.trim(), goalDate.trim() || null);
    setGoalTitle('');
    setGoalDate('');
    setShowGoalModal(false);
  };

  const handleAddHabit = async () => {
    if (!habitName.trim()) return;
    await addHabit(habitName.trim(), habitFrequency, habitTime.trim() || null);
    setHabitName('');
    setShowHabitModal(false);
  };

  const handleAddExercise = async () => {
    if (!exerciseName.trim() || !exerciseCategory.trim() || !exerciseRepo) return;
    await exerciseRepo.create(exerciseName.trim(), exerciseCategory.trim());
    setExerciseName('');
    setShowExerciseModal(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
      
      {/* User Header Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name?.[0] ?? 'A').toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Athlete'}</Text>
          <Text style={[styles.userSubtitle, { color: colors.textSecondary }]}>Personal Fitness Profile</Text>
        </View>
      </View>

      {/* Bodyweight Section */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bodyweight</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {latestWeight ? `Current: ${latestWeight.weight} kg (${latestWeight.date})` : 'No weight logged yet'}
            </Text>
          </View>
          <Pressable
            style={[styles.smallActionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowWeightModal(true)}>
            <Text style={styles.smallActionText}>+ Log Weight</Text>
          </Pressable>
        </View>
      </View>

      {/* Goals Section */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.mainSectionTitle, { color: colors.text }]}>Goals & Targets</Text>
        <Pressable
          style={[styles.smallActionBtn, { backgroundColor: colors.backgroundElement }]}
          onPress={() => setShowGoalModal(true)}>
          <Text style={[styles.smallActionTextSecondary, { color: colors.text }]}>+ New Goal</Text>
        </Pressable>
      </View>

      {goals.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No fitness goals set yet.</Text>
        </View>
      ) : (
        <View style={[styles.itemsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {goals.map((g, idx) => (
            <View
              key={g.id}
              style={[
                styles.itemRow,
                idx < goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}>
              <Pressable
                style={[styles.checkbox, g.is_completed === 1 && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                onPress={() => toggleGoal(g.id, g.is_completed !== 1)}>
                {g.is_completed === 1 && <Text style={styles.checkmark}>✓</Text>}
              </Pressable>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.text }, g.is_completed === 1 && styles.completedText]}>
                  {g.title}
                </Text>
                {g.target_date && (
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Target: {g.target_date}</Text>
                )}
              </View>
              <Pressable onPress={() => deleteGoal(g.id)} style={{ padding: 6 }}>
                <Text style={{ color: colors.danger, fontSize: 13 }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Habits & Reminders Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: Spacing.four }]}>
        <Text style={[styles.mainSectionTitle, { color: colors.text }]}>Habits & Reminders</Text>
        <Pressable
          style={[styles.smallActionBtn, { backgroundColor: colors.backgroundElement }]}
          onPress={() => setShowHabitModal(true)}>
          <Text style={[styles.smallActionTextSecondary, { color: colors.text }]}>+ New Habit</Text>
        </Pressable>
      </View>

      {habits.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No habits registered.</Text>
        </View>
      ) : (
        <View style={[styles.itemsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {habits.map((h, idx) => (
            <View
              key={h.id}
              style={[
                styles.itemRow,
                idx < habits.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{h.name}</Text>
                <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                  {h.frequency} • {h.reminder_time ? `⏰ ${h.reminder_time}` : 'No reminder'}
                </Text>
              </View>
              <Switch
                value={h.is_active === 1}
                onValueChange={(val) => toggleActive(h.id, val)}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>
          ))}
        </View>
      )}

      {/* Custom Exercises Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: Spacing.four }]}>
        <Text style={[styles.mainSectionTitle, { color: colors.text }]}>Custom Exercises</Text>
        <Pressable
          style={[styles.smallActionBtn, { backgroundColor: colors.backgroundElement }]}
          onPress={() => setShowExerciseModal(true)}>
          <Text style={[styles.smallActionTextSecondary, { color: colors.text }]}>+ Add Exercise</Text>
        </Pressable>
      </View>

      {/* Modal: Log Weight */}
      <Modal visible={showWeightModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Log Today's Bodyweight</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. 81.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={weightInput}
              onChangeText={setWeightInput}
              autoFocus
            />
            <View style={styles.dialogActions}>
              <Pressable style={styles.dialogCancelBtn} onPress={() => setShowWeightModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.dialogConfirmBtn, { backgroundColor: colors.primary }]} onPress={handleLogWeight}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: New Goal */}
      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Add New Goal</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Squat 140kg or Run 5k"
              placeholderTextColor={colors.textSecondary}
              value={goalTitle}
              onChangeText={setGoalTitle}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="Target Date (YYYY-MM-DD)"
              placeholderTextColor={colors.textSecondary}
              value={goalDate}
              onChangeText={setGoalDate}
            />
            <View style={styles.dialogActions}>
              <Pressable style={styles.dialogCancelBtn} onPress={() => setShowGoalModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.dialogConfirmBtn, { backgroundColor: colors.primary }]} onPress={handleAddGoal}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Add Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: New Habit */}
      <Modal visible={showHabitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>New Habit / Reminder</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. Drink 3L Water"
              placeholderTextColor={colors.textSecondary}
              value={habitName}
              onChangeText={setHabitName}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="Reminder Time (e.g. 08:30)"
              placeholderTextColor={colors.textSecondary}
              value={habitTime}
              onChangeText={setHabitTime}
            />
            <View style={styles.dialogActions}>
              <Pressable style={styles.dialogCancelBtn} onPress={() => setShowHabitModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.dialogConfirmBtn, { backgroundColor: colors.primary }]} onPress={handleAddHabit}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save Habit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Custom Exercise */}
      <Modal visible={showExerciseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Create Custom Exercise</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="Exercise Name (e.g. Cable Lateral Raise)"
              placeholderTextColor={colors.textSecondary}
              value={exerciseName}
              onChangeText={setExerciseName}
            />
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
              placeholder="Category (e.g. Push, Pull, Legs)"
              placeholderTextColor={colors.textSecondary}
              value={exerciseCategory}
              onChangeText={setExerciseCategory}
            />
            <View style={styles.dialogActions}>
              <Pressable style={styles.dialogCancelBtn} onPress={() => setShowExerciseModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.dialogConfirmBtn, { backgroundColor: colors.primary }]} onPress={handleAddExercise}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save</Text>
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
    paddingTop: Spacing.five,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.four,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  mainSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  smallActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  smallActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  smallActionTextSecondary: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: 14,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
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
    marginBottom: Spacing.three,
  },
  textInput: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: Spacing.three,
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
});
