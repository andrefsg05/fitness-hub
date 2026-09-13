import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    primary: '#2563EB',
    primaryHover: '#1D4ED8',
    primarySubtle: '#DBEAFE',
    accent: '#10B981',
    accentSubtle: '#D1FAE5',
    danger: '#EF4444',
    dangerSubtle: '#FEE2E2',
    card: '#FFFFFF',
    border: '#E2E8F0',
    tint: '#2563EB',
  },
  dark: {
    text: '#F8FAFC',
    background: '#090A0F',
    backgroundElement: '#141721',
    backgroundSelected: '#1E2333',
    textSecondary: '#94A3B8',
    primary: '#3B82F6',
    primaryHover: '#60A5FA',
    primarySubtle: 'rgba(59, 130, 246, 0.15)',
    accent: '#10B981',
    accentSubtle: 'rgba(16, 185, 129, 0.15)',
    danger: '#F87171',
    dangerSubtle: 'rgba(239, 68, 68, 0.15)',
    card: '#11141E',
    border: '#1E2333',
    tint: '#3B82F6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
