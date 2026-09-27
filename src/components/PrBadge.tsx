import { StyleSheet, Text, View, useColorScheme } from 'react-native';

export function PrBadge() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.badge, isDark ? styles.badgeDark : styles.badgeLight]}>
      <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
        PR
      </Text>
    </View>
  );
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
