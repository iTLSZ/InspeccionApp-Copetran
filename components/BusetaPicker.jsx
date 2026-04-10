// components/BusetaPicker.jsx
// Autocompletado N° Buseta → rellena Placa automáticamente al seleccionar

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Animated, Easing,
} from 'react-native';
import { filtrarBusetas } from '../data/busetas';

export function BusetaPicker({ numeroBuseta, placa, onChangeNumero, onChangePlaca, errorNumero, errorPlaca }) {
  const [query, setQuery]         = useState(numeroBuseta || '');
  const [sugerencias, setSug]     = useState([]);
  const [mostrar, setMostrar]     = useState(false);
  const [focusedInput, setFocused] = useState(null); // 'buseta' | 'placa'
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

  // ── Handler: al escribir en N° Buseta ─────────────────────────
  const handleChangeNumero = (texto) => {
    const val = texto.replace(/\D/g, ''); // solo números
    setQuery(val);
    onChangeNumero(val);
    const lista = filtrarBusetas(val);
    setSug(lista);
    abrirDrop(lista);
  };

  // ── Handler: al seleccionar del dropdown ──────────────────────
  const handleSeleccionar = (item) => {
    setQuery(item.numero);
    onChangeNumero(item.numero);
    onChangePlaca(item.placa);
    cerrarDrop();
  };

  // ── Animaciones del alto del dropdown ─────────────────────────
  const dropHeight = dropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(sugerencias.length, 5) * 56 + 8],
  });
  const dropOpacity = dropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={estilos.contenedor}>

      {/* ── Fila 2 columnas: N° Buseta | Placa ── */}
      <View style={estilos.fila}>

        {/* ── Campo N° Buseta ── */}
        <View style={estilos.colBuseta}>
          <Text style={estilos.label}>N° BUSETA</Text>
          <TextInput
            style={[
              estilos.input,
              focusedInput === 'buseta' && estilos.inputActivo,
              errorNumero && estilos.inputError,
            ]}
            value={query}
            onChangeText={handleChangeNumero}
            onFocus={() => {
              setFocused('buseta');
              if (query) {
                const lista = filtrarBusetas(query);
                setSug(lista);
                abrirDrop(lista);
              }
            }}
            onBlur={() => {
              setFocused(null);
              // pequeño delay para permitir tap en el item
              setTimeout(() => cerrarDrop(), 200);
            }}
            placeholder="001"
            placeholderTextColor="#BDBDBD"
            keyboardType="numeric"
            returnKeyType="done"
          />
          {errorNumero && <Text style={estilos.textoError}>⚠ {errorNumero}</Text>}
        </View>

        {/* ── Campo Placa (se rellena automático) ── */}
        <View style={estilos.colPlaca}>
          <Text style={estilos.label}>
            PLACA <Text style={estilos.autoTag}>auto</Text>
          </Text>
          <TextInput
            style={[
              estilos.input,
              focusedInput === 'placa' && estilos.inputActivo,
              errorPlaca && estilos.inputError,
            ]}
            value={placa}
            onChangeText={(v) => onChangePlaca(v.toUpperCase())}
            onFocus={() => setFocused('placa')}
            onBlur={() => setFocused(null)}
            placeholder="ABC123"
            placeholderTextColor="#BDBDBD"
            autoCapitalize="characters"
            maxLength={6}
          />
          {errorPlaca && <Text style={estilos.textoError}>⚠ {errorPlaca}</Text>}
        </View>
      </View>

      {/* ── Dropdown sugerencias ── */}
      {mostrar && sugerencias.length > 0 && (
        <Animated.View style={[estilos.dropdown, { height: dropHeight, opacity: dropOpacity }]}>
          <FlatList
            data={sugerencias}
            keyExtractor={(item) => item.numero}
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
                {/* Número en badge */}
                <View style={estilos.numBadge}>
                  <Text style={estilos.numBadgeTexto}>{item.numero}</Text>
                </View>

                {/* Placa */}
                <View style={estilos.placaInfo}>
                  <Text style={estilos.placaTexto}>{item.placa}</Text>
                  <Text style={estilos.placaHint}>Toca para seleccionar</Text>
                </View>

                {/* Ícono bus */}
                <Text style={estilos.busIcon}>🚌</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 4 },

  fila: { flexDirection: 'row', gap: 10 },
  colBuseta: { flex: 0.45 },
  colPlaca:  { flex: 0.55 },

  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  autoTag: {
    fontSize: 10, color: '#4338CA', fontWeight: '700',
    textTransform: 'lowercase', letterSpacing: 0,
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
    minHeight: 56,
  },
  sugerenciaBorde: {
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },

  numBadge: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#4338CA',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  numBadgeTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  placaInfo: { flex: 1 },
  placaTexto: { fontSize: 16, fontWeight: '900', color: '#1E293B', letterSpacing: 1.5 },
  placaHint:  { fontSize: 11, color: '#94A3B8', marginTop: 1 },

  busIcon: { fontSize: 20 },
});
