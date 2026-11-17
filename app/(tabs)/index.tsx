import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertTriangle, ArrowRight, CloudRain, CloudSun, Droplets,
  MessageSquarePlus, RefreshCw, ShieldCheck, Users,
} from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '../../src/components/Screen';
import { SensorCard } from '../../src/components/SensorCard';
import { COLORS } from '../../src/theme/colors';
import { fetchLocalWeather } from '../../src/services/weatherApi';
import { fetchIoTSensors } from '../../src/services/iotSensors';
import { getReports } from '../../src/storage/reportsDb';
import type { CitizenReport, FloodSensor, WeatherData } from '../../src/types';

export default function RadarScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [sensors, setSensors] = useState<FloodSensor[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(() => Promise.all([
    fetchLocalWeather().then(setWeather),
    fetchIoTSensors().then(setSensors),
    getReports().then(setReports),
  ]).catch(() => {
    setError(true);
  }).finally(() => {
    setLoading(false);
    setRefreshing(false);
  }), []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);
  useFocusEffect(useCallback(() => {
    void getReports().then(setReports);
  }, []));

  const onRefresh = () => {
    setError(false);
    setRefreshing(true);
    void loadDashboard();
  };
  const criticalSensors = sensors.filter((sensor) => sensor.status === 'CRITICO');
  const activeReports = reports.filter((report) => !report.resolved);
  const hasRisk = criticalSensors.length > 0;
  const WeatherIcon = weather?.isRaining ? CloudRain : CloudSun;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
      <PageIntro
        eyebrow="SEU RADAR URBANO"
        title={'Seu caminho,\nmais seguro.'}
        description="Chuva, alertas e cuidado com a sua região, em um só lugar."
        action={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Atualizar radar"
            accessibilityState={{ disabled: refreshing, busy: refreshing }}
            disabled={refreshing}
            onPress={onRefresh}
            style={styles.refreshButton}
          >
            {refreshing ? <ActivityIndicator color={COLORS.primary} /> : <RefreshCw size={18} color={COLORS.textSecondary} />}
          </TouchableOpacity>
        }
      />

      {error && <Text accessibilityRole="alert" style={styles.error}>Não foi possível atualizar todos os dados. Toque em atualizar para tentar novamente.</Text>}

      <TouchableOpacity
        style={[styles.alertBanner, hasRisk && styles.alertDanger]}
        onPress={() => router.push('/sensors')}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Consultando sensores' : `Ver sensores: ${criticalSensors.length} pontos críticos`}
      >
        <View style={[styles.alertIcon, hasRisk && styles.alertIconDanger]}>
          {loading ? <ActivityIndicator color={COLORS.primary} /> : hasRisk
            ? <AlertTriangle size={22} color={COLORS.criticoText} />
            : <ShieldCheck size={22} color={COLORS.normalText} />}
        </View>
        <View style={styles.alertCopy}>
          <Text style={[styles.alertEyebrow, hasRisk && styles.dangerText]}>CONDIÇÕES DA REGIÃO</Text>
          <Text style={styles.alertTitle}>{loading ? 'Consultando sensores…' : hasRisk ? `${criticalSensors.length} pontos críticos` : 'Sem pontos críticos'}</Text>
          <Text style={styles.alertDescription}>{hasRisk ? 'Confira os trechos e evite áreas de risco.' : 'Consulte as condições dos pontos monitorados.'}</Text>
        </View>
        <ArrowRight size={18} color={hasRisk ? COLORS.criticoText : COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.weatherCard}>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>O TEMPO AGORA</Text>
          <Text style={styles.source}>São Paulo · Open-Meteo</Text>
        </View>
        {weather ? (
          <>
            <View style={styles.weatherMain}>
              <View style={styles.temperatureRow}>
                <Text style={styles.temperature}>{weather.temperature}°</Text>
                <Text style={styles.celsius}>C</Text>
              </View>
              <View style={styles.weatherIcon}>
                <WeatherIcon size={48} strokeWidth={1.3} color={COLORS.primary} />
              </View>
            </View>
            <Text style={styles.condition}>{weather.conditionText}</Text>
            <View style={styles.weatherMetrics}>
              <View style={styles.metric}>
                <Droplets size={17} color={COLORS.primary} />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricValue}>{weather.precipitation} <Text style={styles.unit}>mm</Text></Text>
                  <Text style={styles.metricLabel}>Chuva agora</Text>
                </View>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <CloudRain size={17} color={COLORS.primary} />
                <View style={styles.metricCopy}>
                  <Text style={styles.metricValue}>{weather.rainProbability}<Text style={styles.unit}>%</Text></Text>
                  <Text style={styles.metricLabel}>Chance de chuva</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.weatherLoading}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.metricLabel}>Buscando a previsão local…</Text>
          </View>
        )}
      </View>

      <SectionHeading
        title="Pontos de atenção"
        subtitle="Priorize um trajeto mais seguro."
        action={
          <TouchableOpacity style={styles.seeAll} onPress={() => router.push('/sensors')} accessibilityRole="button" accessibilityLabel="Ver todos os sensores">
            <Text style={styles.link}>Ver todos</Text>
            <ArrowRight size={14} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />
      {criticalSensors.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} />)}
      {!loading && criticalSensors.length === 0 && (
        <View style={styles.emptyState}>
          <ShieldCheck size={22} color={COLORS.primary} />
          <Text style={styles.emptyCopy}>Nenhum sensor em nível crítico neste momento.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.communityCard}
        onPress={() => router.push('/report')}
        accessibilityRole="button"
        accessibilityLabel="Registrar ocorrência no seu bairro"
        activeOpacity={0.8}
      >
        <View style={styles.communityTop}>
          <View style={styles.communityIcon}><MessageSquarePlus size={22} color={COLORS.primary} /></View>
          <View style={styles.communityBadge}><Users size={12} color={COLORS.primary} /><Text style={styles.communityBadgeText}>COMUNIDADE</Text></View>
        </View>
        <Text style={styles.communityTitle}>Seu olhar faz a diferença.</Text>
        <Text style={styles.communityDescription}>Viu uma rua alagada ou um bueiro entupido? Registre o que está acontecendo.</Text>
        <View style={styles.communityAction}>
          <Text style={styles.communityActionText}>Reportar ocorrência</Text>
          <ArrowRight size={18} color={COLORS.onPrimary} />
        </View>
        <Text style={styles.communityFooter}>{activeReports.length} ocorrências ativas salvas neste dispositivo</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>Sensores em demonstração · Não substitui alertas oficiais.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  refreshButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  error: { color: COLORS.criticoText, fontSize: 13, lineHeight: 20 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#285447', backgroundColor: COLORS.normalBg },
  alertDanger: { borderColor: '#60333D', backgroundColor: COLORS.criticoBg },
  alertIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
  alertIconDanger: { backgroundColor: '#492831' },
  alertCopy: { flex: 1, gap: 4 },
  alertEyebrow: { color: COLORS.normalText, fontSize: 8, fontWeight: '700', letterSpacing: 1.2 },
  dangerText: { color: COLORS.criticoText },
  alertTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', letterSpacing: -0.4 },
  alertDescription: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 17 },
  weatherCard: { padding: 20, backgroundColor: COLORS.surface, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardLabel: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '600', letterSpacing: 1.4 },
  source: { color: COLORS.textMuted, fontSize: 10 },
  weatherMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 3 },
  temperatureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  temperature: { color: COLORS.textPrimary, fontSize: 64, lineHeight: 72, fontWeight: '300', letterSpacing: -4, fontVariant: ['tabular-nums'] },
  celsius: { color: COLORS.textMuted, fontSize: 20, marginTop: 12, marginLeft: 4 },
  weatherIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#15312F', alignItems: 'center', justifyContent: 'center' },
  condition: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 21 },
  weatherMetrics: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16, marginTop: 4, gap: 14 },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  metricCopy: { flex: 1, gap: 3 },
  metricValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', fontVariant: ['tabular-nums'] },
  unit: { fontSize: 12, color: COLORS.textMuted, fontWeight: '400' },
  metricLabel: { color: COLORS.textMuted, fontSize: 10, lineHeight: 16 },
  metricDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
  weatherLoading: { minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 12 },
  seeAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 44, paddingLeft: 8 },
  link: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  emptyState: { padding: 20, backgroundColor: COLORS.surface, borderRadius: 18, flexDirection: 'row', gap: 12 },
  emptyCopy: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, flex: 1 },
  communityCard: { backgroundColor: '#102B28', borderRadius: 22, borderWidth: 1, borderColor: '#245247', padding: 20, gap: 12 },
  communityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  communityIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryDark },
  communityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  communityBadgeText: { color: COLORS.primary, fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  communityTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '600', letterSpacing: -0.5 },
  communityDescription: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 21 },
  communityAction: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  communityActionText: { color: COLORS.onPrimary, fontSize: 14, fontWeight: '700', flex: 1 },
  communityFooter: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 16 },
  disclaimer: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 17 },
});
