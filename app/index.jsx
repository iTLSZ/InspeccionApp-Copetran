// app/index.jsx
// Pantalla principal rediseñada — Header premium con gradiente, cards modernas

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform, Alert, Image, Animated, Easing
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ReporteCard } from '../components/ReporteCard';
import { getRows } from '../services/googleSheets';
import { useSync } from '../hooks/useSync';
import { NOMBRE_EMPRESA } from './config';

export default function Inicio() {
  const router = useRouter();
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const { pendientes, sincronizando, conectado, sincronizar } = useSync();
  const spinValue = React.useRef(new Animated.Value(0)).current;
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const headerOpacity = React.useRef(new Animated.Value(0)).current;
  const headerSlide = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNuevoReporte = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start(() => router.push('/nuevo-reporte'));
  };

  const cargarReportes = useCallback(async () => {
    try {
      const datos = await getRows(20);
      setReportes(datos);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarReportes();
      const intervalo = setInterval(cargarReportes, 12000);
      return () => clearInterval(intervalo);
    }, [cargarReportes])
  );

  const onRefresh = () => {
    setRefrescando(true);
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: false })
    ).start();
    cargarReportes().finally(() => spinValue.stopAnimation());
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleSincronizar = async () => {
    const result = await sincronizar();
    if (result) {
      Alert.alert('Sincronización', `✅ ${result.exitosos} reportes sincronizados${result.fallidos ? `\n⚠ ${result.fallidos} fallidos` : ''}`);
      cargarReportes();
    }
  };

  return (
    <View style={estilos.contenedor}>

      {/* ── HEADER ───────────────────────────────────── */}
      <View style={estilos.header}>
        {/* Decoración geométrica */}
        <View style={estilos.headerCirculo1} />
        <View style={estilos.headerCirculo2} />

        <Animated.View style={[estilos.headerInner, {
          opacity: headerOpacity,
          transform: [{ translateY: headerSlide }]
        }]}>
          {/* Logo + info */}
          <View style={estilos.logoFila}>
            <View style={estilos.logoWrapper}>
              <Image source={require('../public/logoouser.png')} style={estilos.logo} resizeMode="contain" />
            </View>
            <View style={estilos.headerTextos}>
              <Text style={estilos.headerEmpresa} numberOfLines={1}>{NOMBRE_EMPRESA}</Text>
              <Text style={estilos.headerSub}>Sistema de Inspección</Text>
            </View>
            {/* Status pill */}
            <View style={[estilos.statusPill, conectado ? estilos.statusOnline : estilos.statusOffline]}>
              <View style={[estilos.statusDot, { backgroundColor: conectado ? '#4ADE80' : '#F87171' }]} />
              <Text style={estilos.statusTexto}>{conectado ? 'Online' : 'Offline'}</Text>
            </View>
          </View>



        </Animated.View>
      </View>

      {/* ── SECCIÓN HISTORIAL ────────────────────────── */}
      <View style={estilos.seccionHeader}>
        <View>
          <Text style={estilos.seccionTitulo}>Últimos reportes</Text>
          <Text style={estilos.seccionSub}>Toca una tarjeta para ver la foto</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={estilos.btnRefresh}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialIcons name="refresh" size={18} color="#6366F1" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ── LISTA ────────────────────────────────────── */}
      {cargando && reportes.length === 0 ? (
        <View style={estilos.cargando}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={estilos.cargandoTexto}>Cargando reportes...</Text>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReporteCard reporte={item} />}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor="#6366F1" />}
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <Text style={estilos.vacioIcono}>📋</Text>
              <Text style={estilos.vacioTexto}>Sin reportes aún</Text>
              <Text style={estilos.vacioSub}>Crea el primero tocando el botón</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── FAB ──────────────────────────────────────── */}
      <Animated.View style={[estilos.fabWrapper, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity style={estilos.fab} onPress={handleNuevoReporte} activeOpacity={0.85}>
          <View style={estilos.fabIconCaja}>
            <Text style={estilos.fabIcono}>+</Text>
          </View>
          <Text style={estilos.fabTexto}>Nuevo Reporte</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Header ──
  header: {
    backgroundColor: '#4338CA',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerCirculo1: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60, right: -40,
  },
  headerCirculo2: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)',
    top: 20, right: 80,
  },
  headerInner: { gap: 16 },
  logoFila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrapper: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logo: { width: 40, height: 40 },
  headerTextos: { flex: 1 },
  headerEmpresa: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  statusOnline: { backgroundColor: 'rgba(74,222,128,0.15)' },
  statusOffline: { backgroundColor: 'rgba(248,113,113,0.15)' },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusTexto: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statCaja: { flex: 1, alignItems: 'center' },
  statNum: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  // Sync
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(251,191,36,0.25)',
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(251,191,36,0.4)',
    alignSelf: 'flex-start',
  },
  syncBtnTexto: { color: '#FEF3C7', fontSize: 12, fontWeight: '700' },

  // ── Sección ──
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  seccionTitulo: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  seccionSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  btnRefresh: {
    backgroundColor: '#EEF2FF', borderRadius: 10,
    padding: 8, borderWidth: 1, borderColor: '#C7D2FE',
  },

  // ── Lista ──
  lista: { paddingHorizontal: 16, paddingBottom: 110 },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  cargandoTexto: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  vacio: { alignItems: 'center', paddingTop: 80, gap: 10 },
  vacioIcono: { fontSize: 56 },
  vacioTexto: { fontSize: 18, fontWeight: '800', color: '#334155' },
  vacioSub: { fontSize: 14, color: '#94A3B8' },

  // ── FAB ──
  fabWrapper: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    shadowColor: '#4338CA', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  fab: {
    backgroundColor: '#4338CA',
    borderRadius: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  fabIconCaja: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  fabIcono: { color: '#FFF', fontSize: 20, fontWeight: '300', lineHeight: 24 },
  fabTexto: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
