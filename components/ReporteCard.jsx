// components/ReporteCard.jsx
// Card rediseñada: imagen a la IZQUIERDA, diseño premium oscuro moderno

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, Pressable, Animated,
} from 'react-native';

const COLORES_COMPONENTE = {
  Motor:               { bg: '#FF6B6B', light: '#FFE5E5' },
  Carrocería:          { bg: '#A855F7', light: '#F3E8FF' },
  Frenos:              { bg: '#EC4899', light: '#FCE7F3' },
  Suspensión:          { bg: '#10B981', light: '#D1FAE5' },
  Eléctrico:           { bg: '#F59E0B', light: '#FEF3C7' },
  Neumáticos:          { bg: '#3B82F6', light: '#DBEAFE' },
  Vidrios:             { bg: '#06B6D4', light: '#CFFAFE' },
  Puertas:             { bg: '#22C55E', light: '#DCFCE7' },
  'Aire acondicionado':{ bg: '#0EA5E9', light: '#E0F2FE' },
  Otro:                { bg: '#94A3B8', light: '#F1F5F9' },
};

const DEFAULT_COLOR = { bg: '#6366F1', light: '#EEF2FF' };

export function ReporteCard({ reporte }) {
  const colorInfo = COLORES_COMPONENTE[reporte.componente] || DEFAULT_COLOR;
  const [verFoto, setVerFoto] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <>
      <Animated.View style={[estilos.card, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={reporte.linkFoto ? () => setVerFoto(true) : null}
          style={estilos.cardInner}
        >
          {/* ── Foto / Placeholder a la IZQUIERDA ── */}
          <View style={estilos.fotoContenedor}>
            {reporte.linkFoto ? (
              <Image source={{ uri: reporte.linkFoto }} style={estilos.foto} resizeMode="cover" />
            ) : (
              <View style={[estilos.fotoPlaceholder, { backgroundColor: colorInfo.light }]}>
                <Text style={estilos.fotoPlaceholderIcono}>📷</Text>
              </View>
            )}
            {/* Barra de color del componente */}
            <View style={[estilos.colorBar, { backgroundColor: colorInfo.bg }]} />
          </View>

          {/* ── Contenido a la DERECHA ── */}
          <View style={estilos.contenido}>
            {/* Fila superior: placa + fecha */}
            <View style={estilos.filaSuperior}>
              <Text style={estilos.placa}>{reporte.placa || '—'}</Text>
              <Text style={estilos.fecha}>{reporte.fecha}</Text>
            </View>

            {/* Badge componente */}
            <View style={[estilos.badge, { backgroundColor: colorInfo.light }]}>
              <View style={[estilos.badgeDot, { backgroundColor: colorInfo.bg }]} />
              <Text style={[estilos.badgeTexto, { color: colorInfo.bg }]} numberOfLines={1}>
                {reporte.componente || 'Sin componente'}
              </Text>
              {reporte.preliminar && (
                <View style={estilos.prelBadge}>
                  <Text style={estilos.prelTexto}>⚡ PREV</Text>
                </View>
              )}
            </View>

            {/* Descripción */}
            <Text style={estilos.descripcion} numberOfLines={2}>
              {reporte.descripcion}
            </Text>

            {/* Pie: responsable + hora */}
            <View style={estilos.pie}>
              <Text style={estilos.responsable} numberOfLines={1}>
                👤 {reporte.responsable}
              </Text>
              <Text style={estilos.hora}>{reporte.hora}</Text>
            </View>

            {/* Población si existe */}
            {reporte.poblacion ? (
              <Text style={estilos.poblacion}>📍 {reporte.poblacion}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal foto ampliada */}
      {reporte.linkFoto && (
        <Modal visible={verFoto} transparent animationType="fade" onRequestClose={() => setVerFoto(false)}>
          <Pressable style={estilos.modalFondo} onPress={() => setVerFoto(false)}>
            <View style={estilos.modalCaja}>
              <Image source={{ uri: reporte.linkFoto }} style={estilos.fotoAmpliada} resizeMode="contain" />
              <View style={estilos.modalInfo}>
                <Text style={estilos.modalPlaca}>{reporte.placa}</Text>
                <Text style={estilos.modalFecha}>{reporte.fecha} · {reporte.hora}</Text>
              </View>
              <TouchableOpacity style={estilos.modalCerrar} onPress={() => setVerFoto(false)}>
                <Text style={estilos.modalCerrarTexto}>✕  Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
  },
  cardInner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  // ── Foto izquierda ──
  fotoContenedor: {
    width: 90,
    position: 'relative',
  },
  foto: {
    width: 90,
    height: '100%',
    minHeight: 120,
  },
  fotoPlaceholder: {
    width: 90,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoPlaceholderIcono: { fontSize: 28, opacity: 0.5 },
  colorBar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  // ── Contenido derecha ──
  contenido: {
    flex: 1,
    padding: 12,
    gap: 5,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placa: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1.5,
  },
  fecha: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
    maxWidth: '100%',
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeTexto: { fontSize: 11, fontWeight: '800', flexShrink: 1 },
  prelBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  prelTexto: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  descripcion: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  responsable: { fontSize: 11, color: '#64748B', flex: 1 },
  hora: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  poblacion: { fontSize: 11, color: '#94A3B8' },
  // ── Modal ──
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCaja: {
    width: '92%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
  },
  fotoAmpliada: { width: '100%', height: 340 },
  modalInfo: {
    padding: 16,
    alignItems: 'center',
  },
  modalPlaca: { color: '#E2E8F0', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  modalFecha: { color: '#64748B', fontSize: 13, marginTop: 4 },
  modalCerrar: {
    margin: 16,
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalCerrarTexto: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
