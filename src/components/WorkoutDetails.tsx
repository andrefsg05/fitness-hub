import { WorkoutSummaryContent } from '@/components/WorkoutSummaryContent';
import { Colors, Spacing } from '@/constants/theme';
import { useActiveWorkoutStore } from '@/stores/useActiveWorkoutStore';
import { WorkoutWithDetails } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View, useColorScheme } from 'react-native';

interface WorkoutDetailsProps {
  workout: WorkoutWithDetails;
  onClose?: () => void;
  showCloseButton?: boolean;
  showCopyButton?: boolean;
  onCopy?: () => void;
}

export function WorkoutDetails({
  workout,
  onClose,
  showCloseButton = true,
  showCopyButton = true,
  onCopy,
}: WorkoutDetailsProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const handleDefaultCopy = () => {
    if (workout.exercises.length === 0) {
      Alert.alert('Notice', 'This workout has no exercises to copy.');
      return;
    }

    const activeWorkout = useActiveWorkoutStore.getState().activeWorkout;
    const copyWorkout = useActiveWorkoutStore.getState().copyWorkout;

    if (activeWorkout) {
      Alert.alert(
        'Copy to Active Workout',
        `You already have a workout in progress (${activeWorkout.workout_type_name}). Do you want to import the missing exercises from this workout?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Copy',
            style: 'default',
            onPress: async () => {
              try {
                const result = await copyWorkout(workout);
                if (result.count === 0) {
                  Alert.alert(
                    'Exercises Already Present',
                    'All exercises from this workout are already in your active workout.',
                    [
                      { text: 'Stay Here', style: 'cancel' },
                      {
                        text: 'Go to Workout',
                        onPress: () => router.push('/workout/active'),
                      },
                    ]
                  );
                } else {
                  router.push('/workout/active');
                }
              } catch {
                Alert.alert('Error', 'Failed to copy exercises.');
              }
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Start New Workout',
      `Do you want to start a new ${workout.workout_type_name} workout with the exercises and sets from this workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          style: 'default',
          onPress: async () => {
            try {
              await copyWorkout(workout);
              router.push('/workout/active');
            } catch {
              Alert.alert('Error', 'Failed to create new workout.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showCloseButton || showCopyButton ? (
        <View style={styles.modalHeaderSpace}>
          {showCloseButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close workout details">
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          ) : null}

          <View style={[styles.dragHandle, { backgroundColor: colors.textSecondary }]} />

          {showCopyButton ? (
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                { backgroundColor: colors.backgroundElement, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onCopy ?? handleDefaultCopy}
              accessibilityRole="button"
              accessibilityLabel="Copy workout">
              <Ionicons name="copy-outline" size={19} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <WorkoutSummaryContent workout={workout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeaderSpace: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 100,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  closeButton: {
    position: 'absolute',
    top: 6,
    left: Spacing.three,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  copyButton: {
    position: 'absolute',
    top: 6,
    right: Spacing.three,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
