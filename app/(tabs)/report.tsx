import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { PlusCircle, CheckCircle, Trash2, MapPin } from 'lucide-react-native';
import { COLORS } from '../../src/theme/colors';
import {
  getReports,
  addReport,
  toggleReportResolved,
  deleteReport,
} from '../../src/storage/reportsDb';
import { CitizenReport, RiskLevel } from '../../src/types';
import { RiskBadge } from '../../src/components/RiskBadge';

export default function ReportScreen() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [location, setLocation] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] =
    useState<CitizenReport['category']>('ALAGAMENTO');
  const [severity, setSeverity] = useState<RiskLevel>('ATENCAO');

  useEffect(() => {
    getReports().then(setReports);
  }, []);

  const handleSave = async () => {
    if (!location.trim() || !neighborhood.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Informe o endereço ou ponto de referência e o bairro.'
      );
      return;
    }

    const updated = await addReport({
      location: location.trim(),
      neighborhood: neighborhood.trim(),
      category,
      severity,
      description:
        description.trim() || 'Ocorrência registrada pelo cidadão via Econ Vision.',
    });

    setReports(updated);
    setLocation('');
    setNeighborhood('');
    setDescription('');
    Alert.alert('Alerta Registrado!', 'Sua ocorrência foi salva no banco local.');
  };

  const handleToggle = async (id: string) => {
    const updated = await toggleReportResolved(id);
    setReports(updated);
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteReport(id);
    setReports(updated);
  };

  const categoryLabels: Record<CitizenReport['category'], string> = {
    ALAGAMENTO: 'Rua Alagada',
    BUEIRO_ENTUPIDO: 'Bueiro Entupido',
    RISCO_DESLIZAMENTO: 'Risco Encosta',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Formulário de Novo Registro */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Registrar Ocorrência no Bairro</Text>
        <Text style={styles.formSubtitle}>
          Os registros ficam salvos no dispositivo para consulta offline e alerta comunitário.
        </Text>

        <Text style={styles.label}>Endereço ou Ponto de Referência *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Av. Paulista, 1106"
          placeholderTextColor={COLORS.textMuted}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Bairro *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Bela Vista"
          placeholderTextColor={COLORS.textMuted}
          value={neighborhood}
          onChangeText={setNeighborhood}
        />

        <Text style={styles.label}>Tipo de Ocorrência</Text>
        <View style={styles.chipRow}>
          {(['ALAGAMENTO', 'BUEIRO_ENTUPIDO', 'RISCO_DESLIZAMENTO'] as const).map(
            (cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.chip, category === cat && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === cat && styles.chipTextActive,
                  ]}
                >
                  {categoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <Text style={styles.label}>Nível de Gravidade</Text>
        <View style={styles.chipRow}>
          {(['ATENCAO', 'CRITICO'] as const).map((sev) => (
            <TouchableOpacity
              key={sev}
              onPress={() => setSeverity(sev)}
              style={[styles.chip, severity === sev && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  severity === sev && styles.chipTextActive,
                ]}
              >
                {sev === 'CRITICO' ? 'Crítico (Bloqueado)' : 'Atenção (Parcial)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Observações (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descreva a altura da água ou obstrução..."
          placeholderTextColor={COLORS.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Salvar alerta no banco de dados"
        >
          <PlusCircle size={20} color="#0F172A" />
          <Text style={styles.submitText}>Publicar Alerta Comunitário</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Ocorrências Salvas no Banco Local */}
      <Text style={styles.listHeader}>
        Ocorrências Registradas ({reports.length})
      </Text>

      {reports.map((item) => (
        <View
          key={item.id}
          style={[styles.reportCard, item.resolved && styles.reportCardResolved]}
        >
          <View style={styles.reportTop}>
            <RiskBadge level={item.resolved ? 'NORMAL' : item.severity} />
            <Text style={styles.reportTime}>{item.createdAt}</Text>
          </View>

          <View style={styles.locationRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.reportLocation}>{item.location}</Text>
          </View>
          <Text style={styles.reportMeta}>
            {item.neighborhood} • {categoryLabels[item.category]}
          </Text>
          <Text style={styles.reportDesc}>{item.description}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleToggle(item.id)}
            >
              <CheckCircle
                size={16}
                color={item.resolved ? COLORS.normalText : COLORS.primary}
              />
              <Text style={styles.actionText}>
                {item.resolved ? 'Reabrir' : 'Marcar como Resolvido'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id)}
              accessibilityLabel="Excluir registro"
            >
              <Trash2 size={16} color="#FCA5A5" />
            </TouchableOpacity>
          </View>
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
    paddingBottom: 36,
    gap: 14,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  formTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  formSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  listHeader: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  reportCardResolved: {
    opacity: 0.7,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportTime: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportLocation: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  reportMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  reportDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 6,
  },
});