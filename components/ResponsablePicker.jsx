// components/ResponsablePicker.jsx
// Autocompletado de Responsables (Conductores / Colaboradores) en mayúsculas

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Animated, Easing,
} from 'react-native';
import { filtrarResponsables } from '../data/responsables';

export function ResponsablePicker({ responsable, onChangeResponsable, errorResponsable }) {
  const [query, setQuery]         = useState(responsable || '');
  const [sugerencias, setSug]     = useState([]);
  const [mostrar, setMostrar]     = useState(false);
  const [focusedInput, setFocused] = useState(false);
  const dropAnim = useRef(new Animated.Value(0)).current;

  // ── Animación del dropdown ─────────────────────────────────────
  const abrirDrop = useCallback((lista) => {
    if (lista.length === 0) { cerrarDrop(); return; }
    setMostrar(true);
    dropAnim.setValue(0);
    Animated.timing(dropAnim, {
      toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();
  }, [dropAnim]);

  const cerrarDrop = useCallback(() => {
    Animated.timing(dropAnim, {
      toValue: 0, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: false,
    }).start(() => { setMostrar(false); setSug([]); });
  }, [dropAnim]);

  // ── Handler: al escribir ─────────────────────────
  const handleChangeTexto = (texto) => {
    const val = texto.toUpperCase(); // Siempre en mayúsculas
    setQuery(val);
    onChangeResponsable(val);
    const lista = filtrarResponsables(val);
    setSug(lista);
    abrirDrop(lista);
  };

  // ── Handler: al seleccionar del dropdown ──────────────────────
  const handleSeleccionar = (item) => {
    const seleccionado = item.nombre;
    setQuery(seleccionado);
    onChangeResponsable(seleccionado);
    cerrarDrop();
  };

  // ── Animaciones del alto del dropdown ─────────────────────────
  const dropHeight = dropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(sugerencias.length, 5) * 60 + 8],
  });
  const dropOpacity = dropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.label}>CONDUCTOR / RESPONSABLE</Text>
      
      <TextInput
        style={[
          estilos.input,
          focusedInput && estilos.inputActivo,
          errorResponsable && estilos.inputError,
        ]}
        value={query}
        onChangeText={handleChangeTexto}
        onFocus={() => {
          setFocused(true);
          if (query) {
            const lista = filtrarResponsables(query);
            setSug(lista);
            abrirDrop(lista);
          }
        }}
        onBlur={() => {
          setFocused(false);
          // delay para permitir tap en la lista
          setTimeout(() => cerrarDrop(), 200);
        }}
        placeholder="NOMBRE APELLIDO"
        placeholderTextColor="#BDBDBD"
        autoCapitalize="characters"
        returnKeyType="done"
      />
      {errorResponsable && <Text style={estilos.textoError}>⚠ {errorResponsable}</Text>}

      {/* ── Dropdown sugerencias ── */}
      {mostrar && sugerencias.length > 0 && (
        <Animated.View style={[estilos.dropdown, { height: dropHeight, opacity: dropOpacity }]}>
          <FlatList
            data={sugerencias}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="always"
            scrollEnabled={sugerencias.length > 5}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  estilos.sugerenciaItem,
                  index < sugerencias.length - 1 && estilos.sugerenciaBorde,
                ]}
                onPress={() => handleSeleccionar(item)}
                activeOpacity={0.7}
              >
                <View style={estilos.numBadge}>
                  <Text style={estilos.numBadgeTexto}>👤</Text>
                </View>

                <View style={estilos.infoCol}>
                  <Text style={estilos.nombreTexto} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={estilos.cargoTexto} numberOfLines={1}>{item.cargo}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 16 },

  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },

  input: {
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#212121',
  },
  inputActivo: { borderColor: '#4338CA', backgroundColor: '#FFFFFF' },
  inputError:  { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  textoError:  { color: '#D32F2F', fontSize: 12, marginTop: 4 },

  // ── Dropdown ──
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#C7D2FE',
    borderRadius: 14, overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
  },
  sugerenciaItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 12,
  },
  sugerenciaBorde: {
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },

  numBadge: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  numBadgeTexto: { fontSize: 18 },

  infoCol: { flex: 1, justifyContent: 'center' },
  nombreTexto: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  cargoTexto:  { fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '500' },
});
