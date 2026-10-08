import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { GoalsTab } from '@/components/profile/GoalsTab';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabBar, ProfileTabKey } from '@/components/profile/ProfileTabBar';
import { ProgressTab } from '@/components/profile/ProgressTab';
import { RemindersTab } from '@/components/profile/RemindersTab';
import { SettingsTab } from '@/components/profile/SettingsTab';
import { Colors, Spacing } from '@/constants/theme';
import { useHabitsStore } from '@/stores/useHabitsStore';
import { useUserStore } from '@/stores/useUserStore';
import { useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';

const TAB_ORDER: ProfileTabKey[] = ['progress', 'goals', 'reminders', 'settings'];

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const {
    user,
    latestWeight,
    weightHistory,
    goals,
    monthlyStats,
    logWeight,
    addGoal,
    toggleGoal,
    deleteGoal,
    updateProfile,
    fetchProfile,
  } = useUserStore();

  const { habits, addHabit, toggleActive, deleteHabit, fetchHabits } = useHabitsStore();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>('progress');
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');
  const activeTabRef = useRef<ProfileTabKey>('progress');

  const [refreshing, setRefreshing] = useState(false);
  const [alertsRefreshKey, setAlertsRefreshKey] = useState(0);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchHabits();
  }, [fetchProfile, fetchHabits]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchHabits()]);
    setAlertsRefreshKey((current) => current + 1);
    setRefreshing(false);
  };

  const handleSelectTab = (newTab: ProfileTabKey) => {
    if (newTab === activeTab) return;
    const currentIndex = TAB_ORDER.indexOf(activeTabRef.current);
    const nextIndex = TAB_ORDER.indexOf(newTab);
    const direction = nextIndex >= currentIndex ? 'forward' : 'backward';

    setSlideDirection(direction);
    activeTabRef.current = newTab;
    setActiveTab(newTab);
  };

  const enteringAnimation =
    slideDirection === 'forward'
      ? SlideInRight.duration(240)
      : SlideInLeft.duration(240);

  const exitingAnimation =
    slideDirection === 'forward'
      ? SlideOutLeft.duration(180)
      : SlideOutRight.duration(180);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

      {/* 1. User Header Presentation */}
      <ProfileHeader
        user={user}
        monthlyStats={monthlyStats}
        onEditPress={() => setShowEditProfileModal(true)}
      />

      {/* 2. Horizontal Tab Menu */}
      <ProfileTabBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* 3. Animated Tab Content with Slide Transition */}
      <Animated.View
        key={activeTab}
        entering={enteringAnimation}
        exiting={exitingAnimation}
        style={styles.tabContentContainer}>
        {activeTab === 'progress' && (
          <ProgressTab
            user={user}
            latestWeight={latestWeight}
            weightHistory={weightHistory}
            onLogWeight={logWeight}
            alertsRefreshKey={alertsRefreshKey}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTab
            goals={goals}
            onAddGoal={addGoal}
            onToggleGoal={toggleGoal}
            onDeleteGoal={deleteGoal}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            habits={habits}
            onAddHabit={addHabit}
            onToggleActive={toggleActive}
            onDeleteHabit={deleteHabit}
          />
        )}

        {activeTab === 'settings' && <SettingsTab />}
      </Animated.View>

      {/* 4. Edit Profile Modal */}
      <EditProfileModal
        visible={showEditProfileModal}
        user={user}
        onClose={() => setShowEditProfileModal(false)}
        onSave={updateProfile}
      />

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
  tabContentContainer: {
    width: '100%',
  },
});
