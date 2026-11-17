import { Leaf, MapPin } from 'lucide-react-native';
import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { HEADER_STYLES as styles } from '../theme/styles';

export function AppHeader() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.header}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.brand} accessibilityRole="button" accessibilityLabel="Sobre o Eco Vision e fontes dos dados" onPress={() => router.push('/modal')}>
          <View style={styles.logo}>
            <Leaf size={23} color={COLORS.primary} strokeWidth={1.8} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.name}>Eco Vision</Text>
            <Text style={styles.tagline}>Uma cidade mais segura</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.location} accessibilityLabel="Localização: São Paulo">
          <MapPin size={13} color={COLORS.primary} />
          <Text style={styles.locationText}>São Paulo</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
