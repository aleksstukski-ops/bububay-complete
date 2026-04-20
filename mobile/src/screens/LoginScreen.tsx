import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Fehler', 'Bitte alle Felder ausfüllen'); return; }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e: any) {
      Alert.alert('Fehler', e.response?.data?.detail || 'Login fehlgeschlagen');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>
        <Text style={s.logo}>🐻</Text>
        <Text style={s.title}>BubuBay</Text>
        <Text style={s.subtitle}>eBay Dropshipping Tool</Text>

        <TextInput style={s.input} placeholder="E-Mail" placeholderTextColor="#94a3b8"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Passwort" placeholderTextColor="#94a3b8"
          value={password} onChangeText={setPassword} secureTextEntry />

        <Pressable style={({ pressed }) => [s.btn, { opacity: pressed || loading ? 0.7 : 1 }]}
          onPress={handleLogin} disabled={loading} accessibilityRole="button">
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Anmelden</Text>}
        </Pressable>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>Noch kein Konto? <Text style={s.linkBold}>Registrieren</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f1f5f9', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1e293b', color: '#f1f5f9', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#3b82f6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#94a3b8', textAlign: 'center', marginTop: 24, fontSize: 14 },
  linkBold: { color: '#3b82f6', fontWeight: 'bold' },
});
