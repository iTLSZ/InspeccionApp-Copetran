// app/nuevo-reporte.jsx
// Formulario rediseñado — diseño premium oscuro/moderno

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Alert, ActivityIndicator, Platform, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { FormField } from '../components/FormField';
import { PoblacionPicker } from '../components/PoblacionPicker';
import { ComponentePicker } from '../components/ComponentePicker';
import { PhotoPicker } from '../components/PhotoPicker';
import { useForm } from '../hooks/useForm';
import { appendRow } from '../services/googleSheets';
import { saveLocal } from '../services/offline';
import NetInfo from '@react-native-community/netinfo';

export default function NuevoReporte({ onGuardado }) {
  const router = useRouter();
  const { campos, errores, enviando, setEnviando, setcampo, validar, resetear } = useForm();
  const [confirmado, setConfirmado] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    resetear();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleEnviar = async () => {
    if (enviando || confirmado) return;
    if (!validar()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos marcados con *');
      return;
    }

    setEnviando(true);
    try {
      let hayConexion = false;
      if (Platform.OS === 'web') {
        hayConexion = navigator.onLine;
      } else {
        const netState = await NetInfo.fetch();
        hayConexion = netState.isConnected && netState.isInternetReachable !== false;
      }

      const reporte = {
        fecha: campos.fecha,
        hora: campos.hora,
        poblacion: campos.poblacion,
        numeroBuseta: campos.numeroBuseta,
        placa: campos.placa,
        linkFoto: '',
        componente: campos.componente,
        descripcion: campos.descripcion,
        preliminar: campos.preliminar,
        responsable: campos.responsable,
        observaciones: campos.observaciones,
        _fotoUri: campos.fotoUri,
      };

      if (hayConexion) {
        appendRow(reporte).catch(async (err) => {
          console.error('Error silencioso, guardando local', err.message);
          await saveLocal(reporte);
        });

        setConfirmado(true);
        setTimeout(() => {
          setConfirmado(false);
          resetear();
          if (onGuardado) onGuardado();
          router.back();
        }, 600);
      } else {
        await saveLocal(reporte);
        Alert.alert(
          '📱 Guardado sin conexión',
          'Guardado localmente. Se sincronizará al recuperar internet.',
          [{ text: 'Entendido', onPress: () => { resetear(); onGuardado?.(); } }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `${error.message}. ¿Guardar localmente?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Guardar local', onPress: async () => { await saveLocal({ ...campos }); resetear(); onGuardado?.(); } },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Animated.View style={[estilos.contenedor, { opacity: fadeAnim }]}>

      {/* ── HEADER ── */}
      <View style={estilos.header}>
        <View style={estilos.headerCircle} />
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVolver}>
          <Text style={estilos.btnVolverTexto}>←</Text>
        </TouchableOpacity>
        <View style={estilos.headerCenter}>
          <Text style={estilos.headerTitulo}>Nuevo Reporte</Text>
          <Text style={estilos.headerSub}>Completa la información del daño</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── VEHÍCULO ── */}
        <View style={estilos.seccionCard}>
          <View style={estilos.seccionHeader}>
            <View style={[estilos.seccionIcono, { backgroundColor: '#EEF2FF' }]}>
              <Text style={estilos.seccionIconoTexto}>🚌</Text>
            </View>
            <Text style={estilos.seccionTitulo}>Vehículo</Text>
          </View>

          <View style={estilos.fila2col}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormField label="Fecha" valor={campos.fecha} onChange={(v) => setcampo('fecha', v)}
                error={errores.fecha} obligatorio editable={false} placeholder="DD/MM/AAAA" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <FormField label="Hora" valor={campos.hora} onChange={(v) => setcampo('hora', v)}
                error={errores.hora} obligatorio editable={false} placeholder="HH:MM" />
            </View>
          </View>

          <PoblacionPicker valor={campos.poblacion} onChange={(v) => setcampo('poblacion', v)} />

          <View style={estilos.fila2col}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormField label="N° Buseta" valor={campos.numeroBuseta}
                onChange={(v) => setcampo('numeroBuseta', v.replace(/\D/g, ''))}
                keyboardType="numeric" placeholder="001" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <FormField label="Placa" valor={campos.placa}
                onChange={(v) => setcampo('placa', v.toUpperCase())}
                error={errores.placa} obligatorio autoCapitalize="characters" placeholder="ABC123" />
            </View>
          </View>
        </View>

        {/* ── FOTO ── */}
        <View style={estilos.seccionCard}>
          <View style={estilos.seccionHeader}>
            <View style={[estilos.seccionIcono, { backgroundColor: '#FFF7ED' }]}>
              <Text style={estilos.seccionIconoTexto}>📷</Text>
            </View>
            <Text style={estilos.seccionTitulo}>Evidencia</Text>
          </View>
          <PhotoPicker uri={campos.fotoUri} onChange={(v) => setcampo('fotoUri', v)} error={errores.fotoUri} />
        </View>

        {/* ── HALLAZGO ── */}
        <View style={estilos.seccionCard}>
          <View style={estilos.seccionHeader}>
            <View style={[estilos.seccionIcono, { backgroundColor: '#FFF1F2' }]}>
              <Text style={estilos.seccionIconoTexto}>🔧</Text>
            </View>
            <Text style={estilos.seccionTitulo}>Hallazgo</Text>
          </View>

          <ComponentePicker valor={campos.componente} onChange={(v) => setcampo('componente', v)} error={errores.componente} />

          <FormField label="Descripción" valor={campos.descripcion}
            onChange={(v) => setcampo('descripcion', v)} error={errores.descripcion}
            multiline numberOfLines={4} obligatorio placeholder="Describe detalladamente el daño..." />

          {/* Preliminar switch */}
          <View style={estilos.switchFila}>
            <View style={estilos.switchInfo}>
              <Text style={estilos.switchLabel}>⚡ Reporte preliminar</Text>
              <Text style={estilos.switchSub}>Requiere confirmación posterior</Text>
            </View>
            <Switch value={campos.preliminar} onValueChange={(v) => setcampo('preliminar', v)}
              trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }}
              thumbColor={campos.preliminar ? '#6366F1' : '#CBD5E1'} />
          </View>
        </View>

        {/* ── RESPONSABLE ── */}
        <View style={estilos.seccionCard}>
          <View style={estilos.seccionHeader}>
            <View style={[estilos.seccionIcono, { backgroundColor: '#F0FDF4' }]}>
              <Text style={estilos.seccionIconoTexto}>👤</Text>
            </View>
            <Text style={estilos.seccionTitulo}>Responsable</Text>
          </View>

          <FormField label="Conductor / Responsable" valor={campos.responsable}
            onChange={(v) => setcampo('responsable', v)} error={errores.responsable}
            obligatorio placeholder="Nombre completo" autoCapitalize="words" />

          <FormField label="Observaciones" valor={campos.observaciones}
            onChange={(v) => setcampo('observaciones', v)}
            multiline numberOfLines={3} placeholder="Notas adicionales (opcional)..." />
        </View>

        {/* ── BOTONES ── */}
        <TouchableOpacity
          style={[estilos.btnEnviar, enviando && estilos.btnEnviando]}
          onPress={handleEnviar} disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={estilos.btnEnviarIcono}>✓</Text>
              <Text style={estilos.btnEnviarTexto}>Guardar Reporte</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={estilos.btnLimpiar} onPress={resetear}>
          <Text style={estilos.btnLimpiarTexto}>Limpiar formulario</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* ── OVERLAY CONFIRMACIÓN ── */}
      {confirmado && (
        <View style={estilos.overlay}>
          <View style={estilos.overlayCaja}>
            <View style={estilos.overlayCirculo}>
              <Text style={estilos.overlayIcono}>✓</Text>
            </View>
            <Text style={estilos.overlayTitulo}>¡Guardado!</Text>
            <Text style={estilos.overlaySub}>Reporte enviado con éxito</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    backgroundColor: '#4338CA',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingBottom: 18, paddingHorizontal: 16,
    overflow: 'hidden',
  },
  headerCircle: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30,
  },
  btnVolver: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnVolverTexto: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitulo: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Sección card
  seccionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  seccionIcono: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  seccionIconoTexto: { fontSize: 16 },
  seccionTitulo: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

  fila2col: { flexDirection: 'row' },

  // Switch
  switchFila: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0', marginTop: 4,
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  switchSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  // Botones
  btnEnviar: {
    backgroundColor: '#4338CA', borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    marginTop: 4,
  },
  btnEnviando: { opacity: 0.75 },
  btnEnviarIcono: {
    color: '#FFF', fontSize: 18, fontWeight: '900',
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center', lineHeight: 24,
  },
  btnEnviarTexto: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  btnLimpiar: { alignItems: 'center', paddingVertical: 12 },
  btnLimpiarTexto: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },

  // Overlay confirmación
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  overlayCaja: {
    backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 36, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 20,
  },
  overlayCirculo: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#4338CA', alignItems: 'center', justifyContent: 'center',
  },
  overlayIcono: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  overlayTitulo: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  overlaySub: { fontSize: 14, color: '#64748B' },
});
