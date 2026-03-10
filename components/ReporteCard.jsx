// components/ReporteCard.jsx
// Card para mostrar un reporte en el historial

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

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

  return (
    <View style={estilos.card}>
      {/* Cabecera */}
      <View style={estilos.cabecera}>
        <View style={estilos.placaContenedor}>
          <Text style={estilos.placa}>{reporte.placa}</Text>
          <Text style={estilos.buseta}>Buseta #{reporte.numeroBuseta}</Text>
        </View>
        <View style={estilos.fechaContenedor}>
          <Text style={estilos.fecha}>{reporte.fecha}</Text>
          <Text style={estilos.hora}>{reporte.hora}</Text>
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

      {/* Link foto si existe */}
      {reporte.linkFoto ? (
        <TouchableOpacity onPress={() => Linking.openURL(reporte.linkFoto)}>
          <Text style={estilos.linkFoto}>📎 Ver evidencia fotográfica</Text>
        </TouchableOpacity>
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
  placaContenedor: {},
  placa: { fontSize: 18, fontWeight: '800', color: '#1565C0', letterSpacing: 1 },
  buseta: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  fechaContenedor: { alignItems: 'flex-end' },
  fecha: { fontSize: 13, color: '#424242', fontWeight: '600' },
  hora: { fontSize: 12, color: '#9E9E9E' },
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
  linkFoto: {
    color: '#1565C0', fontSize: 13, fontWeight: '600',
    marginTop: 8, textDecorationLine: 'underline',
  },
});
