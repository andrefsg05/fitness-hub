import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { Goal } from '@/types';

interface GoalsTabProps {
  goals: Goal[];
  onAddGoal: (title: string, targetDate?: string | null) => Promise<void>;
  onToggleGoal: (id: string, isCompleted: boolean) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export function GoalsTab({
  goals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
}: GoalsTabProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = goals.filter((g) => g.is_completed === 1).length;
  const totalCount = goals.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddGoal(goalTitle.trim(), goalDate.trim() || null);
      setGoalTitle('');
      setGoalDate('');
      setShowGoalModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (goalId: string, title: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteGoal(goalId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Progress Banner & Action */}
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals & Targets</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {totalCount === 0
                ? 'No targets defined yet'
                : `${completedCount} of ${totalCount} completed (${Math.round(progressRatio * 100)}%)`}
            </Text>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowGoalModal(true)}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Goal</Text>
          </Pressable>
        </View>

        {totalCount > 0 && (
          <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundElement }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(progressRatio * 100)}%`,
                  backgroundColor: progressRatio === 1 ? colors.accent : colors.primary,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* 2. Goals List or Empty State */}
      {goals.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="flag-outline" size={28} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No fitness goals set</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Stay motivated by tracking strength targets, running milestones, or habit goals.
          </Text>
          <Pressable
            style={[styles.emptyActionBtn, { backgroundColor: colors.primarySubtle }]}
            onPress={() => setShowGoalModal(true)}>
            <Text style={[styles.emptyActionText, { color: colors.primary }]}>+ Add Your First Goal</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {goals.map((g, idx) => {
            const isCompleted = g.is_completed === 1;

            return (
              <View
                key={g.id}
                style={[
                  styles.itemRow,
                  idx < goals.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}>
                <Pressable
                  style={[
                    styles.checkbox,
                    { borderColor: isCompleted ? colors.accent : colors.border },
                    isCompleted && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => onToggleGoal(g.id, !isCompleted)}>
                  {isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </Pressable>

                <View style={styles.itemContent}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: colors.text },
                      isCompleted && { textDecorationLine: 'line-through', opacity: 0.5 },
                    ]}>
                    {g.title}
                  </Text>
                  {g.target_date && (
                    <View style={styles.dateTag}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                      <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        Target: {g.target_date}
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={() => confirmDelete(g.id, g.title)}
                  style={styles.deleteBtn}
                  hitSlop={8}>
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Modal: Add New Goal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Add New Goal</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Goal Description</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Squat 140kg or Bench 100kg"
              placeholderTextColor={colors.textSecondary}
              value={goalTitle}
              onChangeText={setGoalTitle}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Target Date (optional, YYYY-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. 2026-12-31"
              placeholderTextColor={colors.textSecondary}
              value={goalDate}
              onChangeText={setGoalDate}
            />

            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancelBtn}
                onPress={() => setShowGoalModal(false)}
                disabled={isSubmitting}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dialogConfirmBtn,
                  { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
                ]}
                onPress={handleCreateGoal}
                disabled={isSubmitting || !goalTitle.trim()}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {isSubmitting ? 'Adding...' : 'Add Goal'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  headerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.three,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  listCard: {
    borderRadius: 20,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: Spacing.two,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  emptyActionBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 13,
    fontWeight: '700',
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
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
    marginTop: Spacing.one,
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
