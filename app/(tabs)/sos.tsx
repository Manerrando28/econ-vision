import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { PhoneCall, ShieldAlert, ZapOff, Car, Footprints } from 'lucide-react-native';
import { COLORS } from '../../src/theme/colors';

export default function SosScreen() {
  const handleCall = (number: string, serviceName: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert(
        'Ligação de Emergência',
        `Disque ${number} para falar com ${serviceName}.`
      );
    });
  };

  const emergencyContacts = [
    {
      number: '199',
      title: 'Defesa Civil',
      desc: 'Alagamentos, deslizamentos e vistorias de risco',
    },
    {
      number: '193',
      title: 'Corpo de Bombeiros',
      desc: 'Resgates em enchentes e pessoas ilhadas',
    },
    {
      number: '192',
      title: 'SAMU',
      desc: 'Emergências médicas e primeiros socorros',
    },
  ];

  const safetyTips = [
    {
      icon: <Footprints size={22} color={COLORS.primary} />,
      title: 'Nunca atravesse áreas alagadas a pé',
      text: '15 cm de água em movimento já podem derrubar um adulto. Bueiros abertos ficam invisíveis sob a água.',
    },
    {
      icon: <Car size={22} color={COLORS.primary} />,
      title: 'Não enfrente correntezas de carro',
      text: 'Se a água atingir a metade da roda, abandone o veículo e procure um local alto e seguro.',
    },
    {
      icon: <ZapOff size={22} color={COLORS.primary} />,
      title: 'Desligue a chave geral se a água entrar',
      text: 'Evite choques elétricos desligando o quadro de energia da residência e mantendo distância de postes.',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <ShieldAlert size={28} color="#FCA5A5" />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Acionamento Rápido</Text>
          <Text style={styles.headerSubtitle}>
            Toque em um dos botões abaixo para ligar diretamente para o atendimento oficial.
          </Text>
        </View>
      </View>

      {emergencyContacts.map((contact) => (
        <TouchableOpacity
          key={contact.number}
          style={styles.callCard}
          onPress={() => handleCall(contact.number, contact.title)}
          accessibilityRole="button"
          accessibilityLabel={`Ligar para ${contact.title}, número ${contact.number}`}
        >
          <View style={styles.numberBadge}>
            <PhoneCall size={20} color="#FFF" />
            <Text style={styles.numberText}>{contact.number}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>{contact.title}</Text>
            <Text style={styles.contactDesc}>{contact.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Protocolo de Segurança</Text>

      {safetyTips.map((tip, index) => (
        <View key={index} style={styles.tipCard}>
          <View style={styles.tipHeader}>
            {tip.icon}
            <Text style={styles.tipTitle}>{tip.title}</Text>
          </View>
          <Text style={styles.tipText}>{tip.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  headerBox: {
    backgroundColor: COLORS.criticoBg,
    borderColor: COLORS.criticoBorder,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  callCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  numberBadge: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 96,
    justifyContent: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  contactDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});