// app/index.jsx
// Pantalla principal — diseño premium oscuro completo

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform, Alert, Image,
  Animated, Easing, Dimensions, PixelRatio, StatusBar
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReporteCard } from '../components/ReporteCard';
import { getRows } from '../services/googleSheets';
import { useSync } from '../hooks/useSync';
import { NOMBRE_EMPRESA } from './config';

const { width } = Dimensions.get('window');
const BASE_WIDTH = 360;
const scale = (size) => Math.round((width / BASE_WIDTH) * size);
const fs    = (size) => Math.round(PixelRatio.roundToNearestPixel((width / BASE_WIDTH) * size));
const STATUS_H = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reportes, setReportes]           = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [refrescando, setRefrescando]     = useState(false);
  const [nuevoDisponible, setNuevoDisponible] = useState(false);
  const contadorRef = useRef(null);
  const { pendientes, sincronizando, conectado, sincronizar } = useSync();
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const spinValue   = useRef(new Animated.Value(0)).current;
  const scaleValue  = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide   = useRef(new Animated.Value(-20)).current;
  const badgePulse    = useRef(new Animated.Value(1)).current;
  const glowAnim      = useRef(new Animated.Value(0)).current;
  const fabScale      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(headerSlide,   { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.spring(fabScale,      { toValue: 1, friction: 6, tension: 50, delay: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    if (Platform.OS === 'web') {
      const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  useEffect(() => {
    if (nuevoDisponible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, { toValue: 1.04, duration: 600, useNativeDriver: true }),
          Animated.timing(badgePulse, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      badgePulse.stopAnimation();
      badgePulse.setValue(1);
    }
  }, [nuevoDisponible]);

  const handleNuevoReporte = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 0.92, duration: 100, useNativeDriver: true }),
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

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    spinValue.setValue(0);
    const anim = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })
    );
    anim.start();
    cargarReportes(false).finally(() => anim.stop());
  }, [cargarReportes]);

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  return (
    <View style={estilos.contenedor}>

      {/* ── GLOWS DE FONDO ── */}
      <Animated.View style={[estilos.bgGlow1, { opacity: glowAnim }]} />
      <Animated.View style={[estilos.bgGlow2, {
        opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.15] })
      }]} />

      {/* ── HEADER ── */}
      <Animated.View style={[estilos.headerContainer, {
        opacity: headerOpacity,
        transform: [{ translateY: headerSlide }],
      }]}>
        <View style={estilos.headerCard}>
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
        </View>
      </Animated.View>

      {/* ── FILA TÍTULO + REFRESH ── */}
      <View style={estilos.seccionHeader}>
        <View>
          <Text style={estilos.seccionTitulo}>Últimos reportes</Text>
          <Text style={estilos.seccionSub}>Monitorea la flota en tiempo real</Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          style={estilos.btnRefresh}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Text style={{ fontSize: 20, color: '#A78BFA' }}>🔄</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Botón instalar PWA */}
      {deferredPrompt && (
        <View style={{ marginHorizontal: 16, marginBottom: 10 }}>
          <TouchableOpacity style={estilos.btnInstalarPWA} onPress={handleInstallPWA} activeOpacity={0.85}>
            <Text style={{ fontSize: 18 }}>📲</Text>
            <Text style={estilos.btnInstalarTexto}>Instalar App en el dispositivo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Badge nuevos registros */}
      {nuevoDisponible && (
        <Animated.View style={[estilos.badgeWrapper, { transform: [{ scale: badgePulse }] }]}>
          <TouchableOpacity style={estilos.nuevoBadge} onPress={cargarNuevos} activeOpacity={0.85}>
            <Text style={{ fontSize: 14, color: '#FFF' }}>🔄</Text>
            <Text style={estilos.nuevoBadgeTexto}>Nuevos registros — toca para actualizar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── LISTA ── */}
      {cargando && reportes.length === 0 ? (
        <View style={estilos.cargando}>
          <ActivityIndicator size="large" color="#818CF8" />
          <Text style={estilos.cargandoTexto}>Sincronizando reportes...</Text>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReporteCard
              reporte={item}
              onActualizado={() => cargarReportes(false)}
            />
          )}
          contentContainerStyle={estilos.lista}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              tintColor="#818CF8"
              colors={['#818CF8']}
            />
          }
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <View style={estilos.vacioIconWrapper}>
                <Text style={estilos.vacioIcono}>📋</Text>
              </View>
              <Text style={estilos.vacioTexto}>Sin reportes aún</Text>
              <Text style={estilos.vacioSub}>Crea el primer reporte tocando el botón inferior</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── FAB NUEVO REPORTE ── */}
      <Animated.View style={[estilos.fabWrapper, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity style={estilos.fab} onPress={handleNuevoReporte} activeOpacity={0.88}>
          <Animated.View style={{ transform: [{ scale: scaleValue }], flexDirection: 'row', alignItems: 'center', gap: scale(10) }}>
            <View style={estilos.fabIconCaja}>
              <Text style={{ fontSize: 20, color: '#FFF' }}>➕</Text>
            </View>
            <Text style={estilos.fabTexto}>Nuevo Reporte</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#09090B' },

  // Glows
  bgGlow1: {
    position: 'absolute', top: scale(-60), left: scale(-60),
    width: width * 0.8, height: width * 0.8,
    borderRadius: 999, backgroundColor: '#4C1D95',
    opacity: 0.2,
  },
  bgGlow2: {
    position: 'absolute', top: scale(80), right: scale(-80),
    width: width * 0.7, height: width * 0.7,
    borderRadius: 999, backgroundColor: '#0F766E',
    opacity: 0.15,
  },

  // Header
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? scale(54) : STATUS_H + scale(10),
    paddingHorizontal: scale(16),
    paddingBottom: scale(8),
    zIndex: 10,
  },
  headerCard: {
    backgroundColor: 'rgba(24,24,27,0.8)',
    borderRadius: scale(20),
    padding: scale(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logoFila:    { flexDirection: 'row', alignItems: 'center', gap: scale(12) },
  logoWrapper: {
    width: scale(44), height: scale(44), borderRadius: scale(13),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  logo:          { width: scale(32), height: scale(32) },
  headerTextos:  { flex: 1 },
  headerEmpresa: { color: '#FAFAFA', fontSize: fs(15), fontWeight: '800', letterSpacing: 0.4 },
  headerSub:     { color: '#71717A', fontSize: fs(11), marginTop: 2, fontWeight: '500' },

  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: scale(5),
    borderRadius: scale(18), paddingHorizontal: scale(9), paddingVertical: scale(5),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statusOnline:  { backgroundColor: 'rgba(74,222,128,0.12)' },
  statusOffline: { backgroundColor: 'rgba(248,113,113,0.12)' },
  statusDot:     { width: scale(7), height: scale(7), borderRadius: scale(4) },
  statusTexto:   { color: '#E4E4E7', fontSize: fs(11), fontWeight: '700' },

  // Sección header
  seccionHeader: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: scale(18), paddingTop: scale(14), paddingBottom: scale(10),
  },
  seccionTitulo: { fontSize: fs(19), fontWeight: '900', color: '#FAFAFA', letterSpacing: 0.3 },
  seccionSub:    { fontSize: fs(12), color: '#52525B', marginTop: 3 },
  btnRefresh: {
    backgroundColor: 'rgba(167,139,250,0.1)',
    borderRadius: scale(12),
    padding: scale(10),
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)',
  },

  // Banner instalar PWA
  btnInstalarPWA: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: scale(14),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(10),
    paddingVertical: scale(12), paddingHorizontal: scale(14),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  btnInstalarTexto: { color: '#E4E4E7', fontWeight: '800', fontSize: fs(14) },

  // Badge nuevos
  badgeWrapper: { marginHorizontal: scale(16), marginBottom: scale(10) },
  nuevoBadge: {
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderRadius: scale(14), borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(8),
    paddingVertical: scale(11), paddingHorizontal: scale(14),
  },
  nuevoBadgeTexto: { color: '#C7D2FE', fontSize: fs(13), fontWeight: '800' },

  // Lista
  lista:        { paddingHorizontal: scale(16), paddingBottom: scale(110), paddingTop: scale(4) },
  cargando:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: scale(14) },
  cargandoTexto:{ color: '#52525B', fontSize: fs(14), fontWeight: '600' },

  vacio: { alignItems: 'center', paddingTop: scale(70), gap: scale(14) },
  vacioIconWrapper: {
    width: scale(88), height: scale(88), borderRadius: scale(44),
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  vacioIcono: { fontSize: fs(42) },
  vacioTexto: { fontSize: fs(18), fontWeight: '800', color: '#FAFAFA' },
  vacioSub:   { fontSize: fs(13), color: '#52525B', textAlign: 'center', paddingHorizontal: scale(32) },

  // FAB
  fabWrapper: {
    position: 'absolute',
    bottom: scale(24),
    left: scale(16), right: scale(16),
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.4, shadowRadius: scale(18), elevation: 12,
  },
  fab: {
    backgroundColor: '#4F46E5',
    borderRadius: scale(18),
    paddingVertical: scale(15),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  fabIconCaja: {
    width: scale(28), height: scale(28), borderRadius: scale(9),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  fabTexto: { color: '#FFF', fontSize: fs(16), fontWeight: '800', letterSpacing: 0.4 },
});
