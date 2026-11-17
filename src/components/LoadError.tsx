import { Text, TouchableOpacity, View } from 'react-native';
import { FEEDBACK_STYLES as styles } from '../theme/styles';

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.box}>
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.message}>{message}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.retry}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
