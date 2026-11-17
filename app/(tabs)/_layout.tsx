import React from 'react';
import { Tabs } from 'expo-router';
import { Radar, Radio, MessageSquarePlus, ShieldAlert } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/theme/colors';
import { AppHeader } from '../../src/components/AppHeader';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: { backgroundColor: COLORS.background },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 66 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          paddingHorizontal: Math.max(10, (width - 520) / 2),
          elevation: 0,
        },
        tabBarItemStyle: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 3 },
        tabBarActiveBackgroundColor: COLORS.normalBg,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Radar',
          tabBarIcon: ({ color }) => <Radar color={color} size={21} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="sensors"
        options={{
          title: 'Sensores',
          tabBarIcon: ({ color }) => <Radio color={color} size={21} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ color }) => (
            <MessageSquarePlus color={color} size={21} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarActiveTintColor: COLORS.criticoText,
          tabBarActiveBackgroundColor: COLORS.criticoBg,
          tabBarIcon: ({ color }) => <ShieldAlert color={color} size={21} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
