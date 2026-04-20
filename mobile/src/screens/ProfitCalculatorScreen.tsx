import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { calculateProfit } from '../services/api';

export default function ProfitCalculatorScreen() {
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [ship, setShip] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calc = async () => {
    if (!buy || !sell) return;
    setLoading(true);
    try {
      const res = await calculateProfit(parseFloat(buy), parseFloat(sell), parseFloat(ship || '0'));
      setResult(res.data);
    } catch {} finally { setLoading(false); }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>💰 Profit Calculator</Text>

      {[
        { label: 'Einkaufspreis (€)', value: buy, set: setBuy },
        { label: 'Verkaufspreis eBay (€)', value: sell, set: setSell },
        { label: 'Versandkosten (€)', value: ship, set: setShip },
      ].map((f) => (
        <View key={f.label} style={s.field}>
          <Text style={s.label}>{f.label}</Text>
          <TextInput style={s.input} value={f.value} onChangeText={f.set}
            keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#475569" />
        </View>
      ))}

      <TouchableOpacity style={s.btn} onPress={calc} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Berechnen</Text>}
      </TouchableOpacity>

      {result && (
        <View style={s.result}>
          {[
            { label: 'Nettogewinn', value: `€${result.net_profit?.toFixed(2)}`, color: result.net_profit > 0 ? '#22c55e' : '#ef4444' },
            { label: 'Marge', value: `${result.profit_margin_percent?.toFixed(1)}%`, color: '#3b82f6' },
            { label: 'eBay Gebühren', value: `€${result.ebay_final_value_fee?.toFixed(2)}`, color: '#f59e0b' },
            { label: 'Gesamtgebühren', value: `€${result.total_fees?.toFixed(2)}`, color: '#94a3b8' },
          ].map((r) => (
            <View key={r.label} style={s.resultRow}>
              <Text style={s.resultLabel}>{r.label}</Text>
              <Text style={[s.resultValue, { color: r.color }]}>{r.value}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', padding: 16, marginBottom: 8 },
  field: { paddingHorizontal: 16, marginBottom: 12 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#1e293b', color: '#f1f5f9', borderRadius: 10, padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#22c55e', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 16, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  result: { backgroundColor: '#1e293b', borderRadius: 12, margin: 16, padding: 16 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  resultLabel: { color: '#94a3b8', fontSize: 14 },
  resultValue: { fontSize: 16, fontWeight: 'bold' },
});
