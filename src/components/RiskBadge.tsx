import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react-native';
import { RiskLevel } from '../types';
import { getRiskStyle } from '../theme/colors';

interface RiskBadgeProps {
  level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const style = getRiskStyle(level);

  const renderIcon = () => {
    if (level === 'CRITICO') return <OctagonAlert size={16} color={style.text} />;
    if (level === 'ATENCAO') return <AlertTriangle size={16} color={style.text} />;
    return <CheckCircle2 size={16} color={style.text} />;
  };

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${style.label}`}
      style={[
        styles.badge,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}
    >
      {renderIcon()}
      <Text style={[styles.text, { color: style.text }]}>{style.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});