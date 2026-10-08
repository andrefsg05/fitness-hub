import { Colors, Spacing } from '@/constants/theme';
import { useDatabase } from '@/context/DatabaseContext';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { BodyweightLog, User } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

interface ProgressTabProps {
  user: User | null;
  latestWeight: BodyweightLog | null;
  weightHistory: BodyweightLog[];
  onLogWeight: (weight: number) => Promise<void>;
  alertsRefreshKey: number;
}

export function ProgressTab({
  user,
  latestWeight,
  weightHistory,
  onLogWeight,
  alertsRefreshKey,
}: ProgressTabProps) {
  const router = useRouter();
  const { exerciseStagnationRepo, isReady } = useDatabase();
  const prProgressAlertsEnabled = useSettingsStore((state) => state.prProgressAlertsEnabled);
  const settingsLoaded = useSettingsStore((state) => state.isLoaded);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const [showLogModal, setShowLogModal] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  const loadActiveAlertsCount = useCallback(async () => {
    if (!exerciseStagnationRepo || !isReady || !settingsLoaded) return;

    if (!prProgressAlertsEnabled) {
      setActiveAlertsCount(0);
      return;
    }

    try {
      const alerts = await exerciseStagnationRepo.getActiveAlerts();
      setActiveAlertsCount(alerts.length);
    } catch (error) {
      console.error('Error loading active progress alerts:', error);
    }
  }, [exerciseStagnationRepo, isReady, prProgressAlertsEnabled, settingsLoaded]);

  useFocusEffect(
    useCallback(() => {
      loadActiveAlertsCount();
    }, [loadActiveAlertsCount])
  );

  useEffect(() => {
    if (alertsRefreshKey > 0) loadActiveAlertsCount();
  }, [alertsRefreshKey, loadActiveAlertsCount]);

  const handleSaveWeight = async () => {
    const parsed = parseFloat(weightInput);
    if (isNaN(parsed) || parsed <= 0) return;
    setIsSubmitting(true);
    try {
      await onLogWeight(parsed);
      setWeightInput('');
      setShowLogModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute weight progress to target
  const currentWeight = latestWeight?.weight;
  const targetWeight = user?.target_weight;
  let diffToTarget: number | null = null;
  if (currentWeight && targetWeight) {
    diffToTarget = Math.round((currentWeight - targetWeight) * 10) / 10;
  }

  return (
    <View style={styles.container}>
      {activeAlertsCount > 0 ? (
        <Pressable
          style={({ pressed }) => [
            styles.alertSummary,
            { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 },
          ]}
          onPress={() => router.push('/profile/progress-alerts')}
          accessibilityRole="button"
          accessibilityLabel={`View ${activeAlertsCount} active progress ${activeAlertsCount === 1 ? 'alert' : 'alerts'}`}
          accessibilityHint="Opens the list of active progress alerts">
          <View style={styles.alertSummaryContent}>
            <View style={[styles.alertIcon, { backgroundColor: colors.warningSubtle }]}>
              <Ionicons accessible={false} name="alert-circle-outline" size={23} color={colors.warning} />
            </View>
            <View style={styles.alertSummaryText}>
              <Text style={[styles.alertSummaryTitle, { color: colors.text }]}>
                {activeAlertsCount} {activeAlertsCount === 1 ? 'Progress Alert' : 'Progress Alerts'}
              </Text>
              <Text style={[styles.alertSummarySubtitle, { color: colors.textSecondary }]}>Tap to view all</Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {/* 1. Bodyweight Card (Compact) */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Bodyweight</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {latestWeight ? `Last logged: ${latestWeight.date}` : 'No records yet'}
            </Text>
          </View>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowLogModal(true)}
            hitSlop={6}>
            <Ionicons name="add" size={15} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Log</Text>
          </Pressable>
        </View>

        <View style={styles.weightDisplayRow}>
          <View>
            <Text style={[styles.bigWeight, { color: colors.text }]}>
              {currentWeight ? currentWeight : '--'}
              <Text style={[styles.weightUnit, { color: colors.textSecondary }]}> kg</Text>
            </Text>
            <Text style={[styles.weightCaption, { color: colors.textSecondary }]}>Current Weight</Text>
          </View>

          {targetWeight && (
            <View style={styles.targetCol}>
              <View style={[styles.targetBadge, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>Target</Text>
                <Text style={[styles.targetValue, { color: colors.text }]}>{targetWeight} kg</Text>
              </View>
              {diffToTarget !== null && (
                <Text style={[styles.diffText, { color: colors.textSecondary }]}>
                  {Math.abs(diffToTarget) === 0
                    ? 'Target reached! 🎯'
                    : `${Math.abs(diffToTarget)} kg to target`}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* View history & analytics footer */}
        <Pressable
          style={[styles.historyFooter, { borderTopColor: colors.border }]}
          onPress={() => router.push('/profile/bodyweight' as any)}>
          <Text style={[styles.historyFooterText, { color: colors.primary }]}>
            View Full History & Charts
          </Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </Pressable>
      </View>

      {/* 2. Personal Records (PRs) Quick Access */}
      <Pressable
        style={[styles.card, styles.prCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push('/statistics/prs')}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
          <Ionicons name="trophy-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.prInfo}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Records (PRs)</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            View all recorded personal bests & 1RM
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>

      {/* 3. Performance Analytics Placeholder */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.placeholderRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="bar-chart-outline" size={22} color={colors.textSecondary} />
          </View>
          <View style={styles.placeholderInfo}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Performance Analytics</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              Detailed volume, frequency, and strength progress charts coming soon.
            </Text>
          </View>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Coming Soon</Text>
        </View>
      </View>

      {/* Modal: Log Weight */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Log Today's Bodyweight</Text>
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
            <View style={styles.dialogActions}>
              <Pressable
                style={styles.dialogCancelBtn}
                onPress={() => setShowLogModal(false)}
                disabled={isSubmitting}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  alertSummary: {
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: Spacing.three,
  },
  alertSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  alertSummaryText: {
    flexShrink: 1,
  },
  alertSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  alertSummarySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  weightDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  bigWeight: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  weightUnit: {
    fontSize: 18,
    fontWeight: '500',
  },
  weightCaption: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  targetCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  targetBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  targetValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  diffText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    marginTop: Spacing.two,
  },
  historyFooterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  prInfo: {
    flex: 1,
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  placeholderInfo: {
    flex: 1,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
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
