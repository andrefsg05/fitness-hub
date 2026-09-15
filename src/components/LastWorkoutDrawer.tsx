import React, { useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WorkoutWithDetails } from '@/types';
import { Colors, Spacing } from '@/constants/theme';
import { WorkoutDetails } from './WorkoutDetails';

interface LastWorkoutDrawerProps {
  workout: WorkoutWithDetails;
}

export function LastWorkoutDrawer({ workout }: LastWorkoutDrawerProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const { height: screenHeight } = Dimensions.get('window');
  const drawerHeight = useMemo(() => Math.min(screenHeight * 0.88, 720), [screenHeight]);

  const slideAnim = useRef(new Animated.Value(-drawerHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Open drawer animation
  const openDrawer = () => {
    setVisible(true);
    slideAnim.setValue(-drawerHeight);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 14,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close drawer animation
  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  return (
    <>
      {/* Trigger Bar above header */}
      <View style={styles.triggerContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.triggerPill,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={openDrawer}
          accessibilityRole="button"
          accessibilityLabel={`Tap to see last ${workout.workout_type_name} workout`}
        >
          <Text style={[styles.triggerText, { color: colors.textSecondary }]}>
            Tap to see last{' '}
            <Text style={[styles.highlightText, { color: colors.primary }]}>
              {workout.workout_type_name}
            </Text>{' '}
            workout <Text style={[styles.chevron, { color: colors.primary }]}>▼</Text>
          </Text>
        </Pressable>
      </View>

      {/* Slide-Down Modal Overlay */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          {/* Animated Dim Backdrop */}
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.55],
                }),
              },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </Animated.View>

          {/* Animated Top Pull-Down Sheet */}
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                height: drawerHeight,
                backgroundColor: colors.background,
                borderColor: colors.border,
                paddingTop: Math.max(insets.top, Spacing.three),
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Previous Workout Content */}
            <View style={styles.contentContainer}>
              <WorkoutDetails
                workout={workout}
                onClose={closeDrawer}
                showCloseButton={true}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  triggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  highlightText: {
    fontWeight: '700',
  },
  chevron: {
    fontSize: 10,
    marginLeft: 2,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  sheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
  },
});
