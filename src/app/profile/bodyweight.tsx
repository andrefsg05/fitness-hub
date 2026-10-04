import { Colors, Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BodyweightHistoryScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const {
    user,
    latestWeight,
    weightHistory,
    logWeight,
    deleteWeightLog,
  } = useUserStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveWeight = async () => {
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed <= 0) return;
    setIsSubmitting(true);
    try {
      await logWeight(parsed, dateInput.trim() || undefined);
      setWeightInput('');
      setShowLogModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string, weight: number, date: string) => {
    Alert.alert(
      'Delete Weight Entry',
      `Delete entry of ${weight} kg on ${date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWeightLog(id),
        },
      ]
    );
  };

  const currentWeight = latestWeight?.weight;
  const targetWeight = user?.target_weight;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Top Header */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Bodyweight History</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            setDateInput(new Date().toISOString().split('T')[0]);
            setShowLogModal(true);
          }}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Log</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Current</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {currentWeight ? `${currentWeight} kg` : '--'}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Target</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {targetWeight ? `${targetWeight} kg` : '--'}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Logs</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {weightHistory.length}
            </Text>
          </View>
        </View>

        {/* History List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeading, { color: colors.textSecondary }]}>All Entries</Text>
        </View>

        {/* List of Entries */}
        {weightHistory.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.backgroundElement }]}>
              <Ionicons name="scale-outline" size={28} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No entries recorded yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Log your bodyweight regularly to keep track of your long-term fitness trend.
            </Text>
            <Pressable
              style={[styles.emptyActionBtn, { backgroundColor: colors.primarySubtle }]}
              onPress={() => setShowLogModal(true)}>
              <Text style={[styles.emptyActionText, { color: colors.primary }]}>+ Log First Entry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {weightHistory.map((log, idx) => {
              const prevLog = weightHistory[idx + 1];
              const diff = prevLog ? Math.round((log.weight - prevLog.weight) * 10) / 10 : null;

              return (
                <View
                  key={log.id}
                  style={[
                    styles.entryRow,
                    idx < weightHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}>
                  <View style={styles.entryLeft}>
                    <Text style={[styles.entryDate, { color: colors.text }]}>{log.date}</Text>
                    {idx === 0 && (
                      <View style={[styles.latestBadge, { backgroundColor: colors.primarySubtle }]}>
                        <Text style={[styles.latestBadgeText, { color: colors.primary }]}>Latest</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.entryCenter}>
                    <Text style={[styles.entryWeight, { color: colors.text }]}>
                      {log.weight} <Text style={[styles.entryUnit, { color: colors.textSecondary }]}>kg</Text>
                    </Text>
                    {diff !== null && (
                      <Text style={[styles.entryDiff, { color: colors.textSecondary }]}>
                        {diff > 0 ? `+${diff}` : `${diff}`} kg
                      </Text>
                    )}
                  </View>

                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(log.id, log.weight, log.date)}
                    hitSlop={8}>
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal: Log Weight */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Log Bodyweight</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. 81.5"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={weightInput}
              onChangeText={setWeightInput}
              autoFocus
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={dateInput}
              onChangeText={setDateInput}
            />

            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancelBtn}
                onPress={() => setShowLogModal(false)}
                disabled={isSubmitting}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dialogConfirmBtn,
                  { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
                ]}
                onPress={handleSaveWeight}
                disabled={isSubmitting || !weightInput.trim()}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
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
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 28,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  listHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  entryLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  latestBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  entryCenter: {
    alignItems: 'flex-end',
    marginRight: Spacing.two,
  },
  entryWeight: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  entryDiff: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.two,
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
