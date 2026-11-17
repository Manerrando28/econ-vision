import { Clock3, MapPin, Navigation, Radio } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { COLORS, getRiskStyle } from '../theme/colors';
import type { FloodSensor } from '../types';
import { RiskBadge } from './RiskBadge';
import { SENSOR_CARD_STYLES as styles } from '../theme/styles';

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
