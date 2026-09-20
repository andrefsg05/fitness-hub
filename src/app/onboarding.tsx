import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/useUserStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const insets = useSafeAreaInsets();

  const { completeOnboarding, isLoading } = useUserStore();

  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const normalizedWeight = weight.replace(',', '.').trim();
    const parsedWeight = parseFloat(normalizedWeight);

    if (isNaN(parsedWeight) || parsedWeight <= 20 || parsedWeight >= 350) {
      setErrorMsg('Please enter a valid weight (e.g. 75.5).');
      return;
    }

    try {
      await completeOnboarding(trimmedName, parsedWeight);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Spacing.four, paddingBottom: insets.bottom + Spacing.four },
          ]}
          keyboardShouldPersistTaps="handled">
          
          {/* Logo & Header */}
          <View style={styles.header}>
            <Text style={[styles.logoText, { color: colors.text }]}>
              fitness<Text style={{ color: colors.primary }}>hub</Text>
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.primarySubtle }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>WELCOME</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Set Up Your Profile
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Just two quick steps to personalize your fitness journey.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Input 1: Nome */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>YOUR NAME</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="e.g. Alex"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Input 2: Peso Atual */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENT WEIGHT (KG)</Text>
              <View style={styles.weightInputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.weightInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="e.g. 75.5"
                  placeholderTextColor={colors.textSecondary}
                  value={weight}
                  onChangeText={(val) => {
                    setWeight(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                <View style={[styles.unitBadge, { backgroundColor: colors.border }]}>
                  <Text style={[styles.unitText, { color: colors.textSecondary }]}>kg</Text>
                </View>
              </View>
            </View>

            {/* Error Message */}
            {errorMsg ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.dangerSubtle }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
              disabled={isLoading}
              onPress={handleSubmit}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Get Started</Text>
              )}
            </Pressable>
          </View>

          {/* Hint */}
          <Text style={[styles.footerHint, { color: colors.textSecondary }]}>
            You can update this information and set goals and habits later in your profile.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logoText: {
    fontFamily: 'Aldrich_400Regular',
    fontSize: 28,
    letterSpacing: 1.5,
    marginBottom: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    marginBottom: Spacing.two,
  },
  badgeText: {
    fontFamily: 'Aldrich_400Regular',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  label: {
    fontFamily: 'Aldrich_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '600',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
  },
  weightInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  weightInput: {
    paddingRight: 50,
  },
  unitBadge: {
    position: 'absolute',
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    padding: Spacing.two,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.two,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: 'Aldrich_400Regular',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.four,
    lineHeight: 18,
    paddingHorizontal: Spacing.three,
  },
});
