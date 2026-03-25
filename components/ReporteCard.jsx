// components/ReporteCard.jsx
// Card premium: imagen grande izquierda + contenido creativo derecha

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, Pressable, Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COMPONENTES = {
  'DEFENSAS':           { color: '#3B82F6', icono: 'shield' },
  'FAROS DELANTEROS':   { color: '#F59E0B', icono: 'highlight' },
  'DIRECCIONALES':      { color: '#FCD34D', icono: 'swap-horiz' },
  'PANORÁMICO':         { color: '#06B6D4', icono: 'aspect-ratio' },
  'RETROVISORES':       { color: '#64748B', icono: 'flip-to-back' },
  'PUERTAS':            { color: '#22C55E', icono: 'meeting-room' },
  'VENTANAS':           { color: '#38BDF8', icono: 'crop-square' },
  'CARROCERÍA LATERAL': { color: '#A855F7', icono: 'directions-bus' },
  'ESTRIBOS':           { color: '#8B5CF6', icono: 'format-line-spacing' },
  'LLANTAS':            { color: '#1F2937', icono: 'donut-large' },
  'GUARDABARROS':       { color: '#475569', icono: 'security' },
  'VIDRIO TRASERO':     { color: '#0EA5E9', icono: 'picture-in-picture' },
  'PLACAS':             { color: '#EAB308', icono: 'format-list-numbered' },
  'TECHO':              { color: '#94A3B8', icono: 'vertical-align-top' },
  'LEVAS':              { color: '#EF4444', icono: 'settings' },
  'OTRO':               { color: '#94A3B8', icono: 'more-horiz' },
};
const DEFAULT_INFO = { color: '#6366F1', icono: 'find-in-page' };

export function ReporteCard({ reporte }) {
  // Si no está en la lista exacta, buscamos o asignamos default
  const info = COMPONENTES[reporte.componente] || DEFAULT_INFO;
  const [verFoto, setVerFoto] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  return (
    <>
      <Animated.View style={[estilos.card, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={1} onPressIn={onIn} onPressOut={onOut}
          onPress={reporte.linkFoto ? () => setVerFoto(true) : null}
          style={estilos.inner}
        >
          {/* ── FOTO IZQUIERDA ── */}
          <View style={estilos.fotoContenedor}>
            {reporte.linkFoto ? (
              <>
                <Image source={{ uri: reporte.linkFoto }} style={estilos.foto} resizeMode="cover" />
                <View style={estilos.fotoOverlay}>
                  <Text style={estilos.fotoLupa}>🔍</Text>
                </View>
              </>
            ) : (
              <View style={[estilos.fotoPlaceholder, { backgroundColor: info.color + '1A' }]}>
                <MaterialIcons name={info.icono} size={32} color={info.color} style={{ opacity: 0.7 }} />
                <Text style={estilos.placeholderTexto}>Sin foto</Text>
              </View>
            )}
            <View style={[estilos.barraColor, { backgroundColor: info.color }]} />
          </View>

          {/* ── CONTENIDO DERECHA ── */}
          <View style={estilos.contenido}>

            {/* Placa destacada */}
            <View style={estilos.placaFila}>
              <Text style={estilos.placa}>{reporte.placa || '—'}</Text>
              {reporte.numeroBuseta ? (
                <View style={estilos.busetaBadge}>
                  <Text style={estilos.busetaTexto}>#{reporte.numeroBuseta}</Text>
                </View>
              ) : null}
            </View>

            {/* Componente con icono de Material + color */}
            <View style={[estilos.componenteBadge, { backgroundColor: info.color + '18' }]}>
              <MaterialIcons name={info.icono} size={14} color={info.color} />
              <Text style={[estilos.componenteTexto, { color: info.color }]} numberOfLines={1}>
                {reporte.componente || 'Sin componente'}
              </Text>
              {reporte.preliminar && (
                <View style={estilos.prelBadge}>
                  <Text style={estilos.prelTexto}>PREV</Text>
                </View>
              )}
            </View>

            {/* Descripción */}
            <Text style={estilos.descripcion} numberOfLines={2}>
              {reporte.descripcion}
            </Text>

            {/* Divider decorativo */}
            <View style={estilos.divider} />

            {/* Pie: fecha + responsable */}
            <View style={estilos.pie}>
              <Text style={estilos.fecha}>📅 {reporte.fecha}</Text>
              <Text style={estilos.hora}>{reporte.hora}</Text>
            </View>
            <Text style={estilos.responsable} numberOfLines={1}>
              👤 {reporte.responsable}
            </Text>
            {reporte.poblacion ? (
              <Text style={estilos.poblacion} numberOfLines={1}>📍 {reporte.poblacion}</Text>
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
                <Text style={estilos.modalSub}>{reporte.componente}  ·  {reporte.fecha} {reporte.hora}</Text>
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
    marginBottom: 14,
    borderRadius: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 5,
  },
  inner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    minHeight: 150,
  },

  // ── Foto izquierda ──
  fotoContenedor: { width: 110, position: 'relative' },
  foto: { width: 110, height: '100%', minHeight: 150 },
  fotoOverlay: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 4,
  },
  fotoLupa: { fontSize: 12 },
  fotoPlaceholder: {
    width: 110, minHeight: 150,
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  placeholderTexto: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  barraColor: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 },

  // ── Contenido derecha ──
  contenido: { flex: 1, padding: 12, gap: 5, justifyContent: 'center' },
  placaFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placa: { fontSize: 20, fontWeight: '900', color: '#1E293B', letterSpacing: 2 },
  busetaBadge: {
    backgroundColor: '#F1F5F9', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  busetaTexto: { fontSize: 11, color: '#64748B', fontWeight: '700' },

  componenteBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4, maxWidth: '100%',
  },
  componenteTexto: { fontSize: 12, fontWeight: '800', flexShrink: 1 },
  prelBadge: {
    backgroundColor: '#F97316', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1,
  },
  prelTexto: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  descripcion: { fontSize: 12, color: '#64748B', lineHeight: 17 },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 2 },
  pie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fecha: { fontSize: 11, color: '#475569', fontWeight: '600' },
  hora:  { fontSize: 11, color: '#94A3B8' },
  responsable: { fontSize: 11, color: '#64748B' },
  poblacion:   { fontSize: 11, color: '#94A3B8' },

  // ── Modal ──
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCaja: {
    width: '92%', backgroundColor: '#0F172A',
    borderRadius: 24, overflow: 'hidden', alignItems: 'center',
  },
  fotoAmpliada: { width: '100%', height: 340 },
  modalInfo: { padding: 16, alignItems: 'center', gap: 4 },
  modalPlaca: { color: '#E2E8F0', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  modalSub:   { color: '#64748B', fontSize: 12 },
  modalCerrar: {
    margin: 16, backgroundColor: '#6366F1', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 40,
  },
  modalCerrarTexto: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
