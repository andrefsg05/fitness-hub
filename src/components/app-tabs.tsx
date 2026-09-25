import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import HomeScreen from '@/app/(tabs)/index';
import WorkoutsScreen from '@/app/(tabs)/workouts';
import ProfileScreen from '@/app/(tabs)/profile';
import { CustomBottomTabBar } from './CustomBottomTabBar';
import { useTabNavigationStore, TabIndex } from '@/stores/useTabNavigationStore';

export default function AppTabs() {
  const pagerRef = useRef<PagerView>(null);
  const currentPosition = useRef(0);
  const { activeTab, setActiveTab } = useTabNavigationStore();

  useEffect(() => {
    if (currentPosition.current !== activeTab) {
      currentPosition.current = activeTab;
      pagerRef.current?.setPage(activeTab);
    }
  }, [activeTab]);

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const newPos = e.nativeEvent.position as TabIndex;
    currentPosition.current = newPos;
    setActiveTab(newPos);
  };

  const handleTabPress = (index: number) => {
    setActiveTab(index as TabIndex);
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}>
        <View key="home" style={styles.page}>
          <HomeScreen />
        </View>
        <View key="workouts" style={styles.page}>
          <WorkoutsScreen />
        </View>
        <View key="profile" style={styles.page}>
          <ProfileScreen />
        </View>
      </PagerView>
      <CustomBottomTabBar
        activeIndex={activeTab}
        onTabPress={handleTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
