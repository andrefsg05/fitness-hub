import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

interface PrBadgeProps {
  exerciseId?: string;
  onPress?: () => void;
}

export function PrBadge({ exerciseId, onPress }: PrBadgeProps = {}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (exerciseId) {
      router.push({
        pathname: '/statistics/prs',
        params: { exerciseId },
      });
    }
  };

  const isInteractive = Boolean(onPress || exerciseId);

  const badgeContent = (
    <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
        PR
      </Text>
    </View>
  );

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
      >
        {badgeContent}
      </Pressable>
    );
  }

  return badgeContent;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDark: {
    backgroundColor: '#ec8a0050',
  },
  badgeLight: {
    backgroundColor: '#FFEDD5',
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  textDark: {
    color: '#ffe100ff',
  },
  textLight: {
    color: '#C2410C',
  },
});

