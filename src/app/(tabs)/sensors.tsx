import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Info, Radio } from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '@/src/components/Screen';
import { SensorCard } from '@/src/components/SensorCard';
import { LoadError } from '@/src/components/LoadError';
import { COLORS } from '@/src/theme/colors';
import { SENSORS_STYLES as styles } from '@/src/theme/styles';
import { fetchIoTSensors } from '@/src/services/iotSensors';
import { useAsyncResource } from '@/src/hooks/useAsyncResource';
import type { RiskLevel } from '@/src/types';

type FilterOption = 'TODOS' | RiskLevel;
const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'TODOS', label: 'Todos' }, { key: 'CRITICO', label: 'Críticos' },
  { key: 'ATENCAO', label: 'Atenção' }, { key: 'NORMAL', label: 'Normais' },
];

export default function SensorsScreen() {
  const { data: sensors = [], loading, error, reload } = useAsyncResource(fetchIoTSensors);
  const [filter, setFilter] = useState<FilterOption>('TODOS');
  const [query, setQuery] = useState('');
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const search = normalize(query.trim());
  const filteredSensors = sensors.filter((sensor) => (filter === 'TODOS' || sensor.status === filter)
    && normalize(`${sensor.name} ${sensor.neighborhood} ${sensor.id}`).includes(search));

  return (
    <Screen>
      <PageIntro eyebrow="MONITORAMENTO DE VIAS" title="Sensores e rotas" description="Entenda o nível da água e consulte as orientações para cada trecho." />
      <View style={styles.summary}>
        <View style={styles.summaryIcon}><Radio size={22} color={COLORS.primary} /></View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>{loading ? 'Consultando a rede…' : error ? 'Leituras indisponíveis' : `${sensors.length} pontos monitorados`}</Text>
          <Text style={styles.summarySubtitle}>São Paulo · Módulos ESP32</Text>
        </View>
        <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View>
      </View>
      <TextInput
        style={styles.search}
        accessibilityLabel="Buscar via ou bairro"
        placeholder="Buscar via, bairro ou código"
        placeholderTextColor={COLORS.textMuted}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
        maxLength={80}
      />
      <View style={styles.filters}>
        {FILTERS.map((option) => {
          const active = filter === option.key;
          const count = option.key === 'TODOS' ? sensors.length : sensors.filter((sensor) => sensor.status === option.key).length;
          return (
            <TouchableOpacity key={option.key} onPress={() => setFilter(option.key)} accessibilityRole="button"
              accessibilityLabel={`${option.label}, ${count} ${count === 1 ? 'sensor' : 'sensores'}`}
              accessibilityState={{ selected: active }} aria-pressed={active} style={[styles.filter, active && styles.filterActive]}>
              <Text style={[styles.filterCount, active && styles.filterTextActive]}>{loading || error ? '–' : count}</Text>
              <Text style={[styles.filterLabel, active && styles.filterTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <SectionHeading title="Condições dos trechos" subtitle={loading ? 'Carregando leituras…' : error ? 'Não foi possível atualizar as leituras' : `${filteredSensors.length} ${filteredSensors.length === 1 ? 'sensor encontrado' : 'sensores encontrados'}`} />
      {loading && <ActivityIndicator color={COLORS.primary} style={styles.loading} accessibilityLabel="Carregando sensores" />}
      {error && <LoadError message="Não foi possível carregar os sensores. Não considere leituras anteriores como condições atuais." onRetry={() => void reload()} />}
      {filteredSensors.map((sensor) => <SensorCard key={sensor.id} sensor={sensor} detailed />)}
      {!loading && !error && filteredSensors.length === 0 && (
        <View style={styles.empty}>
          <Radio size={26} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Nenhum sensor nesta categoria</Text>
          <Text style={styles.emptyText}>Tente outro bairro, endereço ou filtro para consultar os trechos.</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.clear} onPress={() => { setQuery(''); setFilter('TODOS'); }}>
            <Text style={styles.clearText}>Limpar busca e filtros</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.note}>
        <Info size={15} color={COLORS.textMuted} />
        <Text style={styles.noteText}>Leituras simuladas para demonstração. As orientações não garantem vias livres; siga sempre os alertas da Defesa Civil.</Text>
      </View>
    </Screen>
  );
}
