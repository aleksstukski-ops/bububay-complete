import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';
import HighlightsScreen from '../screens/HighlightsScreen';
import ProfitCalculatorScreen from '../screens/ProfitCalculatorScreen';
import TitleGeneratorScreen from '../screens/TitleGeneratorScreen';
import OrdersScreen from '../screens/OrdersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Highlights" component={HighlightsScreen} />
      <Stack.Screen name="ProfitCalculator" component={ProfitCalculatorScreen} />
      <Stack.Screen name="TitleGenerator" component={TitleGeneratorScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tab.Screen name="Home" component={DashboardStack}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tab.Screen name="HighlightsTab" component={HighlightsScreen}
        options={{ tabBarLabel: 'Highlights', tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} /> }} />
      <Tab.Screen name="ProfitTab" component={ProfitCalculatorScreen}
        options={{ tabBarLabel: 'Profit', tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} /> }} />
      <Tab.Screen name="TitleTab" component={TitleGeneratorScreen}
        options={{ tabBarLabel: 'KI-Titel', tabBarIcon: ({ focused }) => <TabIcon emoji="🤖" focused={focused} /> }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen}
        options={{ tabBarLabel: 'Orders', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} /> }} />
    </Tab.Navigator>
  );
}
