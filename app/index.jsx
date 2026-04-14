// app/index.jsx
// Pantalla principal — Header centrado, badge auto-refresh, cards premium

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform, Alert, Image, Animated, Easing, Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';
import { ReporteCard } from '../components/ReporteCard';
import { getRows } from '../services/googleSheets';
import { useSync } from '../hooks/useSync';
import { NOMBRE_EMPRESA } from './config';

const { width } = Dimensions.get('window');

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
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

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
      {/* ── BACKGROUND GLOW EFFECT ── */}
      <Animated.View style={[estilos.bgGlow1, { opacity: glowAnim }]} />
      <Animated.View style={[estilos.bgGlow2, { 
        opacity: glowAnim.interpolate({ inputRange:[0,1], outputRange:[0.6, 0.2] }) 
      }]} />

      {/* ── HEADER PREMIUM GLASSMORPHISM ───────────────── */}
      <Animated.View style={[estilos.headerContainer, {
          opacity: headerOpacity,
          transform: [{ translateY: headerSlide }]
      }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={estilos.headerBlur}>
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
        </BlurView>
      </Animated.View>

      {/* ── SECCIÓN HISTORIAL ────────────────────────── */}
      <View style={estilos.seccionHeader}>
        <View>
          <Text style={estilos.seccionTitulo}>Últimos reportes</Text>
          <Text style={estilos.seccionSub}>Monitorea la flota en tiempo real</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={estilos.btnRefresh} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialIcons name="refresh" size={20} color="#A78BFA" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Botón Instalar App PWA */}
      {deferredPrompt && (
        <View style={{ marginHorizontal: 20, marginBottom: 12 }}>
          <TouchableOpacity style={estilos.btnInstalarPWA} onPress={handleInstallPWA} activeOpacity={0.85}>
            <BlurView intensity={80} tint="light" style={estilos.blurBtn}>
              <Text style={{ fontSize: 18 }}>📲</Text>
              <Text style={estilos.btnInstalarTexto}>Instalar App en el dispositivo</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de actualizar (nuevos registros) */}
      {nuevoDisponible && (
        <Animated.View style={{ transform: [{ scale: badgePulse }], marginHorizontal: 20, marginBottom: 12 }}>
          <TouchableOpacity style={estilos.nuevoBadge} onPress={cargarNuevos} activeOpacity={0.85}>
             <BlurView intensity={80} tint="dark" style={estilos.blurBtnBadge}>
              <MaterialIcons name="sync" size={18} color="#FFF" />
              <Text style={estilos.nuevoBadgeTexto}>Nuevos registros disponibles</Text>
             </BlurView>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── LISTA ────────────────────────────────────── */}
      {cargando && reportes.length === 0 ? (
        <View style={estilos.cargando}>
          <ActivityIndicator size="large" color="#818CF8" />
          <Text style={estilos.cargandoTexto}>Sincronizando reportes...</Text>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReporteCard reporte={item} />}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor="#818CF8" colors={['#818CF8']} />}
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

      {/* ── FAB CON ESTILO PREMIUM ──────────────────────── */}
      <Animated.View style={[estilos.fabWrapper, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity style={estilos.fab} onPress={handleNuevoReporte} activeOpacity={0.9}>
          <View style={estilos.fabIconCaja}>
            <MaterialIcons name="add" size={24} color="#FFF" />
          </View>
          <Text style={estilos.fabTexto}>Nuevo Reporte</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#09090B' },

  bgGlow1: {
    position: 'absolute', top: -100, left: -50,
    width: width * 0.8, height: width * 0.8,
    borderRadius: 999, backgroundColor: '#4C1D95',
    opacity: 0.3, transform: [{ scale: 1.2 }]
  },
  bgGlow2: {
    position: 'absolute', top: 50, right: -100,
    width: width * 0.7, height: width * 0.7,
    borderRadius: 999, backgroundColor: '#0F766E',
    opacity: 0.2, transform: [{ scale: 1.5 }]
  },

  // ── Header Premium ──
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBlur: {
    borderRadius: 24, overflow: 'hidden',
    padding: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
  },
  logoFila: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoWrapper: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  logo: { width: 36, height: 36 },
  headerTextos: { flex: 1 },
  headerEmpresa: { color: '#FAFAFA', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  headerSub: { color: '#A1A1AA', fontSize: 12, marginTop: 3, fontWeight: '500' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statusOnline: { backgroundColor: 'rgba(74,222,128,0.15)' },
  statusOffline: { backgroundColor: 'rgba(248,113,113,0.15)' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTexto: { color: '#E4E4E7', fontSize: 12, fontWeight: '700' },

  // ── Sección ──
  seccionHeader: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 22, paddingTop: 16, paddingBottom: 16,
  },
  seccionTitulo: { fontSize: 22, fontWeight: '900', color: '#FAFAFA', letterSpacing: 0.5 },
  seccionSub: { fontSize: 13, color: '#A1A1AA', marginTop: 4 },
  btnRefresh: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },

  btnInstalarPWA: { borderRadius: 16, overflow: 'hidden' },
  blurBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.8)'
  },
  btnInstalarTexto: { color: '#0F172A', fontWeight: '800', fontSize: 15 },

  nuevoBadge: { borderRadius: 16, overflow: 'hidden' },
  blurBtnBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.4)', borderRadius: 16,
  },
  nuevoBadgeTexto: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // ── Lista ──
  lista: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 6 },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  cargandoTexto: { color: '#A1A1AA', fontSize: 15, fontWeight: '600' },
  
  vacio: { alignItems: 'center', paddingTop: 80, gap: 16 },
  vacioIconWrapper: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  vacioIcono: { fontSize: 48 },
  vacioTexto: { fontSize: 20, fontWeight: '800', color: '#FAFAFA' },
  vacioSub: { fontSize: 14, color: '#A1A1AA', textAlign: 'center', paddingHorizontal: 40 },

  // ── FAB ──
  fabWrapper: {
    position: 'absolute', bottom: 30, left: 24, right: 24,
    shadowColor: '#818CF8', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 12,
  },
  fab: {
    backgroundColor: '#4F46E5', borderRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  fabIconCaja: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  fabTexto: { color: '#FFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
