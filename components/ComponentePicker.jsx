// components/ComponentePicker.jsx
// Selector de componente con iconos de MaterialCommunityIcons

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, Platform, Pressable,
} from 'react-native';

const COMPONENTES_INFO = [
  { nombre: 'DEFENSAS', emoji: '🛡️', color: '#3B82F6' },
  { nombre: 'FAROS DELANTEROS', emoji: '🔦', color: '#F59E0B' },
  { nombre: 'DIRECCIONALES', emoji: '↔️', color: '#FCD34D' },
  { nombre: 'PANORÁMICO', emoji: '🪟', color: '#06B6D4' },
  { nombre: 'RETROVISORES', emoji: '🔍', color: '#64748B' },
  { nombre: 'PUERTAS', emoji: '🚪', color: '#22C55E' },
  { nombre: 'VENTANAS', emoji: '🖼️', color: '#38BDF8' },
  { nombre: 'CARROCERÍA LATERAL', emoji: '🚌', color: '#A855F7' },
  { nombre: 'ESTRIBOS', emoji: '🪜', color: '#8B5CF6' },
  { nombre: 'LLANTAS', emoji: '🛞', color: '#1F2937' },
  { nombre: 'GUARDABARROS', emoji: '🛡️', color: '#475569' },
  { nombre: 'VIDRIO TRASERO', emoji: '🪟', color: '#0EA5E9' },
  { nombre: 'PLACAS', emoji: '🏷️', color: '#EAB308' },
  { nombre: 'TECHO', emoji: '⏫', color: '#94A3B8' },
  { nombre: 'LEVAS', emoji: '⚙️', color: '#EF4444' },
  { nombre: 'OTRO', emoji: '📝', color: '#94A3B8' }
];

export function ComponentePicker({ valor, onChange, error }) {
  const [abierto, setAbierto] = useState(false);

  const seleccionar = (nombre) => {
    onChange(nombre);
    setAbierto(false);
  };

  const seleccionActual = COMPONENTES_INFO.find(c => c.nombre === valor) || { nombre: valor, emoji: '📋', color: '#4338CA' };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.label}>
        COMPONENTE AFECTADO
      </Text>

      <TouchableOpacity
        style={[estilos.selector, error && estilos.selectorError, abierto && estilos.selectorActivo]}
        onPress={() => setAbierto(true)}
        activeOpacity={0.8}
      >
        {valor ? (
          <View style={estilos.valorFila}>
            <Text style={{ fontSize: 18 }}>{seleccionActual.emoji}</Text>
            <Text style={estilos.selectorTextoValor}>{valor}</Text>
          </View>
        ) : (
          <Text style={estilos.placeholder}>Selecciona el componente...</Text>
        )}
        <Text style={[estilos.chevron, abierto && estilos.chevronArriba]}>▾</Text>
      </TouchableOpacity>

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}

      {/* Modal lista */}
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={estilos.modalFondo} onPress={() => setAbierto(false)}>
          <Pressable style={estilos.modalCaja} onPress={() => {}}>

            {/* Encabezado */}
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>🔧 Selecciona componente</Text>
              <TouchableOpacity onPress={() => setAbierto(false)} style={estilos.modalCerrar}>
                <Text style={estilos.modalCerrarTexto}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de componentes */}
            <FlatList
              data={COMPONENTES_INFO}
              keyExtractor={(item) => item.nombre}
              renderItem={({ item }) => {
                const estaSeleccionado = valor === item.nombre;
                return (
                  <TouchableOpacity
                    style={[estilos.opcion, estaSeleccionado && estilos.opcionSeleccionada]}
                    onPress={() => seleccionar(item.nombre)}
                    activeOpacity={0.7}
                  >
                    <View style={estilos.opcionFila}>
                      <View style={[estilos.iconoCaja, { backgroundColor: item.color + '1A' }]}>
                        <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                      </View>
                      <Text style={[estilos.opcionTexto, estaSeleccionado && estilos.opcionTextoActivo]}>
                        {item.nombre}
                      </Text>
                    </View>
                    {estaSeleccionado && <Text style={estilos.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 16 },
  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  obligatorio: { color: '#E53935' },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
  },
  selectorActivo: { borderColor: '#4338CA', backgroundColor: '#FFFFFF' },
  selectorError: { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  valorFila: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  selectorTextoValor: { fontSize: 15, color: '#212121', flex: 1, fontWeight: '600' },
  placeholder: { color: '#BDBDBD', fontSize: 15, flex: 1 },
  chevron: { fontSize: 16, color: '#9E9E9E', marginLeft: 8 },
  chevronArriba: { transform: [{ rotate: '180deg' }], color: '#4338CA' },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 4 },

  // Modal
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCaja: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  modalTitulo: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  modalCerrar: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  modalCerrarTexto: { fontSize: 14, color: '#64748B', fontWeight: '700' },

  // Opciones
  opcion: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  opcionSeleccionada: { backgroundColor: '#EEF2FF' },
  opcionFila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconoCaja: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  opcionTexto: { fontSize: 14, color: '#334155', fontWeight: '600' },
  opcionTextoActivo: { color: '#4338CA', fontWeight: '800' },
  checkmark: { fontSize: 16, color: '#4338CA', fontWeight: '900' },
});
