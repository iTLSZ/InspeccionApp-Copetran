// components/PoblacionPicker.jsx
// Selector de población con lista fija de municipios

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, Platform, Pressable,
} from 'react-native';

const POBLACIONES = [
  'URUMITA',
  'VILLANUEVA',
  'SAN JUAN DEL CESAR',
  'FONSECA',
  'BARRANCAS',
  'HATONUEVO',
  'ALBANIA',
  'RIOHACHA',
  'MAICAO',
  'URIBIA',
];

export function PoblacionPicker({ valor, onChange, error, compact = false }) {
  const [abierto, setAbierto] = useState(false);

  const seleccionar = (poblacion) => {
    onChange(poblacion);
    setAbierto(false);
  };

  return (
    <View style={[estilos.contenedor, compact && estilos.contenedorCompacto]}>
      <Text style={[estilos.label, compact && estilos.labelCompacto]}>
        POBLACIÓN <Text style={estilos.opcional}>(opcional)</Text>
      </Text>

      <TouchableOpacity
        style={[
          estilos.selector,
          compact && estilos.selectorCompacto,
          error && estilos.selectorError,
          abierto && estilos.selectorActivo
        ]}
        onPress={() => setAbierto(true)}
        activeOpacity={0.8}
      >
        <Text style={[estilos.selectorTexto, !valor && estilos.placeholder]}>
          {valor || 'Selecciona el municipio...'}
        </Text>
        <Text style={[estilos.chevron, abierto && estilos.chevronArriba]}>▾</Text>
      </TouchableOpacity>

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}

      {/* Modal lista */}
      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={estilos.modalFondo} onPress={() => setAbierto(false)}>
          <Pressable style={estilos.modalCaja} onPress={() => {}}>

            {/* Encabezado */}
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>📍 Selecciona municipio</Text>
              <TouchableOpacity onPress={() => setAbierto(false)} style={estilos.modalCerrar}>
                <Text style={estilos.modalCerrarTexto}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Opción "ninguna" */}
            <TouchableOpacity
              style={[estilos.opcion, !valor && estilos.opcionSeleccionada]}
              onPress={() => seleccionar('')}
            >
              <Text style={[estilos.opcionTexto, !valor && estilos.opcionTextoActivo]}>
                — Sin especificar —
              </Text>
              {!valor && <Text style={estilos.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={estilos.separador} />

            {/* Lista de municipios */}
            <FlatList
              data={POBLACIONES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const estaSeleccionado = valor === item;
                return (
                  <TouchableOpacity
                    style={[estilos.opcion, estaSeleccionado && estilos.opcionSeleccionada]}
                    onPress={() => seleccionar(item)}
                    activeOpacity={0.7}
                  >
                    <View style={estilos.opcionFila}>
                      <View style={[estilos.opcionDot, estaSeleccionado && estilos.opcionDotActivo]} />
                      <Text style={[estilos.opcionTexto, estaSeleccionado && estilos.opcionTextoActivo]}>
                        {item}
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
  contenedorCompacto: { marginBottom: 6 },
  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  labelCompacto: { fontSize: 11, marginBottom: 4 },
  opcional: { color: '#BDBDBD', fontWeight: '400', textTransform: 'none' },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
  },
  selectorCompacto: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  selectorActivo: { borderColor: '#4338CA', backgroundColor: '#FFFFFF' },
  selectorError: { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  selectorTexto: { fontSize: 15, color: '#212121', flex: 1 },
  placeholder: { color: '#BDBDBD' },
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
    maxHeight: '75%', paddingBottom: Platform.OS === 'ios' ? 34 : 16,
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
  separador: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 20 },

  // Opciones
  opcion: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  opcionSeleccionada: { backgroundColor: '#EEF2FF' },
  opcionFila: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcionDot: {
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: '#CBD5E1',
  },
  opcionDotActivo: { backgroundColor: '#4338CA', borderColor: '#4338CA' },
  opcionTexto: { fontSize: 15, color: '#334155', fontWeight: '500' },
  opcionTextoActivo: { color: '#4338CA', fontWeight: '700' },
  checkmark: { fontSize: 16, color: '#4338CA', fontWeight: '900' },
});
