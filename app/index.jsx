// app/index.jsx
// Pantalla principal: historial de reportes + botón nuevo reporte

import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Platform, Alert, Image
} from 'react-native';
import { useRouter } from 'expo-router';
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

  useEffect(() => { cargarReportes(); }, []);

  const onRefresh = () => {
    setRefrescando(true);
    cargarReportes();
  };

  const handleSincronizar = async () => {
    const result = await sincronizar();
    if (result) {
      Alert.alert('Sincronización', `✅ ${result.exitosos} reportes sincronizados${result.fallidos ? `\n⚠ ${result.fallidos} fallidos` : ''}`);
      cargarReportes();
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <View style={estilos.headerCentrado}>

          {/* Logo y Status */}
          <View style={estilos.logoContainer}>
            <Image source={require('../public/logoouser.png')} style={estilos.logo} resizeMode="contain" />
            <View style={[estilos.statusPildora, conectado ? estilos.statusPildoraOnline : estilos.statusPildoraOffline]}>
              <Text style={estilos.statusTextoCorto}>
                {conectado ? '🟢 Online' : '🔴 Offline'}
              </Text>
            </View>
          </View>

          {/* Textos y Sync */}
          <View style={estilos.textosContenedor}>
            <Text style={estilos.headerEmpresa}>{NOMBRE_EMPRESA}</Text>
            <Text style={estilos.headerSub}>Reporte de daños de equipos</Text>
            {pendientes > 0 && (
              <TouchableOpacity onPress={handleSincronizar} disabled={sincronizando || !conectado} style={estilos.syncBtnFlotante}>
                <Text style={estilos.syncBotonTexto}>
                  {sincronizando ? '⏳ Sincronizando...' : `⬆ Pendientes (${pendientes})`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>

      {/* Título historial */}
      <View style={estilos.seccionHeader}>
        <Text style={estilos.seccionTitulo}>Últimos reportes</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={estilos.btnActualizar}>↻ Actualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={estilos.cargando}>
          <ActivityIndicator size="large" color="#1565C0" />
          <Text style={estilos.cargandoTexto}>Cargando reportes...</Text>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReporteCard reporte={item} />}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor="#1565C0" />}
          ListEmptyComponent={
            <View style={estilos.vacio}>
              <Text style={estilos.vacioIcono}>📋</Text>
              <Text style={estilos.vacioTexto}>No hay reportes registrados</Text>
              <Text style={estilos.vacioSub}>Toca el botón para crear el primero</Text>
            </View>
          }
        />
      )}

      {/* FAB — Nuevo Reporte */}
      <TouchableOpacity style={estilos.fab} onPress={() => router.push('/nuevo-reporte')}>
        <Text style={estilos.fabIcono}>+</Text>
        <Text style={estilos.fabTexto}>Nuevo Reporte</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#1565C0',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center', // Centra todo el bloque en el header
  },
  headerCentrado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosContenedor: {
    justifyContent: 'center',
  },
  headerEmpresa: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#90CAF9', fontSize: 13, marginTop: 2 },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  logo: { width: 75, height: 75, resizeMode: 'contain' },
  statusPildora: { position: 'absolute', bottom: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1.5, borderColor: '#FFFFFF' },
  statusPildoraOnline: { backgroundColor: 'rgba(76, 175, 80, 0.2)' },
  statusPildoraOffline: { backgroundColor: 'rgba(244, 67, 54, 0.2)' },
  statusTextoCorto: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  syncBtnFlotante: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, alignSelf: 'flex-start' },
  syncBotonTexto: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  seccionTitulo: { fontSize: 16, fontWeight: '800', color: '#212121' },
  btnActualizar: { fontSize: 14, color: '#1565C0', fontWeight: '600' },
  lista: { paddingHorizontal: 16, paddingBottom: 100 },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  cargandoTexto: { color: '#9E9E9E', fontSize: 14 },
  vacio: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  vacioIcono: { fontSize: 56, marginBottom: 16 },
  vacioTexto: { fontSize: 18, fontWeight: '700', color: '#424242' },
  vacioSub: { fontSize: 14, color: '#9E9E9E', marginTop: 6 },
  fab: {
    position: 'absolute', bottom: 28, right: 20, left: 20,
    backgroundColor: '#1565C0', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
    shadowColor: '#1565C0', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
  },
  fabIcono: { color: '#FFF', fontSize: 22, fontWeight: '300' },
  fabTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
