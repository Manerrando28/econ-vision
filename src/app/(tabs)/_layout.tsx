import React from 'react';
import { Tabs } from 'expo-router';
import { Radar, Radio, MessageSquarePlus, ShieldAlert } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/src/theme/colors';
import { LAYOUT, NAV_STYLES } from '@/src/theme/styles';
import { AppHeader } from '@/src/components/AppHeader';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, LAYOUT.tabPadding);

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        sceneStyle: NAV_STYLES.scene,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          ...NAV_STYLES.tab,
          height: LAYOUT.tabHeight + bottomPadding,
          paddingBottom: bottomPadding,
          paddingHorizontal: Math.max(LAYOUT.tabPadding, (width - LAYOUT.tabContentWidth) / 2),
        },
        tabBarItemStyle: NAV_STYLES.tabItem,
        tabBarActiveBackgroundColor: COLORS.normalBg,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: NAV_STYLES.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Radar',
          tabBarIcon: ({ color }) => <Radar color={color} size={LAYOUT.tabIcon} />,
        }}
      />
      <Tabs.Screen
        name="sensors"
        options={{
          title: 'Sensores',
          tabBarIcon: ({ color }) => <Radio color={color} size={LAYOUT.tabIcon} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Reportar',
          tabBarIcon: ({ color }) => (
            <MessageSquarePlus color={color} size={LAYOUT.tabIcon} />
          ),
        }}
      />
      <Tabs.Screen
        name="sos"
        options={{
          title: 'SOS',
          tabBarActiveTintColor: COLORS.criticoText,
          tabBarActiveBackgroundColor: COLORS.criticoBg,
          tabBarIcon: ({ color }) => <ShieldAlert color={color} size={LAYOUT.tabIcon} />,
        }}
      />
    </Tabs>
  );
}
