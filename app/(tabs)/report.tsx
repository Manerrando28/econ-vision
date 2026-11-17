import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, type TextInputInstance,
} from 'react-native';
import {
  ArrowRight, Check, CheckCircle2, Clock3, CloudRain, HardDrive,
  MapPin, Mountain, Plus, RotateCcw, Trash2, Waves,
} from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '../../src/components/Screen';
import { RiskBadge } from '../../src/components/RiskBadge';
import { COLORS } from '../../src/theme/colors';
import { addReport, deleteReport, getReports, toggleReportResolved } from '../../src/storage/reportsDb';
import type { CitizenReport, RiskLevel } from '../../src/types';

const CATEGORIES = [
  { key: 'ALAGAMENTO', label: 'Alagamento', fullLabel: 'Rua alagada', icon: CloudRain },
  { key: 'BUEIRO_ENTUPIDO', label: 'Bueiro', fullLabel: 'Bueiro entupido', icon: Waves },
  { key: 'RISCO_DESLIZAMENTO', label: 'Encosta', fullLabel: 'Risco de deslizamento', icon: Mountain },
] as const;
type Notice = { tone: 'error' | 'success'; message: string };

export default function ReportScreen() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CitizenReport['category']>('ALAGAMENTO');
  const [severity, setSeverity] = useState<RiskLevel>('ATENCAO');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const locationRef = useRef<TextInputInstance>(null);
  const neighborhoodRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    void getReports().then(setReports).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setNotice(null);
    if (!location.trim() || !neighborhood.trim()) {
      setShowValidation(true);
      setNotice({ tone: 'error', message: 'Preencha o endereço e o bairro para continuar.' });
      (!location.trim() ? locationRef : neighborhoodRef).current?.focus();
      return;
    }
    setSaving(true);
    try {
      const updated = await addReport({
        location: location.trim(),
        neighborhood: neighborhood.trim(),
        category,
        severity,
        description: description.trim() || 'Ocorrência registrada pelo cidadão via Eco Vision.',
      });
      setReports(updated);
      setLocation('');
      setNeighborhood('');
      setDescription('');
      setShowValidation(false);
      setNotice({ tone: 'success', message: 'Ocorrência salva! Você pode acompanhá-la nos seus registros abaixo.' });
    } catch {
      setNotice({ tone: 'error', message: 'Não foi possível salvar. Seus dados foram mantidos; tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  const updateReport = async (id: string, action: 'toggle' | 'delete') => {
    if (busyId) return;
    setBusyId(id);
    setListError(null);
    try {
      setReports(await (action === 'delete' ? deleteReport(id) : toggleReportResolved(id)));
      setPendingDelete(null);
    } catch {
      setListError('Não foi possível atualizar o registro. Tente novamente.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen keyboardAware>
      <PageIntro
        eyebrow="CUIDADO QUE COMEÇA COM VOCÊ"
        title="Reportar ocorrência"
        description="Registre um problema no seu bairro e acompanhe a situação."
      />
      <View style={styles.localNote}>
        <HardDrive size={16} color={COLORS.primary} />
        <Text style={styles.localNoteText}>Seus registros ficam neste dispositivo e podem ser consultados offline.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formHeading}>
          <View style={styles.plusIcon}><Plus size={19} color={COLORS.primary} /></View>
          <Text accessibilityRole="header" style={styles.formTitle}>Novo registro</Text>
        </View>
        <Text style={styles.requiredHint}>* Campos obrigatórios</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Endereço ou referência <Text style={styles.asterisk}>*</Text></Text>
          <TextInput
            ref={locationRef}
            accessibilityLabel="Endereço ou ponto de referência, obrigatório"
            style={[styles.input, focusedField === 'location' && styles.inputFocused, showValidation && !location.trim() && styles.inputError]}
            placeholder="Ex.: Av. Paulista, 1106"
            placeholderTextColor={COLORS.textMuted}
            value={location}
            onChangeText={setLocation}
            onFocus={() => setFocusedField('location')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="sentences"
            returnKeyType="next"
            onSubmitEditing={() => neighborhoodRef.current?.focus()}
            maxLength={160}
          />
          {showValidation && !location.trim() && <Text style={styles.fieldError}>Informe um endereço ou ponto de referência.</Text>}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Bairro <Text style={styles.asterisk}>*</Text></Text>
          <TextInput
            ref={neighborhoodRef}
            accessibilityLabel="Bairro, obrigatório"
            style={[styles.input, focusedField === 'neighborhood' && styles.inputFocused, showValidation && !neighborhood.trim() && styles.inputError]}
            placeholder="Ex.: Bela Vista"
            placeholderTextColor={COLORS.textMuted}
            value={neighborhood}
            onChangeText={setNeighborhood}
            onFocus={() => setFocusedField('neighborhood')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="words"
            maxLength={80}
          />
          {showValidation && !neighborhood.trim() && <Text style={styles.fieldError}>Informe o bairro da ocorrência.</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>O que está acontecendo?</Text>
          <View style={styles.optionsRow}>
            {CATEGORIES.map(({ key, label, fullLabel, icon: Icon }) => {
              const active = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={fullLabel}
                  accessibilityState={{ selected: active }}
                  aria-pressed={active}
                  onPress={() => setCategory(key)}
                  style={[styles.category, active && styles.optionActive]}
                >
                  <Icon size={21} color={active ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.categoryText, active && styles.optionActiveText]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Qual é a gravidade?</Text>
          <View style={styles.optionsRow}>
            {(['ATENCAO', 'CRITICO'] as const).map((level) => {
              const active = severity === level;
              const critical = level === 'CRITICO';
              return (
                <TouchableOpacity
                  key={level}
                  accessibilityRole="button"
                  accessibilityLabel={critical ? 'Crítico, via bloqueada' : 'Atenção, passagem parcial'}
                  accessibilityState={{ selected: active }}
                  aria-pressed={active}
                  onPress={() => setSeverity(level)}
                  style={[styles.severity, active && (critical ? styles.criticalActive : styles.attentionActive)]}
                >
                  <View style={styles.severityHeading}>
                    <View style={[styles.radio, active && { borderColor: critical ? COLORS.criticoText : COLORS.atencaoText }]}>
                      {active && <View style={[styles.radioDot, { backgroundColor: critical ? COLORS.criticoText : COLORS.atencaoText }]} />}
                    </View>
                    <Text style={[styles.severityTitle, active && { color: critical ? COLORS.criticoText : COLORS.atencaoText }]}>{critical ? 'Crítico' : 'Atenção'}</Text>
                  </View>
                  <Text style={styles.severityDescription}>{critical ? 'Via bloqueada' : 'Passagem parcial'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}><Text style={styles.label}>Observações</Text><Text style={styles.optional}>Opcional</Text></View>
          <TextInput
            accessibilityLabel="Observações, opcional"
            style={[styles.input, styles.textArea, focusedField === 'description' && styles.inputFocused]}
            placeholder="Descreva a altura da água ou o que está obstruindo a passagem…"
            placeholderTextColor={COLORS.textMuted}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setFocusedField('description')}
            onBlur={() => setFocusedField(null)}
            multiline
            maxLength={600}
          />
        </View>

        {notice && (
          <View accessibilityRole={notice.tone === 'error' ? 'alert' : 'text'} accessibilityLiveRegion="polite" style={[styles.notice, notice.tone === 'error' ? styles.errorNotice : styles.successNotice]}>
            {notice.tone === 'success' && <CheckCircle2 size={18} color={COLORS.primary} />}
            <Text style={[styles.noticeText, { color: notice.tone === 'error' ? COLORS.criticoText : COLORS.normalText }]}>{notice.message}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.submit, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Salvar ocorrência neste dispositivo"
          accessibilityState={{ disabled: saving, busy: saving }}
        >
          {saving ? <ActivityIndicator color={COLORS.onPrimary} /> : <Plus size={19} color={COLORS.onPrimary} />}
          <Text style={styles.submitText}>{saving ? 'Salvando…' : 'Salvar ocorrência'}</Text>
          {!saving && <ArrowRight size={17} color={COLORS.onPrimary} />}
        </TouchableOpacity>
        <Text style={styles.formFooter}>Este registro não aciona os serviços de emergência.</Text>
      </View>

      <SectionHeading title="Seus registros" subtitle={`${reports.length} no dispositivo · ${reports.filter((report) => !report.resolved).length} em aberto`} />
      {listError && <Text accessibilityRole="alert" style={styles.listError}>{listError}</Text>}
      {loading && <ActivityIndicator color={COLORS.primary} />}
      {!loading && reports.length === 0 && (
        <View style={styles.empty}>
          <MapPin size={28} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>Nenhuma ocorrência por aqui</Text>
          <Text style={styles.emptyText}>Seus próximos registros aparecerão neste espaço.</Text>
        </View>
      )}
      {reports.map((item) => (
        <View key={item.id} style={[styles.reportCard, item.resolved && styles.resolvedCard]}>
          <View style={styles.reportTop}>
            <RiskBadge level={item.resolved ? 'NORMAL' : item.severity} label={item.resolved ? 'Resolvido' : undefined} />
            <View style={styles.time}><Clock3 size={11} color={COLORS.textMuted} /><Text style={styles.timeText}>{item.createdAt}</Text></View>
          </View>
          <Text style={styles.reportLocation}>{item.location}</Text>
          <View style={styles.reportMeta}>
            <MapPin size={12} color={COLORS.textMuted} />
            <Text style={styles.reportMetaText}>{item.neighborhood} · {CATEGORIES.find((option) => option.key === item.category)?.fullLabel}</Text>
          </View>
          <Text style={styles.reportDescription}>{item.description}</Text>
          <View style={styles.reportActions}>
            <TouchableOpacity
              style={styles.resolveButton}
              onPress={() => void updateReport(item.id, 'toggle')}
              disabled={busyId !== null}
              accessibilityRole="button"
              accessibilityLabel={`${item.resolved ? 'Reabrir' : 'Resolver'} ocorrência: ${item.location}`}
            >
              {item.resolved ? <RotateCcw size={16} color={COLORS.primary} /> : <Check size={17} color={COLORS.primary} />}
              <Text style={styles.resolveText}>{item.resolved ? 'Reabrir registro' : 'Marcar resolvido'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setPendingDelete(item.id)}
              disabled={busyId !== null}
              accessibilityRole="button"
              accessibilityLabel={`Excluir ocorrência: ${item.location}`}
            >
              <Trash2 size={17} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          {pendingDelete === item.id && (
            <View style={styles.deleteConfirmation}>
              <Text style={styles.deleteQuestion}>Excluir este registro do dispositivo?</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setPendingDelete(null)} accessibilityRole="button" disabled={busyId !== null}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmDeleteButton} onPress={() => void updateReport(item.id, 'delete')} accessibilityRole="button" disabled={busyId !== null} accessibilityLabel="Confirmar exclusão">
                  <Text style={styles.confirmDeleteText}>{busyId === item.id ? 'Excluindo…' : 'Excluir'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  localNote: { flexDirection: 'row', gap: 10, paddingHorizontal: 2, alignItems: 'flex-start' },
  localNoteText: { flex: 1, color: COLORS.textMuted, fontSize: 12, lineHeight: 19 },
  form: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, gap: 20 },
  formHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  plusIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
  formTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', letterSpacing: -0.3 },
  requiredHint: { color: COLORS.textMuted, fontSize: 10, marginTop: -12 },
  field: { gap: 9 },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  asterisk: { color: COLORS.primary },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, minHeight: 50, fontSize: 16, color: COLORS.textPrimary },
  inputFocused: { borderColor: COLORS.primary },
  inputError: { borderColor: COLORS.criticoBorder },
  fieldError: { color: COLORS.criticoText, fontSize: 11, lineHeight: 17 },
  textArea: { minHeight: 108, textAlignVertical: 'top', lineHeight: 21 },
  optionsRow: { flexDirection: 'row', gap: 8 },
  category: { flex: 1, minHeight: 76, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, paddingHorizontal: 3, paddingVertical: 12, gap: 8 },
  optionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.normalBg },
  categoryText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '500', textAlign: 'center' },
  optionActiveText: { color: COLORS.primary },
  severity: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, gap: 7, backgroundColor: COLORS.background },
  attentionActive: { borderColor: COLORS.atencaoBorder, backgroundColor: COLORS.atencaoBg },
  criticalActive: { borderColor: COLORS.criticoBorder, backgroundColor: COLORS.criticoBg },
  severityHeading: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  radio: { width: 14, height: 14, borderWidth: 1, borderColor: COLORS.textMuted, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 6, height: 6, borderRadius: 3 },
  severityTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  severityDescription: { color: COLORS.textMuted, fontSize: 10, lineHeight: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  optional: { color: COLORS.textMuted, fontSize: 10 },
  submit: { minHeight: 52, backgroundColor: COLORS.primary, borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  submitText: { color: COLORS.onPrimary, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  disabled: { opacity: 0.65 },
  formFooter: { color: COLORS.textMuted, textAlign: 'center', fontSize: 10, lineHeight: 16, marginTop: -9 },
  notice: { padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorNotice: { backgroundColor: COLORS.criticoBg },
  successNotice: { backgroundColor: COLORS.normalBg },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 19 },
  listError: { color: COLORS.criticoText, fontSize: 12 },
  empty: { backgroundColor: COLORS.surface, padding: 24, borderRadius: 18, alignItems: 'center', gap: 12 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  reportCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, gap: 12 },
  resolvedCard: { borderColor: '#2A5043' },
  reportTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  time: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { color: COLORS.textMuted, fontSize: 10 },
  reportLocation: { color: COLORS.textPrimary, fontSize: 16, lineHeight: 23, fontWeight: '600' },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reportMetaText: { color: COLORS.textMuted, fontSize: 11, flex: 1, lineHeight: 17 },
  reportDescription: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 21 },
  reportActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 4 },
  resolveButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  resolveText: { color: COLORS.primary, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  deleteButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmation: { backgroundColor: COLORS.criticoBg, padding: 12, borderRadius: 12, gap: 8 },
  deleteQuestion: { color: COLORS.criticoText, fontSize: 12, lineHeight: 18 },
  confirmActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  cancelButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  cancelText: { color: COLORS.textSecondary, fontSize: 12 },
  confirmDeleteButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#562B35', borderRadius: 8 },
  confirmDeleteText: { color: COLORS.criticoText, fontSize: 12, fontWeight: '600' },
});
