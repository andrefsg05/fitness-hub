import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useActiveWorkoutStore } from '@/stores/useActiveWorkoutStore';
import { Colors, Spacing } from '@/constants/theme';

export function WorkoutActionBanner() {
  const activeWorkout = useActiveWorkoutStore((state) => state.activeWorkout);
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const animatePress = (pressed: boolean) => {
    scale.value = withTiming(reduceMotion ? 1 : pressed ? 0.98 : 1, {
      duration: pressed ? 100 : 160,
    });
  };

  const handlePress = () => {
    // Haptics are optional feedback and must never delay opening the workout.
    if (Platform.OS !== 'web') {
      const feedback = Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      void feedback.catch(() => {});
    }
    router.push('/workout/active');
  };

  const title = activeWorkout ? 'Workout in Progress' : 'Start New Workout';
  const details = activeWorkout
    ? `${activeWorkout.workout_type_name} • ${activeWorkout.exercises.length} Exercises • ${activeWorkout.total_sets} Sets`
    : undefined;

  return (
    <Animated.View style={[styles.container, { shadowColor: colors.workoutActionEnd }, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={activeWorkout ? `Resume workout. ${details}` : title}
        onPress={handlePress}
        onPressIn={() => animatePress(true)}
        onPressOut={() => animatePress(false)}>
        {({ pressed }) => (
          <LinearGradient
            colors={[colors.workoutActionStart, colors.workoutActionEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.surface}>
            <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
              <View style={[styles.diagonal, styles.diagonalFirst, { backgroundColor: colors.workoutActionDetail }]} />
              <View style={[styles.diagonal, styles.diagonalSecond, { backgroundColor: colors.workoutActionDetail }]} />
              {pressed && <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.workoutActionEnd, opacity: 0.2 }]} />}
            </View>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.iconTile, { backgroundColor: colors.workoutActionOverlay }]}>
              <Ionicons name="barbell-outline" size={25} color={colors.onWorkoutAction} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.onWorkoutAction }]}>{title}</Text>
              {details && <Text style={[styles.subtitle, { color: colors.workoutActionMuted }]}>{details}</Text>}
            </View>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.action, { backgroundColor: colors.workoutActionOverlay }]}>
              {activeWorkout ? (
                <>
                  <Text style={[styles.resumeText, { color: colors.onWorkoutAction }]}>Resume</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.onWorkoutAction} />
                </>
              ) : (
                <Ionicons name="play" size={19} color={colors.onWorkoutAction} style={styles.playIcon} />
              )}
            </View>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.two,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  surface: {
    minHeight: 84,
    borderRadius: 16,
    overflow: 'hidden',
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + Spacing.one,
  },
  diagonal: {
    position: 'absolute',
    top: -60,
    bottom: -60,
    width: 22,
    transform: [{ rotate: '25deg' }],
  },
  diagonalFirst: { right: 65 },
  diagonalSecond: { right: 103 },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800' },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: Spacing.one },
  action: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  playIcon: { marginLeft: 2 },
  resumeText: { fontSize: 12, fontWeight: '700' },
});
