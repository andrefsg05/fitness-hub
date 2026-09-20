import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import HomeScreen from '@/app/(tabs)/index';
import WorkoutsScreen from '@/app/(tabs)/workouts';
import ProfileScreen from '@/app/(tabs)/profile';
import { CustomBottomTabBar } from './CustomBottomTabBar';

export default function AppTabs() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    setActiveIndex(e.nativeEvent.position);
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
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
        activeIndex={activeIndex}
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
