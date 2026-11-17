import { useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Car, Footprints, Phone, ShieldAlert, ZapOff } from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '../../src/components/Screen';
import { COLORS } from '../../src/theme/colors';

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

const styles = StyleSheet.create({
  emergencyBanner: { backgroundColor: COLORS.criticoBg, borderWidth: 1, borderColor: '#60333D', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  bannerTitle: { color: COLORS.criticoText, fontSize: 12, fontWeight: '500', lineHeight: 19, flex: 1 },
  callError: { color: COLORS.criticoText, fontSize: 13, lineHeight: 20 },
  contacts: { gap: 12 },
  contact: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, padding: 16, gap: 12, flexDirection: 'row', alignItems: 'center' },
  contactTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  contactCopy: { flex: 1, gap: 5 },
  numberBadge: { width: 64, minHeight: 64, borderRadius: 14, backgroundColor: COLORS.criticoBg, alignItems: 'center', justifyContent: 'center' },
  number: { color: COLORS.criticoText, fontSize: 28, fontWeight: '600', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  contactDescription: { color: COLORS.textMuted, fontSize: 11, lineHeight: 18 },
  tips: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 18 },
  tip: { flexDirection: 'row', gap: 12, paddingVertical: 20 },
  tipBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  tipIcon: { backgroundColor: COLORS.primaryDark, borderRadius: 12, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1, gap: 7 },
  tipTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 21 },
  tipText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 21 },
  footer: { color: COLORS.textMuted, fontSize: 11, lineHeight: 18, textAlign: 'center' },
});
