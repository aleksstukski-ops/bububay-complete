import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Clipboard } from 'react-native';
import { generateTitle } from '../services/api';

export default function TitleGeneratorScreen() {
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!product.trim()) return;
    setLoading(true);
    try {
      const res = await generateTitle(product, category);
      setResult(res.data);
    } catch {} finally { setLoading(false); }
  };

  const copy = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('✅', 'Kopiert!');
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>🤖 KI-Titel Generator</Text>

      <View style={s.field}>
        <Text style={s.label}>Produktname</Text>
        <TextInput style={s.input} value={product} onChangeText={setProduct}
          placeholder="z.B. Sony Kopfhörer Bluetooth" placeholderTextColor="#475569" />
      </View>
      <View style={s.field}>
        <Text style={s.label}>Kategorie (optional)</Text>
        <TextInput style={s.input} value={category} onChangeText={setCategory}
          placeholder="z.B. Elektronik" placeholderTextColor="#475569" />
      </View>

      <TouchableOpacity style={s.btn} onPress={generate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Titel generieren</Text>}
      </TouchableOpacity>

      {result && (
        <View style={s.resultBox}>
          <Text style={s.resultLabel}>Haupttitel</Text>
          <TouchableOpacity onPress={() => copy(result.title)} style={s.titleCard}>
            <Text style={s.titleText}>{result.title}</Text>
            <Text style={s.copyHint}>Tippen zum Kopieren</Text>
          </TouchableOpacity>

          <View style={s.scoreRow}>
            <Text style={s.scoreLabel}>SEO Score</Text>
            <Text style={[s.score, { color: result.seo_score > 70 ? '#22c55e' : '#f59e0b' }]}>{result.seo_score}/100</Text>
          </View>

          {result.variants?.length > 0 && (
            <>
              <Text style={[s.resultLabel, { marginTop: 16 }]}>Varianten</Text>
              {result.variants.map((v: string, i: number) => (
                <TouchableOpacity key={i} onPress={() => copy(v)} style={s.variantCard}>
                  <Text style={s.variantText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
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
  btn: { backgroundColor: '#8b5cf6', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 16, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultBox: { margin: 16 },
  resultLabel: { color: '#94a3b8', fontSize: 13, marginBottom: 8 },
  titleCard: { backgroundColor: '#1e293b', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#3b82f6' },
  titleText: { color: '#f1f5f9', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  copyHint: { color: '#3b82f6', fontSize: 11, marginTop: 6 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, backgroundColor: '#1e293b', borderRadius: 10, padding: 12 },
  scoreLabel: { color: '#94a3b8', fontSize: 14 },
  score: { fontSize: 18, fontWeight: 'bold' },
  variantCard: { backgroundColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 6 },
  variantText: { color: '#cbd5e1', fontSize: 13 },
});
