// components/ReporteCard.jsx
// Card para mostrar un reporte en el historial

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Pressable } from 'react-native';

const COLORES_COMPONENTE = {
  Motor: '#E53935',
  Carrocería: '#8E24AA',
  Frenos: '#D81B60',
  Suspensión: '#00897B',
  Eléctrico: '#F4511E',
  Neumáticos: '#3949AB',
  Vidrios: '#039BE5',
  Puertas: '#43A047',
  'Aire acondicionado': '#00ACC1',
  Otro: '#757575',
};

export function ReporteCard({ reporte }) {
  const colorComponente = COLORES_COMPONENTE[reporte.componente] || '#757575';
  const [verFoto, setVerFoto] = useState(false);

  return (
    <View style={estilos.card}>
      {/* Cabecera: info + miniatura de foto */}
      <View style={estilos.cabecera}>
        <View style={estilos.placaContenedor}>
          <Text style={estilos.placa}>{reporte.placa}</Text>
          <Text style={estilos.buseta}>Buseta #{reporte.numeroBuseta}</Text>
        </View>

        <View style={estilos.derechaContenedor}>
          <View style={estilos.fechaContenedor}>
            <Text style={estilos.fecha}>{reporte.fecha}</Text>
            <Text style={estilos.hora}>{reporte.hora}</Text>
          </View>

          {/* Miniatura tocable si hay foto */}
          {reporte.linkFoto ? (
            <TouchableOpacity onPress={() => setVerFoto(true)} activeOpacity={0.8}>
              <Image
                source={{ uri: reporte.linkFoto }}
                style={estilos.miniatura}
                resizeMode="cover"
              />
              <View style={estilos.miniaturaOverlay}>
                <Text style={estilos.miniaturaIcono}>🔍</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={estilos.sinFoto}>
              <Text style={estilos.sinFotoIcono}>📷</Text>
            </View>
          )}
        </View>
      </View>

      {/* Componente afectado */}
      <View style={[estilos.badge, { backgroundColor: colorComponente + '20', borderColor: colorComponente }]}>
        <Text style={[estilos.badgeTexto, { color: colorComponente }]}>
          {reporte.componente}
        </Text>
        {reporte.preliminar && (
          <View style={estilos.preliminarBadge}>
            <Text style={estilos.preliminarTexto}>PRELIMINAR</Text>
          </View>
        )}
      </View>

      {/* Descripción */}
      <Text style={estilos.descripcion} numberOfLines={2}>
        {reporte.descripcion}
      </Text>

      {/* Pie de la card */}
      <View style={estilos.pie}>
        <Text style={estilos.responsable}>👤 {reporte.responsable}</Text>
        {reporte.poblacion ? (
          <Text style={estilos.poblacion}>📍 {reporte.poblacion}</Text>
        ) : null}
      </View>

      {/* Modal para ver foto ampliada */}
      {reporte.linkFoto ? (
        <Modal visible={verFoto} transparent animationType="fade" onRequestClose={() => setVerFoto(false)}>
          <Pressable style={estilos.modalFondo} onPress={() => setVerFoto(false)}>
            <View style={estilos.modalContenedor}>
              <Image
                source={{ uri: reporte.linkFoto }}
                style={estilos.fotoAmpliada}
                resizeMode="contain"
              />
              <Text style={estilos.modalPlaca}>{reporte.placa} — {reporte.fecha}</Text>
              <TouchableOpacity style={estilos.modalCerrar} onPress={() => setVerFoto(false)}>
                <Text style={estilos.modalCerrarTexto}>✕ Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  placaContenedor: { flex: 1 },
  placa: { fontSize: 18, fontWeight: '800', color: '#1565C0', letterSpacing: 1 },
  buseta: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  derechaContenedor: { alignItems: 'flex-end', gap: 8 },
  fechaContenedor: { alignItems: 'flex-end' },
  fecha: { fontSize: 13, color: '#424242', fontWeight: '600' },
  hora: { fontSize: 12, color: '#9E9E9E' },
  // Miniatura
  miniatura: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  miniaturaOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  miniaturaIcono: { fontSize: 11 },
  sinFoto: {
    width: 64, height: 64, borderRadius: 10,
    backgroundColor: '#F5F5F5', borderWidth: 1.5,
    borderColor: '#E0E0E0', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  sinFotoIcono: { fontSize: 22, opacity: 0.4 },
  // Badge
  badge: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start', borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 10, gap: 8,
  },
  badgeTexto: { fontSize: 13, fontWeight: '700' },
  preliminarBadge: {
    backgroundColor: '#FF6F00', borderRadius: 10,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  preliminarTexto: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  descripcion: { fontSize: 14, color: '#424242', lineHeight: 20, marginBottom: 10 },
  pie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  responsable: { fontSize: 13, color: '#616161' },
  poblacion: { fontSize: 13, color: '#616161' },
  // Modal foto ampliada
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContenedor: {
    width: '90%', alignItems: 'center',
    backgroundColor: '#1A1A2E', borderRadius: 20,
    padding: 16, gap: 12,
  },
  fotoAmpliada: { width: '100%', height: 320, borderRadius: 12 },
  modalPlaca: { color: '#90CAF9', fontSize: 14, fontWeight: '700' },
  modalCerrar: {
    backgroundColor: '#1565C0', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 28,
  },
  modalCerrarTexto: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
