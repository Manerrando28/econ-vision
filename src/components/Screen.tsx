import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
} from 'react-native';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { COLORS } from '../theme/colors';

type ScreenProps = Pick<ScrollViewProps, 'refreshControl'> & {
  children: ReactNode;
  keyboardAware?: boolean;
};

export function Screen({ children, refreshControl, keyboardAware = false }: ScreenProps) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled={keyboardAware}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios' && !keyboardAware}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.intro}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        {action}
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionCopy}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  intro: { gap: 8 },
  eyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '700', letterSpacing: -0.8, flex: 1 },
  description: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionCopy: { flex: 1, gap: 4 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  sectionSubtitle: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
});
