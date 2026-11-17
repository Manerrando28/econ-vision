import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react-native';
import { RiskLevel } from '../types';
import { getRiskStyle } from '../theme/colors';
import { BADGE_STYLES as styles } from '../theme/styles';

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const style = getRiskStyle(level);
  const text = label ?? style.label;

  const renderIcon = () => {
    if (level === 'CRITICO') return <OctagonAlert size={13} color={style.text} />;
    if (level === 'ATENCAO') return <AlertTriangle size={13} color={style.text} />;
    return <CheckCircle2 size={13} color={style.text} />;
  };

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${text}`}
      style={[
        styles.badge,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}
    >
      {renderIcon()}
      <Text style={[styles.text, { color: style.text }]}>{text}</Text>
    </View>
  );
}
