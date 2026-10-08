import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Switch,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, Spacing } from '@/constants/theme';
import { Habit } from '@/types';

interface RemindersTabProps {
  habits: Habit[];
  onAddHabit: (name: string, frequency: 'daily' | 'weekdays' | 'weekly', reminderTime: string) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDeleteHabit: (id: string) => Promise<void>;
}

export function RemindersTab({
  habits,
  onAddHabit,
  onToggleActive,
  onDeleteHabit,
}: RemindersTabProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekdays' | 'weekly'>('daily');
  const [habitDate, setHabitDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedHabitTime = `${String(habitDate.getHours()).padStart(2, '0')}:${String(
    habitDate.getMinutes()
  ).padStart(2, '0')}`;

  const activeCount = habits.filter((h) => h.is_active === 1).length;

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate && (event.type === 'set' || Platform.OS === 'ios')) {
      setHabitDate(selectedDate);
    }
  };

  const handleCreateHabit = async () => {
    if (!habitName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddHabit(habitName.trim(), habitFrequency, formattedHabitTime);
      setHabitName('');
      const d = new Date();
      d.setHours(8, 0, 0, 0);
      setHabitDate(d);
      setShowHabitModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (habitId: string, name: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteHabit(habitId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Header & Action */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Habits & Reminders</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {habits.length === 0
                ? 'No active reminders configured'
                : `${activeCount} active of ${habits.length} total`}
            </Text>
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowHabitModal(true)}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Reminder</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Habits List or Empty State */}
      {habits.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="alarm-outline" size={28} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No reminders set</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Create daily habits like water intake, pre-workout nutrition, or stretching.
          </Text>
          <Pressable
            style={[styles.emptyActionBtn, { backgroundColor: colors.primarySubtle }]}
            onPress={() => setShowHabitModal(true)}>
            <Text style={[styles.emptyActionText, { color: colors.primary }]}>+ Add Your First Reminder</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {habits.map((h, idx) => {
            const isActive = h.is_active === 1;

            return (
              <View
                key={h.id}
                style={[
                  styles.itemRow,
                  idx < habits.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}>
                <View style={styles.itemContent}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: colors.text },
                      !isActive && { opacity: 0.5 },
                    ]}>
                    {h.name}
                  </Text>
                  <View style={styles.metaRow}>
                    {h.reminder_time && (
                      <View style={[styles.timeBadge, { backgroundColor: colors.backgroundElement }]}>
                        <Ionicons name="alarm-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.text }]}>
                          {h.reminder_time}
                        </Text>
                      </View>
                    )}
                    {/* UI-only Frequency Tag */}
                    <View style={[styles.frequencyBadge, { backgroundColor: colors.primarySubtle }]}>
                      <Text style={[styles.frequencyText, { color: colors.primary }]}>
                        {h.frequency === 'weekdays' ? 'Weekdays' : h.frequency === 'weekly' ? 'Weekly' : 'Daily'}
                      </Text>
                    </View>
                    {/* Streak Badge */}
                    <View style={[styles.streakBadge, { backgroundColor: colors.primarySubtle }]}>
                      <Ionicons name="flame" size={12} color={colors.primary} />
                      <Text style={[styles.streakText, { color: colors.primary }]}>
                        {h.streak_count ?? 0}
                      </Text>
                    </View>
                  </View>
                </View>

                <Switch
                  value={isActive}
                  onValueChange={(val) => onToggleActive(h.id, val)}
                  trackColor={{ false: colors.border, true: colors.accent }}
                />

                <Pressable
                  onPress={() => confirmDelete(h.id, h.name)}
                  style={styles.deleteBtn}
                  hitSlop={8}>
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Modal: Add New Reminder */}
      <Modal
        visible={showHabitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHabitModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>New Reminder</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Reminder Name</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Drink 3L Water"
              placeholderTextColor={colors.textSecondary}
              value={habitName}
              onChangeText={setHabitName}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Reminder Time</Text>
            <Pressable
              style={[
                styles.timePickerButton,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              ]}
              onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.timePickerText, { color: colors.text }]}>
                {formattedHabitTime}
              </Text>
            </Pressable>

            {showTimePicker && (
              <DateTimePicker
                value={habitDate}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
                textColor={colors.text}
              />
            )}

            {/* UI-only Frequency Options */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Frequency</Text>
            <View style={styles.frequencySelector}>
              {(['daily', 'weekdays', 'weekly'] as const).map((freq) => (
                <Pressable
                  key={freq}
                  style={[
                    styles.freqOption,
                    { borderColor: colors.border },
                    habitFrequency === freq && {
                      backgroundColor: colors.primarySubtle,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setHabitFrequency(freq)}>
                  <Text
                    style={[
                      styles.freqOptionText,
                      { color: habitFrequency === freq ? colors.primary : colors.textSecondary },
                    ]}>
                    {freq === 'daily' ? 'Daily' : freq === 'weekdays' ? 'Weekdays' : 'Weekly'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancelBtn}
                onPress={() => setShowHabitModal(false)}
                disabled={isSubmitting}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dialogConfirmBtn,
                  { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
                ]}
                onPress={handleCreateHabit}
                disabled={isSubmitting || !habitName.trim()}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {isSubmitting ? 'Saving...' : 'Save Reminder'}
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
  header: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.three,
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
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
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
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  timePickerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  frequencySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.three,
  },
  freqOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqOptionText: {
    fontSize: 12,
    fontWeight: '600',
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
