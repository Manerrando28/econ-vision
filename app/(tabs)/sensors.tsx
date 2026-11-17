import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Info, Radio } from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '../../src/components/Screen';
import { SensorCard } from '../../src/components/SensorCard';
import { COLORS } from '../../src/theme/colors';
import { fetchIoTSensors } from '../../src/services/iotSensors';
import type { FloodSensor, RiskLevel } from '../../src/types';

type FilterOption = 'TODOS' | RiskLevel;
const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'CRITICO', label: 'Críticos' },
  { key: 'ATENCAO', label: 'Atenção' },
  { key: 'NORMAL', label: 'Normais' },
];

export default function SensorsScreen() {
  const [sensors, setSensors] = useState<FloodSensor[]>([]);
  const [filter, setFilter] = useState<FilterOption>('TODOS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchIoTSensors().then((data) => {
      setSensors(data);
      setLoading(false);
    });
  }, []);

  const filteredSensors = filter === 'TODOS' ? sensors : sensors.filter((sensor) => sensor.status === filter);

  return (
    <Screen>
      <PageIntro
        eyebrow="MONITORAMENTO DE VIAS"
        title="Sensores e rotas"
        description="Entenda o nível da água e consulte as orientações para cada trecho."
      />
      <View style={styles.summary}>
        <View style={styles.summaryIcon}><Radio size={22} color={COLORS.primary} /></View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>{loading ? 'Consultando a rede…' : `${sensors.length} pontos monitorados`}</Text>
          <Text style={styles.summarySubtitle}>São Paulo · Módulos ESP32</Text>
        </View>
        <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((option) => {
          const active = filter === option.key;
          const count = option.key === 'TODOS' ? sensors.length : sensors.filter((sensor) => sensor.status === option.key).length;
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => setFilter(option.key)}
              accessibilityRole="button"
              accessibilityLabel={`${option.label}, ${count} ${count === 1 ? 'sensor' : 'sensores'}`}
              accessibilityState={{ selected: active }}
              aria-pressed={active}
              style={[styles.filter, active && styles.filterActive]}
            >
              <Text style={[styles.filterCount, active && styles.filterTextActive]}>{loading ? '–' : count}</Text>
              <Text style={[styles.filterLabel, active && styles.filterTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SectionHeading title="Condições dos trechos" subtitle={loading ? 'Carregando leituras…' : `${filteredSensors.length} ${filteredSensors.length === 1 ? 'sensor encontrado' : 'sensores encontrados'}`} />
      {loading && <ActivityIndicator color={COLORS.primary} style={styles.loading} accessibilityLabel="Carregando sensores" />}
      {filteredSensors.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} detailed />)}
      {!loading && filteredSensors.length === 0 && (
        <View style={styles.empty}>
          <Radio size={26} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Nenhum sensor nesta categoria</Text>
          <Text style={styles.emptyText}>Selecione outro filtro para consultar os trechos.</Text>
        </View>
      )}
      <View style={styles.note}>
        <Info size={15} color={COLORS.textMuted} />
        <Text style={styles.noteText}>Leituras simuladas para demonstração. As orientações não garantem vias livres; siga sempre os alertas da Defesa Civil.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border },
  summaryIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
  summaryCopy: { flex: 1, gap: 5 },
  summaryTitle: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  summarySubtitle: { color: COLORS.textMuted, fontSize: 11, lineHeight: 16 },
  demoBadge: { backgroundColor: COLORS.surfaceLight, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 5 },
  demoText: { color: COLORS.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  filters: { flexDirection: 'row', gap: 7 },
  filter: { flex: 1, minHeight: 68, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 5 },
  filterActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterCount: { color: COLORS.textPrimary, fontSize: 21, fontWeight: '600', fontVariant: ['tabular-nums'] },
  filterLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },
  filterTextActive: { color: COLORS.onPrimary },
  loading: { marginVertical: 32 },
  empty: { padding: 24, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  note: { flexDirection: 'row', gap: 9, paddingHorizontal: 4 },
  noteText: { flex: 1, color: COLORS.textMuted, fontSize: 11, lineHeight: 18 },
});
