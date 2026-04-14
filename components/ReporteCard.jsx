// components/ReporteCard.jsx
// Card premium: imagen grande izquierda + contenido creativo derecha

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, Pressable, Animated, Platform
} from 'react-native';
import { BlurView } from 'expo-blur';

const COMPONENTES = {
  'DEFENSAS':           { color: '#3B82F6', emoji: '🛡️' },
  'FAROS DELANTEROS':   { color: '#F59E0B', emoji: '🔦' },
  'DIRECCIONALES':      { color: '#FCD34D', emoji: '↔️' },
  'PANORÁMICO':         { color: '#06B6D4', emoji: '🪟' },
  'RETROVISORES':       { color: '#64748B', emoji: '🔍' },
  'PUERTAS':            { color: '#22C55E', emoji: '🚪' },
  'VENTANAS':           { color: '#38BDF8', emoji: '🖼️' },
  'CARROCERÍA LATERAL': { color: '#A855F7', emoji: '🚌' },
  'ESTRIBOS':           { color: '#8B5CF6', emoji: '🪜' },
  'LLANTAS':            { color: '#1F2937', emoji: '🛞' },
  'GUARDABARROS':       { color: '#475569', emoji: '🛡️' },
  'VIDRIO TRASERO':     { color: '#0EA5E9', emoji: '🪟' },
  'PLACAS':             { color: '#EAB308', emoji: '🏷️' },
  'TECHO':              { color: '#94A3B8', emoji: '⏫' },
  'LEVAS':              { color: '#EF4444', emoji: '⚙️' },
  'OTRO':               { color: '#94A3B8', emoji: '📝' },
};
const DEFAULT_INFO = { color: '#6366F1', emoji: '📋' };

