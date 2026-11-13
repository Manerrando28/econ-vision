import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CloudRain,
  Droplets,
  Thermometer,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';
import { COLORS } from '../../src/theme/colors';
import { fetchLocalWeather } from '../../src/services/weatherApi';
import { fetchIoTSensors } from '../../src/services/iotSensors';
import { getReports } from '../../src/storage/reportsDb';
import { WeatherData, FloodSensor, CitizenReport } from '../../src/types';
import { RiskBadge } from '../../src/components/RiskBadge';

export default function RadarScreen() {
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    precipitation: 3.2,
    rainProbability: 80,
    conditionText: 'Alerta de chuva forte na região',
    isRaining: true,
  });
  const [sensors, setSensors] = useState<FloodSensor[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    // Trava de segurança: libera a interface em no máximo 1.5s
    const safetyTimer = setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 1500);

    try {
      const [weatherRes, sensorsRes, reportsRes] = await Promise.all([
        fetchLocalWeather(),
        fetchIoTSensors(),
        getReports(),
      ]);
      setWeather(weatherRes);
      setSensors(sensorsRes);
      setReports(reportsRes);
    } catch (e) {
      console.warn('Erro ao sincronizar dashboard:', e);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const criticalSensors = sensors.filter((s) => s.status === 'CRITICO');
  const activeReports = reports.filter((r) => !r.resolved);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Sincronizando radar e sensores IoT...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Banner de Status Geral */}
      <View
        style={[
          styles.alertBanner,
          criticalSensors.length > 0 ? styles.alertBannerDanger : styles.alertBannerSafe,
        ]}
      >
        <View style={styles.bannerHeader}>
          {criticalSensors.length > 0 ? (
            <AlertTriangle size={24} color="#FCA5A5" />
          ) : (
            <ShieldCheck size={24} color="#6EE7B7" />
          )}
          <Text style={styles.bannerTitle}>
            {criticalSensors.length > 0
              ? `${criticalSensors.length} Pontos Críticos de Alagamento`
              : 'Circulação Segura na Região'}
          </Text>
        </View>
        <Text style={styles.bannerSubtitle}>
          {criticalSensors.length > 0
            ? 'Sensores ESP32 detectaram transbordamento iminente. Verifique rotas alternativas antes de sair.'
            : 'Nenhuma via bloqueada pelos sensores monitorados no momento.'}
        </Text>
      </View>

      {/* Card de Clima em Tempo Real (API Open-Meteo) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionLabel}>METEOROLOGIA EM TEMPO REAL • SÃO PAULO</Text>
          <CloudRain size={20} color={COLORS.primary} />
        </View>

        <Text style={styles.conditionText}>{weather.conditionText}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Thermometer size={20} color={COLORS.primary} />
            <Text style={styles.metricValue}>{weather.temperature}°C</Text>
            <Text style={styles.metricLabel}>Temperatura</Text>
          </View>

          <View style={styles.metricBox}>
            <Droplets size={20} color={COLORS.primary} />
            <Text style={styles.metricValue}>{weather.precipitation} mm</Text>
            <Text style={styles.metricLabel}>Chuva Agora</Text>
          </View>

          <View style={styles.metricBox}>
            <CloudRain size={20} color={COLORS.primary} />
            <Text style={styles.metricValue}>{weather.rainProbability}%</Text>
            <Text style={styles.metricLabel}>Prob. Chuva</Text>
          </View>
        </View>
      </View>

      {/* Destaques dos Sensores Críticos */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Alertas dos Sensores IoT</Text>
        <TouchableOpacity
          onPress={() => router.push('/sensors')}
          accessibilityRole="button"
          accessibilityLabel="Ver todos os sensores IoT"
        >
          <Text style={styles.linkText}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      {criticalSensors.map((sensor) => (
        <View key={sensor.id} style={styles.sensorCard}>
          <View style={styles.sensorTop}>
            <RiskBadge level={sensor.status} />
            <Text style={styles.sensorCode}>{sensor.id}</Text>
          </View>
          <Text style={styles.sensorName}>{sensor.name}</Text>
          <Text style={styles.sensorNeighborhood}>{sensor.neighborhood}</Text>
          <Text style={styles.routeTip}>💡 {sensor.safeRouteTip}</Text>
        </View>
      ))}

      {/* Ação Rápida para Reporte Colaborativo */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push('/report')}
        accessibilityRole="button"
        accessibilityLabel="Registrar novo ponto de alagamento"
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Viu um bueiro entupido ou rua alagada?</Text>
          <Text style={styles.ctaSubtitle}>
            {activeReports.length} ocorrências ativas registradas pela comunidade
          </Text>
        </View>
        <ArrowRight size={24} color="#0F172A" />
      </TouchableOpacity>
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
    gap: 16,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  alertBanner: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  alertBannerDanger: {
    backgroundColor: COLORS.criticoBg,
    borderColor: COLORS.criticoBorder,
  },
  alertBannerSafe: {
    backgroundColor: COLORS.normalBg,
    borderColor: COLORS.normalBorder,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  bannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  conditionText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  metricBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  sensorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  sensorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sensorCode: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sensorName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  sensorNeighborhood: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  routeTip: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  ctaTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  ctaSubtitle: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});