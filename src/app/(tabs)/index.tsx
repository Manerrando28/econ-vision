import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertTriangle, ArrowRight, CloudRain, CloudSun, Droplets,
  MessageSquarePlus, RefreshCw, ShieldCheck, Users,
} from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '@/src/components/Screen';
import { SensorCard } from '@/src/components/SensorCard';
import { LoadError } from '@/src/components/LoadError';
import { COLORS } from '@/src/theme/colors';
import { RADAR_STYLES as styles } from '@/src/theme/styles';
import { fetchLocalWeather } from '@/src/services/weatherApi';
import { fetchIoTSensors } from '@/src/services/iotSensors';
import { getReports } from '@/src/storage/reportsDb';
import { useAsyncResource } from '@/src/hooks/useAsyncResource';

export default function RadarScreen() {
  const router = useRouter();
  const weatherResource = useAsyncResource(fetchLocalWeather);
  const sensorResource = useAsyncResource(fetchIoTSensors);
  const reportResource = useAsyncResource(getReports);
  const weather = weatherResource.data;
  const sensors = sensorResource.data ?? [];
  const reports = reportResource.data ?? [];
  const loading = sensorResource.loading;
  const [refreshing, setRefreshing] = useState(false);
  const reloadReports = reportResource.reload;
  useFocusEffect(useCallback(() => {
    void reloadReports();
  }, [reloadReports]));

  const onRefresh = () => {
    setRefreshing(true);
    void Promise.all([weatherResource.reload(), sensorResource.reload(), reportResource.reload()])
      .finally(() => setRefreshing(false));
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

      {sensorResource.error && <LoadError message="Não foi possível consultar os sensores. Não é possível confirmar as condições das vias." onRetry={() => void sensorResource.reload()} />}

      <TouchableOpacity
        style={[styles.alertBanner, hasRisk && styles.alertDanger, (sensorResource.error || sensors.length === 0) && styles.alertUnknown]}
        onPress={() => router.push('/sensors')}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Consultando sensores' : sensorResource.error ? 'Leituras indisponíveis. Ver sensores.' : `Ver sensores: ${criticalSensors.length} pontos críticos`}
      >
        <View style={[styles.alertIcon, hasRisk && styles.alertIconDanger]}>
          {loading ? <ActivityIndicator color={COLORS.primary} /> : sensorResource.error || sensors.length === 0
            ? <AlertTriangle size={22} color={COLORS.textMuted} /> : hasRisk
            ? <AlertTriangle size={22} color={COLORS.criticoText} />
            : <ShieldCheck size={22} color={COLORS.normalText} />}
        </View>
        <View style={styles.alertCopy}>
          <Text style={[styles.alertEyebrow, hasRisk && styles.dangerText]}>CONDIÇÕES DA REGIÃO</Text>
          <Text style={styles.alertTitle}>{loading ? 'Consultando sensores…' : sensorResource.error ? 'Leituras indisponíveis' : sensors.length === 0 ? 'Sem pontos monitorados' : hasRisk ? `${criticalSensors.length} pontos críticos` : 'Sem pontos críticos'}</Text>
          <Text style={styles.alertDescription}>{hasRisk ? 'Confira os trechos e evite áreas de risco.' : 'Consulte as condições dos pontos monitorados.'}</Text>
        </View>
        <ArrowRight size={18} color={hasRisk ? COLORS.criticoText : COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.weatherCard}>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>O TEMPO AGORA</Text>
          <Text style={styles.source}>São Paulo · Open-Meteo</Text>
        </View>
        {weatherResource.error && <LoadError message={weather ? 'Não foi possível atualizar a previsão. Os valores anteriores podem estar desatualizados.' : 'Não foi possível consultar o clima. Verifique sua conexão.'} onRetry={() => void weatherResource.reload()} />}
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
        ) : weatherResource.loading ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.metricLabel}>Buscando a previsão local…</Text>
          </View>
        ) : null}
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
      {!loading && !sensorResource.error && criticalSensors.length === 0 && (
        <View style={styles.emptyState}>
          <ShieldCheck size={22} color={COLORS.primary} />
          <Text style={styles.emptyCopy}>{sensors.length === 0 ? 'Nenhum sensor disponível para esta região.' : 'Nenhum sensor em nível crítico neste momento.'}</Text>
        </View>
      )}

      {reportResource.error && <LoadError message="Não foi possível ler seus registros locais." onRetry={() => void reportResource.reload()} />}
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
        <Text style={styles.communityFooter}>{reportResource.error ? 'Registros locais indisponíveis' : reportResource.loading ? 'Consultando registros…' : `${activeReports.length} ocorrências ativas salvas neste dispositivo`}</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>Sensores em demonstração · Não substitui alertas oficiais.</Text>
    </Screen>
  );
}