export function ReporteCard({ reporte }) {
  // Si no está en la lista exacta, buscamos o asignamos default
  const info = COMPONENTES[reporte.componente] || DEFAULT_INFO;
  const [verFoto, setVerFoto] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  // Asegurar formato de fecha en la UI para datos oxidados cacheados
  let fechaMostrar = reporte.fecha || 'Sin fecha';
  if (fechaMostrar.includes('T')) {
    const [yyyy, mm, dd] = fechaMostrar.split('T')[0].split('-');
    fechaMostrar = `${dd}/${mm}/${yyyy}`;
  }

  return (
  return (
    <>
      <Animated.View style={[estilos.card, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.9} onPressIn={onIn} onPressOut={onOut}
          onPress={reporte.linkFoto ? () => setVerFoto(true) : null}
        >
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 100} tint="dark" style={estilos.inner}>
            {/* ── FOTO IZQUIERDA ── */}
            <View style={estilos.fotoContenedor}>
              {reporte.linkFoto ? (
                <>
                  <Image source={{ uri: reporte.linkFoto }} style={estilos.foto} resizeMode="cover" />
                  <BlurView intensity={50} tint="dark" style={estilos.fotoOverlay}>
                    <Text style={estilos.fotoLupa}>🔍</Text>
                  </BlurView>
                </>
              ) : (
                <View style={[estilos.fotoPlaceholder, { backgroundColor: info.color + '1A' }]}>
                  <Text style={{ fontSize: 36 }}>{info.emoji}</Text>
                  <Text style={estilos.placeholderTexto}>Sin foto</Text>
                </View>
              )}
              <View style={[estilos.barraColor, { backgroundColor: info.color }]} />
            </View>

            {/* ── CONTENIDO DERECHA ── */}
            <View style={estilos.contenido}>
              
              {/* ── 2 COLUMNAS SUPERIORES ── */}
              <View style={estilos.topRow}>
                {/* Col Izquierda: Placa + Componente */}
                <View style={estilos.colIzquierda}>
                  <View style={estilos.placaFila}>
                    <Text style={estilos.placa}>{reporte.placa || '—'}</Text>
                    {reporte.numeroBuseta ? (
                      <View style={estilos.busetaBadge}>
                        <Text style={estilos.busetaTexto}>#{reporte.numeroBuseta}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Componente con emoji + color */}
                  <View style={[estilos.componenteBadge, { backgroundColor: info.color + '20', borderColor: info.color + '40', borderWidth: 1 }]}>
                    <Text style={{ fontSize: 13 }}>{info.emoji}</Text>
                    <Text style={[estilos.componenteTexto, { color: info.color }]} numberOfLines={1}>
                      {reporte.componente || 'Sin componente'}
                    </Text>
                    {reporte.preliminar && (
                      <View style={estilos.prelBadge}>
                        <Text style={estilos.prelTexto}>PREV</Text>
                      </View>
                    )}
                  </View>
                  <Text style={estilos.poblacionIzquierda} numberOfLines={1}>
                    👤 {reporte.responsable}
                    {reporte.poblacion ? ` • 📍 ${reporte.poblacion}` : ''}
                  </Text>
                </View>

                {/* Col Derecha: Tiempo + Responsable + Población */}
                <View style={estilos.colDerecha}>
                  <Text style={estilos.horaDestacada}>{reporte.hora ? reporte.hora.toUpperCase() : ''}</Text>
                  <View style={estilos.separadorHoraFecha} />
                  <Text style={estilos.fechaDestacada}>{fechaMostrar}</Text>
                </View>
              </View>

              <View style={estilos.divider} />

              {/* Observación abajo */}
              <View style={estilos.observacionContenedor}>
                <Text style={estilos.observacionTexto} numberOfLines={3}>
                  📝 {reporte.descripcion}
                </Text>
              </View>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal foto ampliada */}
      {reporte.linkFoto && (
        <Modal visible={verFoto} transparent animationType="fade" onRequestClose={() => setVerFoto(false)}>
          <Pressable style={estilos.modalFondo} onPress={() => setVerFoto(false)}>
            <BlurView intensity={100} tint="dark" style={estilos.modalBlurBox}>
              <Image source={{ uri: reporte.linkFoto }} style={estilos.fotoAmpliada} resizeMode="contain" />
              <View style={estilos.modalInfo}>
                <Text style={estilos.modalPlaca}>{reporte.placa}</Text>
                <Text style={estilos.modalSub}>{reporte.componente}  •  {fechaMostrar} {reporte.hora ? reporte.hora.toUpperCase() : ''}</Text>
              </View>
              <TouchableOpacity style={estilos.modalCerrar} onPress={() => setVerFoto(false)}>
                <Text style={estilos.modalCerrarTexto}>✕  Cerrar</Text>
              </TouchableOpacity>
            </BlurView>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const estilos = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.4)', // Base en caso de que BlurView no soporte bien Android
  },
  inner: {
    flexDirection: 'row',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 155,
  },

  // ── Foto izquierda ──
  fotoContenedor: { width: 115, position: 'relative' },
  foto: { width: 115, height: '100%', minHeight: 155 },
  fotoOverlay: {
    position: 'absolute', bottom: 8, right: 8,
    borderRadius: 10, padding: 6, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  fotoLupa: { fontSize: 13 },
  fotoPlaceholder: {
    width: 115, minHeight: 155,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  placeholderTexto: { fontSize: 11, color: '#94A3B8', fontWeight: '700' },
  barraColor: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 },

  // ── Contenido derecha ──
  contenido: { flex: 1, padding: 14, gap: 6, justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  colIzquierda: { flex: 1, paddingRight: 6, gap: 10, alignItems: 'flex-start' },
  colDerecha: { flexShrink: 1, alignItems: 'flex-end', maxWidth: '40%' },
  
  placaFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placa: { fontSize: 21, fontWeight: '900', color: '#FAFAFA', letterSpacing: 2 },
  horaDestacada: { fontSize: 14, fontWeight: '800', color: '#A78BFA', letterSpacing: 0.5 },
  separadorHoraFecha: { width: 30, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 6, borderRadius: 2 },
  fechaDestacada: { fontSize: 13, color: '#94A3B8', fontWeight: '700' },
  busetaBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  busetaTexto: { fontSize: 11, color: '#E2E8F0', fontWeight: '700' },

  componenteBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5, maxWidth: '100%',
  },
  componenteTexto: { fontSize: 11, fontWeight: '800', flexShrink: 1 },
  prelBadge: {
    backgroundColor: '#F97316', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 4
  },
  prelTexto: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 6 },
  
  poblacionIzquierda: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginTop: 2 },
  
  observacionContenedor: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 10, marginTop: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  observacionTexto: { fontSize: 12, color: '#E2E8F0', lineHeight: 18, fontStyle: 'italic' },

  // ── Modal ──
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBlurBox: {
    width: '90%', borderRadius: 28, overflow: 'hidden', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(24,24,27,0.7)',
  },
  fotoAmpliada: { width: '100%', height: 380, backgroundColor: '#000' },
  modalInfo: { padding: 20, alignItems: 'center', gap: 6 },
  modalPlaca: { color: '#FAFAFA', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  modalSub:   { color: '#A1A1AA', fontSize: 14, fontWeight: '500' },
  modalCerrar: {
    margin: 20, backgroundColor: '#4F46E5', borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 40,
    shadowColor: '#4F46E5', shadowOffset: { width:0, height:4 }, shadowOpacity: 0.4, shadowRadius: 8
  },
  modalCerrarTexto: { color: '#FFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
