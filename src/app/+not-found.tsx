import { Link, Stack } from 'expo-router';
import { Text } from 'react-native';
import { PageIntro, Screen } from '../components/Screen';
import { INFO_STYLES as styles } from '../theme/styles';

export default function NotFoundScreen() {
  return (
    <Screen>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <PageIntro eyebrow="ECO VISION" title="Página não encontrada" description="Este endereço não existe. Volte ao radar para continuar." />
      <Link href="/" style={styles.action} accessibilityRole="link"><Text style={styles.actionText}>Voltar ao radar</Text></Link>
    </Screen>
  );
}
