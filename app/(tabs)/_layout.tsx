import React from 'react';
import { Tabs } from 'expo-router';
import { CloudRain, Radio, MessageSquareWarning, ShieldAlert } from 'lucide-react-native';
import { COLORS } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        },
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: '800',
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Radar',
          headerTitle: 'Econ Vision • Radar Urbano',
          tabBarIcon: ({ color, size }) => <CloudRain color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sensors"
        options={{
          title: 'Sensores',
          headerTitle: 'Sensores IoT & Rotas',
          tabBarIcon: ({ color, size }) => <Radio color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Reportar',
          headerTitle: 'Alerta Colaborativo',
          tabBarIcon: ({ color, size }) => (
            <MessageSquareWarning color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          headerTitle: 'Emergência & Guia',
          tabBarActiveTintColor: '#F87171',
          tabBarIcon: ({ color, size }) => <ShieldAlert color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}