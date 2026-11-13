import { RiskLevel } from '../types';

export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  primary: '#38BDF8',
  primaryDark: '#0284C7',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#334155',

  normalBg: '#064E3B',
  normalBorder: '#10B981',
  normalText: '#6EE7B7',

  atencaoBg: '#78350F',
  atencaoBorder: '#F59E0B',
  atencaoText: '#FCD34D',

  criticoBg: '#7F1D1D',
  criticoBorder: '#EF4444',
  criticoText: '#FCA5A5',
};

export function getRiskStyle(level: RiskLevel) {
  switch (level) {
    case 'CRITICO':
      return {
        bg: COLORS.criticoBg,
        border: COLORS.criticoBorder,
        text: COLORS.criticoText,
        label: 'ALAGAMENTO CRÍTICO',
      };
    case 'ATENCAO':
      return {
        bg: COLORS.atencaoBg,
        border: COLORS.atencaoBorder,
        text: COLORS.atencaoText,
        label: 'ATENÇÃO / RISCO',
      };
    default:
      return {
        bg: COLORS.normalBg,
        border: COLORS.normalBorder,
        text: COLORS.normalText,
        label: 'NÍVEL NORMAL',
      };
  }
}