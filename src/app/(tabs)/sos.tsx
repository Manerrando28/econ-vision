import { useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { Car, Footprints, Phone, ShieldAlert, ZapOff } from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '@/src/components/Screen';
import { COLORS } from '@/src/theme/colors';
import { SOS_STYLES as styles } from '@/src/theme/styles';

const CONTACTS = [
  { number: '199', title: 'Defesa Civil', description: 'Alagamentos, deslizamentos e áreas de risco' },
  { number: '193', title: 'Bombeiros', description: 'Resgates em enchentes e pessoas ilhadas' },
  { number: '192', title: 'SAMU', description: 'Emergências médicas e primeiros socorros' },
];
const SAFETY_TIPS = [
  { icon: Footprints, title: 'Não atravesse a pé', text: 'A água pode esconder bueiros abertos e correntezas. Procure um local alto e aguarde em segurança.' },
  { icon: Car, title: 'Evite dirigir em alagamentos', text: 'Não entre em trechos alagados. Pare em um local seguro e siga as orientações das autoridades.' },
  { icon: ZapOff, title: 'Mantenha distância da rede elétrica', text: 'Não toque em fios caídos ou equipamentos molhados. Só desligue a energia se puder fazer isso sem contato com a água.' },
];

export default function SosScreen() {
  const [callError, setCallError] = useState<string | null>(null);

  const handleCall = async (number: string, title: string) => {
    setCallError(null);
    try {
      await Linking.openURL(`tel:${number}`);
    } catch {
      setCallError(`Não foi possível abrir o telefone. Disque ${number} para falar com ${title}.`);
    }
  };

  return (
    <Screen>
      <PageIntro
        eyebrow="APOIO E EMERGÊNCIA"
        title="Precisa de ajuda?"
        description="Toque para ligar. Atendimento gratuito."
      />
      <View style={styles.emergencyBanner}>
        <ShieldAlert size={20} color={COLORS.criticoText} />
        <Text style={styles.bannerTitle}>Em risco? Procure um local seguro.</Text>
      </View>
      {callError && <Text accessibilityRole="alert" style={styles.callError}>{callError}</Text>}
      <View style={styles.contacts}>
        {CONTACTS.map(({ number, title, description }) => (
          <TouchableOpacity
            key={number}
            style={styles.contact}
            onPress={() => void handleCall(number, title)}
            accessibilityRole="button"
            accessibilityLabel={`Ligar para ${title}, número ${number}`}
            activeOpacity={0.75}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.number}>{number}</Text>
            </View>
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>{title}</Text>
              <Text style={styles.contactDescription}>{description}</Text>
            </View>
            <Phone size={18} color={COLORS.criticoText} />
          </TouchableOpacity>
        ))}
      </View>
      <SectionHeading title="Sua segurança vem primeiro" subtitle="Cuidados importantes durante as chuvas" />
      <View style={styles.tips}>
        {SAFETY_TIPS.map(({ icon: Icon, title, text }, index) => (
          <View key={title} style={[styles.tip, index > 0 && styles.tipBorder]}>
            <View style={styles.tipIcon}><Icon size={20} color={COLORS.primary} /></View>
            <View style={styles.tipCopy}>
              <Text style={styles.tipTitle}>{title}</Text>
              <Text style={styles.tipText}>{text}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>O Eco Vision é um apoio informativo. Siga as orientações dos serviços oficiais de emergência.</Text>
    </Screen>
  );
}
