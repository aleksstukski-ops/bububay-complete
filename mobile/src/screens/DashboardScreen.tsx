import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../services/api';

const PLAN_COLORS: Record<string, string> = {
  free: '#64748b', starter: '#3b82f6', pro: '#8b5cf6', business: '#f59e0b'
};

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data?.orders || res.data || []);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const planColor = PLAN_COLORS[user?.plan || 'free'];

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Hallo, {user?.name || 'Chef'} 👋</Text>
          <View style={[s.planBadge, { backgroundColor: planColor + '22', borderColor: planColor }]}>
            <Text style={[s.planText, { color: planColor }]}>{(user?.plan || 'free').toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Abmelden</Text>
        </TouchableOpacity>
      </View>

      <View style={s.statsRow}>
        {[
          { label: 'Bestellungen', value: orders.length, icon: '📦' },
          { label: 'Plan', value: user?.plan || 'free', icon: '⚡' },
          { label: 'Status', value: 'Aktiv', icon: '✅' },
        ].map((item) => (
          <View key={item.label} style={s.statCard}>
            <Text style={s.statIcon}>{item.icon}</Text>
            <Text style={s.statValue}>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsGrid}>
        {[
          { label: '🔥 Highlights', screen: 'Highlights', color: '#ef4444' },
          { label: '🤖 KI-Titel', screen: 'TitleGenerator', color: '#8b5cf6' },
          { label: '💰 Profit Calc', screen: 'ProfitCalculator', color: '#22c55e' },
          { label: '📋 Orders', screen: 'Orders', color: '#f59e0b' },
        ].map((a) => (
          <TouchableOpacity key={a.screen} style={[s.actionCard, { borderColor: a.color + '44' }]}
            onPress={() => navigation.navigate(a.screen)}>
            <Text style={s.actionText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#f1f5f9' },
  planBadge: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, borderWidth: 1, alignSelf: 'flex-start' },
  planText: { fontSize: 11, fontWeight: 'bold' },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#ef4444', fontSize: 13 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 16, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#f1f5f9' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#f1f5f9', paddingHorizontal: 16, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, paddingBottom: 40 },
  actionCard: { width: '47%', backgroundColor: '#1e293b', borderRadius: 12, padding: 20, borderWidth: 1 },
  actionText: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
});
