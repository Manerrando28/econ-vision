import { RiskLevel } from '../types';

export const COLORS = {
  background: '#0A1218',
  surface: '#121F28',
  surfaceLight: '#192A34',
  primary: '#65E0BB',
  primaryDark: '#123B34',
  onPrimary: '#08261F',
  textPrimary: '#F0F6F8',
  textSecondary: '#B6C6D0',
  textMuted: '#91A7B5',
  border: '#263944',
  brandBorder: '#245247',
  safeBorder: '#285447',
  dangerBorder: '#60333D',
  dangerIcon: '#492831',
  weatherIcon: '#15312F',
  community: '#102B28',
  resolvedBorder: '#2A5043',
  dangerButton: '#562B35',

  normalBg: '#102F29',
  normalBorder: '#4DCEA7',
  normalText: '#83E7C4',

  atencaoBg: '#332B1B',
  atencaoBorder: '#E8B65A',
  atencaoText: '#F3CD83',

  criticoBg: '#341F26',
  criticoBorder: '#EF8491',
  criticoText: '#FFABB5',
};

export function getRiskStyle(level: RiskLevel) {
  switch (level) {
    case 'CRITICO':
      return {
        bg: COLORS.criticoBg,
        border: COLORS.criticoBorder,
        text: COLORS.criticoText,
        label: 'Crítico',
      };
    case 'ATENCAO':
      return {
        bg: COLORS.atencaoBg,
        border: COLORS.atencaoBorder,
        text: COLORS.atencaoText,
        label: 'Atenção',
      };
    default:
      return {
        bg: COLORS.normalBg,
        border: COLORS.normalBorder,
        text: COLORS.normalText,
        label: 'Normal',
      };
  }
}
