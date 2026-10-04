import { Colors, Spacing } from '@/constants/theme';
import { MonthlyStats } from '@/stores/useUserStore';
import { User } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

interface ProfileHeaderProps {
  user: User | null;
  monthlyStats: MonthlyStats;
  onEditPress: () => void;
}

export function ProfileHeader({ user, monthlyStats, onEditPress }: ProfileHeaderProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const initial = (user?.name?.[0] ?? 'A').toUpperCase();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {user?.name ?? 'Athlete'}
          </Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>
            Fitness Profile
          </Text>
        </View>

        <Pressable
          style={[styles.editButton, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
          onPress={onEditPress}
          hitSlop={8}
          accessibilityLabel="Edit Profile">
          <Ionicons name="pencil-outline" size={17} color={colors.text} />
        </Pressable>
      </View>

      {/* Monthly summary pill / stats */}
      <View style={[styles.monthlyContainer, { borderTopColor: colors.border }]}>
        <View style={styles.monthlyHeader}>
          <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
          <Text style={[styles.monthlyBadgeText, { color: colors.textSecondary }]}>
            THIS MONTH{monthlyStats.monthName ? ` • ${monthlyStats.monthName.toUpperCase()}` : ''}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Ionicons name="barbell-outline" size={16} color={colors.primary} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {monthlyStats.workoutsCount}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {monthlyStats.workoutsCount === 1 ? 'Workout Done' : 'Workouts Done'}
            </Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <Ionicons name="trophy-outline" size={16} color={colors.primary} style={styles.statIcon} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {monthlyStats.prsCount}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {monthlyStats.prsCount === 1 ? 'PR Beaten' : 'PRs Beaten'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  infoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  userRole: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlyContainer: {
    borderTopWidth: 1,
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
  },
  monthlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginBottom: Spacing.two,
  },
  monthlyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statIcon: {
    marginTop: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
  },
});
