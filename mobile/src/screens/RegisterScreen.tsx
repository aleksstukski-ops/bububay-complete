import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { register } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Fehler', 'Bitte alle Felder ausfüllen'); return; }
    if (password.length < 8) { Alert.alert('Fehler', 'Passwort min. 8 Zeichen'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      Alert.alert('Registriert!', 'Bitte verifiziere deine E-Mail.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
    } catch (e: any) {
      Alert.alert('Fehler', e.response?.data?.detail || 'Registrierung fehlgeschlagen');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.inner}>
        <Text style={s.logo}>🐻</Text>
        <Text style={s.title}>Konto erstellen</Text>
        <Text style={s.subtitle}>Kostenlos starten</Text>
        <TextInput style={s.input} placeholder="Name" placeholderTextColor="#94a3b8" value={name} onChangeText={setName} />
        <TextInput style={s.input} placeholder="E-Mail" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={s.input} placeholder="Passwort" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Registrieren</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.link}>Bereits registriert? <Text style={s.linkBold}>Anmelden</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f1f5f9', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1e293b', color: '#f1f5f9', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 16, borderWidth: 1, borderColor: '#334155' },
  btn: { backgroundColor: '#3b82f6', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#94a3b8', textAlign: 'center', marginTop: 24, fontSize: 14 },
  linkBold: { color: '#3b82f6', fontWeight: 'bold' },
});
