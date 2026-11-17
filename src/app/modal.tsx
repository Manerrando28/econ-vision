import { Link, router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { PageIntro, Screen } from '../components/Screen';
import { INFO_STYLES as styles } from '../theme/styles';

export default function AboutScreen() {
  return (
    <Screen>
      <PageIntro eyebrow="TRANSPARÊNCIA E PRIVACIDADE" title="Sobre o Eco Vision" description="Conheça as fontes e saiba como seus registros são salvos." />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>De onde vêm os dados?</Text>
        <Text style={styles.body}>Clima: API pública Open-Meteo, usando coordenadas fixas de São Paulo. Não consultamos a localização do celular.</Text>
        <Link href="https://open-meteo.com/" style={styles.action} accessibilityRole="link"><Text style={styles.actionText}>Conhecer a Open-Meteo</Text></Link>
        <Text style={styles.body}>Os sensores exibem dados simulados, não leituras atuais das ruas. As orientações de rota não garantem vias livres.</Text>
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>Seus registros são locais</Text>
        <Text style={styles.body}>As ocorrências ficam salvas apenas neste dispositivo, sem cadastro e sem compartilhamento com outras pessoas.</Text>
      </View>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>Sua segurança vem primeiro</Text>
        <Text style={styles.body}>O Eco Vision não substitui os alertas oficiais. Em risco imediato, procure um local seguro e use os contatos da tela SOS.</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" style={styles.action} onPress={() => router.canGoBack() ? router.back() : router.replace('/')}>
        <Text style={styles.actionText}>Voltar ao aplicativo</Text>
      </TouchableOpacity>
    </Screen>
  );
}
