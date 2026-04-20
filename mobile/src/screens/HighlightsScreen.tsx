import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { getHighlights } from '../services/api';

export default function HighlightsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getHighlights(30);
      setItems(res.data?.items || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const renderItem = ({ item }: any) => (
    <View style={s.card}>
      {item.image_url
        ? <Image source={{ uri: item.image_url }} style={s.img} />
        : <View style={[s.img, s.imgPlaceholder]}><Text style={{ fontSize: 32 }}>📦</Text></View>}
      <View style={s.info}>
        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
        <View style={s.priceRow}>
          <Text style={s.price}>€{item.sell_price?.toFixed(2)}</Text>
          <View style={[s.badge, { backgroundColor: item.margin_percent > 30 ? '#22c55e22' : '#f59e0b22' }]}>
            <Text style={[s.badgeText, { color: item.margin_percent > 30 ? '#22c55e' : '#f59e0b' }]}>
              {item.margin_percent?.toFixed(0)}% Marge
            </Text>
          </View>
        </View>
        <Text style={s.buy}>EK: €{item.buy_price?.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>🔥 Trending Products</Text>
      <FlatList data={items} keyExtractor={(i) => String(i.id)} renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        contentContainerStyle={{ paddingBottom: 20 }} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  img: { width: 90, height: 90 },
  imgPlaceholder: { backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, padding: 12 },
  name: { color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { color: '#3b82f6', fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  buy: { color: '#64748b', fontSize: 12, marginTop: 4 },
});
