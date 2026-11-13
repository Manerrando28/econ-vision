import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Radio, Navigation, Clock } from 'lucide-react-native';
import { COLORS, getRiskStyle } from '../../src/theme/colors';
import { fetchIoTSensors } from '../../src/services/iotSensors';
import { FloodSensor, RiskLevel } from '../../src/types';
import { RiskBadge } from '../../src/components/RiskBadge';

type FilterOption = 'TODOS' | RiskLevel;

export default function SensorsScreen() {
  const [sensors, setSensors] = useState<FloodSensor[]>([]);
  const [filter, setFilter] = useState<FilterOption>('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIoTSensors().then((data) => {
      setSensors(data);
      setLoading(false);
    });
  }, []);

  const filteredSensors =
    filter === 'TODOS' ? sensors : sensors.filter((s) => s.status === filter);

  const filterButtons: { key: FilterOption; label: string }[] = [
    { key: 'TODOS', label: 'Todos' },
    { key: 'CRITICO', label: 'Críticos' },
    { key: 'ATENCAO', label: 'Atenção' },
    { key: 'NORMAL', label: 'Normais' },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Telemetria em tempo real dos módulos ultrassônicos ESP32 instalados em pontos estratégicos.
      </Text>

      {/* Filtros Acessíveis */}
      <View style={styles.filterRow}>
        {filterButtons.map((btn) => {
          const active = filter === btn.key;
          return (
            <TouchableOpacity
              key={btn.key}
              onPress={() => setFilter(btn.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Lista de Sensores */}
      {filteredSensors.map((sensor) => {
        const percentage = Math.min(
          100,
          Math.round((sensor.waterLevelCm / sensor.maxCapacityCm) * 100)
        );
        const riskColors = getRiskStyle(sensor.status);

        return (
          <View key={sensor.id} style={styles.card}>
            <View style={styles.cardTop}>
              <RiskBadge level={sensor.status} />
              <View style={styles.timeBox}>
                <Clock size={13} color={COLORS.textMuted} />
                <Text style={styles.timeText}>{sensor.lastUpdated}</Text>
              </View>
            </View>

            <View style={styles.titleRow}>
              <Radio size={18} color={COLORS.primary} />
              <Text style={styles.sensorName}>{sensor.name}</Text>
            </View>
            <Text style={styles.neighborhood}>
              Bairro: {sensor.neighborhood} • Módulo {sensor.id}
            </Text>

            {/* Barra de Nível da Água */}
            <View style={styles.levelContainer}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelLabel}>Nível da Água</Text>
                <Text style={styles.levelValue}>
                  {sensor.waterLevelCm} cm / {sensor.maxCapacityCm} cm ({percentage}%)
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: riskColors.border,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Recomendação de Rota Segura */}
            <View style={styles.routeBox}>
              <Navigation size={16} color={COLORS.primary} />
              <Text style={styles.routeText}>{sensor.safeRouteTip}</Text>
            </View>
          </View>
        );
      })}
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
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sensorName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  neighborhood: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  levelContainer: {
    gap: 6,
    marginTop: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  levelValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  routeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginTop: 2,
  },
  routeText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});