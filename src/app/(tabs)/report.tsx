import { useRef, useState } from 'react';
import {
  ActivityIndicator, Text, TextInput, TouchableOpacity, View, type TextInputInstance,
} from 'react-native';
import {
  ArrowRight, Check, CheckCircle2, Clock3, CloudRain, HardDrive,
  MapPin, Mountain, Plus, RotateCcw, Trash2, Waves,
} from 'lucide-react-native';
import { PageIntro, Screen, SectionHeading } from '@/src/components/Screen';
import { RiskBadge } from '@/src/components/RiskBadge';
import { LoadError } from '@/src/components/LoadError';
import { COLORS } from '@/src/theme/colors';
import { REPORT_STYLES as styles } from '@/src/theme/styles';
import { addReport, deleteReport, getReports, toggleReportResolved } from '@/src/storage/reportsDb';
import { useAsyncResource } from '@/src/hooks/useAsyncResource';
import type { CitizenReport, RiskLevel } from '@/src/types';

const CATEGORIES = [
  { key: 'ALAGAMENTO', label: 'Alagamento', fullLabel: 'Rua alagada', icon: CloudRain },
  { key: 'BUEIRO_ENTUPIDO', label: 'Bueiro', fullLabel: 'Bueiro entupido', icon: Waves },
  { key: 'RISCO_DESLIZAMENTO', label: 'Encosta', fullLabel: 'Risco de deslizamento', icon: Mountain },
] as const;
type Notice = { tone: 'error' | 'success'; message: string };

export default function ReportScreen() {
  const reportsResource = useAsyncResource(getReports);
  const reports = reportsResource.data ?? [];
  const setReports = reportsResource.setData;
  const loading = reportsResource.loading;
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
      {reportsResource.error && <LoadError message="Não foi possível abrir o banco de dados local. Seus registros não foram apagados." onRetry={() => void reportsResource.reload()} />}

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
          style={[styles.submit, (saving || loading || reportsResource.error) && styles.disabled]}
          onPress={handleSave}
          disabled={saving || loading || reportsResource.error}
          accessibilityRole="button"
          accessibilityLabel="Salvar ocorrência neste dispositivo"
          accessibilityState={{ disabled: saving || loading || reportsResource.error, busy: saving }}
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
      {!loading && !reportsResource.error && reports.length === 0 && (
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
