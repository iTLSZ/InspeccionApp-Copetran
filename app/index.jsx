// app/index.jsx
// Pantalla principal — Header centrado, badge auto-refresh, cards premium

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [nuevoDisponible, setNuevoDisponible] = useState(false);
  const contadorRef = useRef(null);
  const { pendientes, sincronizando, conectado, sincronizar } = useSync();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    // Lógica para capturar prompt de instalación PWA en navegadores compatibles
    if (Platform.OS === 'web') {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  useEffect(() => {
    if (nuevoDisponible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(badgePulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      badgePulse.stopAnimation();
      badgePulse.setValue(1);
    }
  }, [nuevoDisponible]);

  const handleNuevoReporte = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.94, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start(() => router.push('/nuevo-reporte'));
  };

  const cargarReportes = useCallback(async (silencioso = false) => {
    try {
      const datos = await getRows(20);
      const total = datos.length;
      if (silencioso && contadorRef.current !== null && total > contadorRef.current) {
        setNuevoDisponible(true);
      } else {
        setReportes(datos);
        contadorRef.current = total;
        setNuevoDisponible(false);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  const cargarNuevos = useCallback(() => {
    setNuevoDisponible(false);
    setRefrescando(true);
    cargarReportes(false);
  }, [cargarReportes]);

  useFocusEffect(
    useCallback(() => {
      cargarReportes(false);
      const intervalo = setInterval(() => cargarReportes(true), 12000);
      return () => clearInterval(intervalo);
    }, [cargarReportes])
  );

  const onRefresh = () => {
    setRefrescando(true);
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: false })
    ).start();
    cargarReportes(false).finally(() => spinValue.stopAnimation());
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleSincronizar = async () => {
    const result = await sincronizar();
    if (result) {
      Alert.alert('Sincronización', `✅ ${result.exitosos} reportes sincronizados`);
      cargarReportes(false);
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <View style={estilos.contenedor}>

      {/* ── HEADER CENTRADO ─────────────────────────── */}
      <View style={estilos.header}>
        <View style={estilos.headerCirculo1} />
        <View style={estilos.headerCirculo2} />

        <Animated.View style={[estilos.headerInner, {
          opacity: headerOpacity,
          transform: [{ translateY: headerSlide }]
        }]}>
          <View style={estilos.logoFila}>
            <View style={estilos.logoWrapper}>
              <Image source={require('../public/logoouser.png')} style={estilos.logo} resizeMode="contain" />
            </View>
            <View style={estilos.headerTextos}>
              <Text style={estilos.headerEmpresa} numberOfLines={1}>{NOMBRE_EMPRESA}</Text>
              <Text style={estilos.headerSub}>Sistema de Inspección</Text>
            </View>
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
        <TouchableOpacity onPress={onRefresh} style={estilos.btnRefresh} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialIcons name="refresh" size={16} color="#4338CA" />
          </Animated.View>
          <Text style={estilos.btnRefreshTexto}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Instalar App PWA */}
      {deferredPrompt && (
        <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <TouchableOpacity style={estilos.btnInstalarPWA} onPress={handleInstallPWA} activeOpacity={0.85}>
            <Text style={{ fontSize: 16 }}>📲</Text>
            <Text style={estilos.btnInstalarTexto}>Instalar aplicación en el dispositivo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de actualizar (nuevos registros) */}
      {nuevoDisponible && (
        <Animated.View style={{ transform: [{ scale: badgePulse }], marginHorizontal: 16, marginBottom: 8 }}>
          <TouchableOpacity style={estilos.nuevoBadge} onPress={cargarNuevos} activeOpacity={0.85}>
            <MaterialIcons name="sync" size={18} color="#FFF" />
            <Text style={estilos.nuevoBadgeTexto}>Actualizar — Hay nuevos registros</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

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

  // ── Header horizontal ──
  header: {
    backgroundColor: '#4338CA',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerCirculo1: {
    position: 'absolute', width: 200, height: 200,
    borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -40,
  },
  headerCirculo2: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)', top: 20, right: 80,
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

  // ── Sección ──
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  seccionTitulo: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  seccionSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  btnRefresh: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 14,
    paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  btnRefreshTexto: { fontSize: 12, fontWeight: '800', color: '#4338CA' },

  btnInstalarPWA: {
    backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  btnInstalarTexto: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  // Badge nuevo reporte
  nuevoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6366F1', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 16,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  nuevoBadgeTexto: { color: '#FFF', fontSize: 13, fontWeight: '800', flex: 1 },

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
    borderRadius: 18,
  },
  fab: {
    backgroundColor: '#4338CA', borderRadius: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
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
