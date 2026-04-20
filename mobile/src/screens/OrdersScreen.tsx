import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { getOrders } from '../services/api';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', shipped: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444',
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await getOrders(); setOrders(res.data?.orders || []); } catch {}
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: any) => {
    const color = STATUS_COLORS[item.status] || '#64748b';
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.orderId}>#{item.id}</Text>
          <View style={[s.badge, { backgroundColor: color + '22' }]}>
            <Text style={[s.badgeText, { color }]}>{item.status?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>
        <Text style={s.product} numberOfLines={1}>{item.product_title || item.title || 'Produkt'}</Text>
        <View style={s.footer}>
          <Text style={s.price}>€{item.total_amount?.toFixed(2) || '0.00'}</Text>
          <Text style={s.date}>{item.created_at ? new Date(item.created_at).toLocaleDateString('de-DE') : '—'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>📋 Bestellungen</Text>
      {orders.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Noch keine Bestellungen</Text>
          <Text style={s.emptyHint}>Bestellungen erscheinen hier sobald Kunden kaufen</Text>
        </View>
      ) : (
        <FlatList data={orders} keyExtractor={(i) => String(i.id)} renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          contentContainerStyle={{ paddingBottom: 20 }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', padding: 16 },
  card: { backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  product: { color: '#f1f5f9', fontSize: 14, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  price: { color: '#3b82f6', fontWeight: 'bold', fontSize: 15 },
  date: { color: '#64748b', fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: '#f1f5f9', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyHint: { color: '#64748b', textAlign: 'center', fontSize: 14 },
});
