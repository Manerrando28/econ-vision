import { Leaf, MapPin } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

export function AppHeader() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.header}>
      <View style={styles.content}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Leaf size={23} color={COLORS.primary} strokeWidth={1.8} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.name}>Eco Vision</Text>
            <Text style={styles.tagline}>Uma cidade mais segura</Text>
          </View>
        </View>
        <View style={styles.location} accessibilityLabel="Localização: São Paulo">
          <MapPin size={13} color={COLORS.primary} />
          <Text style={styles.locationText}>São Paulo</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  content: {
    width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  logo: {
    width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.primaryDark,
    borderWidth: 1, borderColor: '#245247', alignItems: 'center', justifyContent: 'center',
  },
  brandCopy: { gap: 2, flexShrink: 1 },
  name: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 19, letterSpacing: -0.5 },
  tagline: { color: COLORS.textMuted, fontSize: 10 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '500' },
});
