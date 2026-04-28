// components/ReporteCard.jsx
// Card premium: imagen grande izquierda + contenido creativo derecha

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, Pressable, Animated, Platform, Dimensions, PixelRatio
} from 'react-native';
// expo-blur no compatible con web — reemplazado por View

const { width } = Dimensions.get('window');
const BASE_WIDTH = 360;
const scale = (size) => Math.round((width / BASE_WIDTH) * size);
const fs = (size) => Math.round(PixelRatio.roundToNearestPixel((width / BASE_WIDTH) * size));


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
    <>
      <Animated.View style={[estilos.card, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.9} onPressIn={onIn} onPressOut={onOut}
          onPress={reporte.linkFoto ? () => setVerFoto(true) : null}
        >
          <View style={[estilos.inner, { backgroundColor: 'rgba(24, 24, 27, 0.85)' }]}>
            {/* ── FOTO IZQUIERDA ── */}
            <View style={estilos.fotoContenedor}>
              {reporte.linkFoto ? (
                <>
                  <Image source={{ uri: reporte.linkFoto }} style={estilos.foto} resizeMode="cover" />
                  <View style={[estilos.fotoOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <Text style={estilos.fotoLupa}>🔍</Text>
                  </View>
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
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal foto ampliada */}
      {reporte.linkFoto && (
        <Modal visible={verFoto} transparent animationType="fade" onRequestClose={() => setVerFoto(false)}>
          <Pressable style={estilos.modalFondo} onPress={() => setVerFoto(false)}>
            <View style={estilos.modalBlurBox}>
              <Image source={{ uri: reporte.linkFoto }} style={estilos.fotoAmpliada} resizeMode="contain" />
              <View style={estilos.modalInfo}>
                <Text style={estilos.modalPlaca}>{reporte.placa}</Text>
                <Text style={estilos.modalSub}>{reporte.componente}  •  {fechaMostrar} {reporte.hora ? reporte.hora.toUpperCase() : ''}</Text>
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
    marginBottom: scale(13),
    borderRadius: scale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(5) },
    shadowOpacity: 0.28,
    shadowRadius: scale(8),
    elevation: 7,
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
  },
  inner: {
    flexDirection: 'row',
    borderRadius: scale(18),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: scale(135),
  },

  // ── Foto izquierda ──
  fotoContenedor: { width: scale(100), position: 'relative' },
  foto: { width: scale(100), height: '100%', minHeight: scale(135) },
  fotoOverlay: {
    position: 'absolute', bottom: scale(6), right: scale(6),
    borderRadius: scale(8), padding: scale(5), overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  fotoLupa: { fontSize: fs(11) },
  fotoPlaceholder: {
    width: scale(100), minHeight: scale(135),
    alignItems: 'center', justifyContent: 'center', gap: scale(6),
  },
  placeholderTexto: { fontSize: fs(10), color: '#94A3B8', fontWeight: '700' },
  barraColor: { position: 'absolute', right: 0, top: 0, bottom: 0, width: scale(3) },

  // ── Contenido derecha ──
  contenido: { flex: 1, padding: scale(11), gap: scale(4), justifyContent: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  colIzquierda: { flex: 1, paddingRight: scale(5), gap: scale(7), alignItems: 'flex-start' },
  colDerecha: { flexShrink: 1, alignItems: 'flex-end', maxWidth: '38%' },
  
  placaFila: { flexDirection: 'row', alignItems: 'center', gap: scale(6) },
  // La placa es el elemento más importante — fontSize medio para 720p
  placa: { fontSize: fs(17), fontWeight: '900', color: '#FAFAFA', letterSpacing: 1.5 },
  horaDestacada: { fontSize: fs(12), fontWeight: '800', color: '#A78BFA', letterSpacing: 0.3 },
  separadorHoraFecha: { width: scale(24), height: scale(2), backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: scale(4), borderRadius: scale(2) },
  fechaDestacada: { fontSize: fs(11), color: '#94A3B8', fontWeight: '700' },
  busetaBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: scale(7),
    paddingHorizontal: scale(6), paddingVertical: scale(3),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  busetaTexto: { fontSize: fs(10), color: '#E2E8F0', fontWeight: '700' },

  componenteBadge: {
    flexDirection: 'row', alignItems: 'center', gap: scale(5),
    alignSelf: 'flex-start', borderRadius: scale(10),
    paddingHorizontal: scale(8), paddingVertical: scale(4), maxWidth: '100%',
  },
  componenteTexto: { fontSize: fs(10), fontWeight: '800', flexShrink: 1 },
  prelBadge: {
    backgroundColor: '#F97316', borderRadius: scale(5),
    paddingHorizontal: scale(4), paddingVertical: scale(1), marginLeft: scale(3)
  },
  prelTexto: { color: '#FFF', fontSize: fs(8), fontWeight: '900' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: scale(4) },
  
  poblacionIzquierda: { fontSize: fs(11), fontWeight: '600', color: '#94A3B8', marginTop: scale(1) },
  
  observacionContenedor: {
    backgroundColor: 'rgba(0,0,0,0.2)', padding: scale(8), borderRadius: scale(8),
    marginTop: scale(3), borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)'
  },
  observacionTexto: { fontSize: fs(11), color: '#E2E8F0', lineHeight: fs(16), fontStyle: 'italic' },

  // ── Modal ──
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBlurBox: {
    width: '92%', borderRadius: scale(24), overflow: 'hidden', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(24,24,27,0.7)',
  },
  fotoAmpliada: { width: '100%', height: scale(320), backgroundColor: '#000' },
  modalInfo: { padding: scale(16), alignItems: 'center', gap: scale(5) },
  modalPlaca: { color: '#FAFAFA', fontSize: fs(20), fontWeight: '900', letterSpacing: 2 },
  modalSub: { color: '#A1A1AA', fontSize: fs(13), fontWeight: '500' },
  modalCerrar: {
    marginBottom: scale(18), marginHorizontal: scale(20),
    backgroundColor: '#4F46E5', borderRadius: scale(14),
    paddingVertical: scale(13), paddingHorizontal: scale(36),
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.4, shadowRadius: scale(8)
  },
  modalCerrarTexto: { color: '#FFF', fontWeight: '800', fontSize: fs(15), letterSpacing: 0.4 },
});

