import { Clock3, MapPin, Navigation, Radio } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, getRiskStyle } from '../theme/colors';
import type { FloodSensor } from '../types';
import { RiskBadge } from './RiskBadge';

export function SensorCard({ sensor, detailed = false }: { sensor: FloodSensor; detailed?: boolean }) {
  const risk = getRiskStyle(sensor.status);
  const percentage = Math.max(0, Math.min(100, Math.round(sensor.waterLevelCm / sensor.maxCapacityCm * 100)));

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <RiskBadge level={sensor.status} />
        <Text style={styles.code}>{sensor.id}</Text>
      </View>
      <Text style={styles.name}>{sensor.name}</Text>
      <View style={styles.location}>
        <MapPin size={13} color={COLORS.textMuted} />
        <Text style={styles.meta}>{sensor.neighborhood}</Text>
      </View>
      {detailed && (
        <View style={styles.level}>
          <View style={styles.levelHeader}>
            <Text style={styles.meta}>Nível da água</Text>
            <Text style={[styles.percentage, { color: risk.text }]}>{percentage}%</Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`Nível da água em ${sensor.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-valuetext={`${sensor.waterLevelCm} de ${sensor.maxCapacityCm} centímetros`}
            style={styles.track}
          >
            <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: risk.border }]} />
          </View>
          <View style={styles.levelHeader}>
            <Text style={styles.measurement}>{sensor.waterLevelCm} cm <Text style={styles.meta}>de {sensor.maxCapacityCm} cm</Text></Text>
            <View style={styles.location}>
              <Clock3 size={11} color={COLORS.textMuted} />
              <Text style={styles.updated}>{sensor.lastUpdated}</Text>
            </View>
          </View>
        </View>
      )}
      <View style={styles.route}>
        <Navigation size={16} color={COLORS.primary} style={styles.routeIcon} />
        <View style={styles.routeCopy}>
          <Text style={styles.routeLabel}>ORIENTAÇÃO DE ROTA</Text>
          <Text style={styles.routeText}>{sensor.safeRouteTip}</Text>
        </View>
      </View>
      {detailed && (
        <View style={styles.location}>
          <Radio size={12} color={COLORS.textMuted} />
          <Text style={styles.updated}>Módulo ultrassônico ESP32 · Dados simulados</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 18, gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  code: { fontFamily: 'SpaceMono', color: COLORS.textMuted, fontSize: 10 },
  name: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', lineHeight: 23, letterSpacing: -0.2 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  meta: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, flexShrink: 1 },
  level: { gap: 9, paddingVertical: 4 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  percentage: { fontSize: 23, fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 6, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  measurement: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  updated: { color: COLORS.textMuted, fontSize: 10, flexShrink: 1, lineHeight: 16 },
  route: { flexDirection: 'row', gap: 10, padding: 13, backgroundColor: COLORS.background, borderRadius: 12 },
  routeIcon: { marginTop: 2 },
  routeCopy: { flex: 1, gap: 5 },
  routeLabel: { color: COLORS.primary, fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  routeText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
