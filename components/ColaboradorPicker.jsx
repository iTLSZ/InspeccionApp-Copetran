// Búsqueda inline: escribís nombre, cédula o cargo → lista pequeña → al elegir queda el responsable

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput,
} from 'react-native';
import { filtrarColaboradoresParque } from '../data/parqueFilters';

const MAX_SUGERENCIAS = 10;

export function ColaboradorPicker({ valor, onSeleccionar, error, obligatorio }) {
  const [texto, setTexto] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const blurTimer = useRef(null);

  useEffect(() => {
    if (valor) setTexto(String(valor).toUpperCase());
  }, [valor]);

  const sugerencias = useMemo(() => {
    const q = texto.trim();
    if (!q) return [];
    return filtrarColaboradoresParque(q).slice(0, MAX_SUGERENCIAS);
  }, [texto]);

  const mostrarLista = enfocado && texto.trim().length > 0 && sugerencias.length > 0;

  const cancelarBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  const programarBlur = () => {
    cancelarBlur();
    blurTimer.current = setTimeout(() => setEnfocado(false), 200);
  };

  const onCambioTexto = (t) => {
    const u = t.toUpperCase();
    setTexto(u);
    if (valor && u.trim() !== String(valor).trim()) {
      onSeleccionar('');
    }
  };

  const elegir = (c) => {
    cancelarBlur();
    onSeleccionar(c.nombre);
    setTexto(c.nombre);
    setEnfocado(false);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.label}>
        CONDUCTOR / RESPONSABLE {obligatorio ? <Text style={estilos.asterisco}>*</Text> : null}
      </Text>
      <Text style={estilos.hint}>Lista de responsables — escribí y elegí de la lista</Text>

      <TextInput
        style={[estilos.input, error && estilos.inputError, enfocado && estilos.inputActivo]}
        value={texto}
        onChangeText={onCambioTexto}
        onFocus={() => {
          cancelarBlur();
          setEnfocado(true);
        }}
        onBlur={programarBlur}
        placeholder="Apellido o nombre…"
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
        autoCorrect={false}
      />

      {mostrarLista && (
        <View style={estilos.listaDrop}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={estilos.listaScroll}
            showsVerticalScrollIndicator={sugerencias.length > 4}
          >
            {sugerencias.map((item, i) => (
              <TouchableOpacity
                key={`${item.nombre}-${i}`}
                style={estilos.fila}
                activeOpacity={0.7}
                onPressIn={cancelarBlur}
                onPress={() => elegir(item)}
              >
                <View style={estilos.filaCol}>
                  <Text style={estilos.nombre} numberOfLines={3}>{item.nombre}</Text>
                  {(item.cedula || item.cargo) ? (
                    <Text style={estilos.meta} numberOfLines={1}>
                      {item.cedula ? `CC ${item.cedula}` : ''}
                      {item.cedula && item.cargo ? ' · ' : ''}
                      {item.cargo || ''}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
    zIndex: 10,
    elevation: 6,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  asterisco: { color: '#D32F2F' },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  input: {
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#212121',
  },
  inputActivo: { borderColor: '#4338CA', backgroundColor: '#FFFFFF' },
  inputError: { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  listaDrop: {
    marginTop: 6,
    maxHeight: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    overflow: 'hidden',
  },
  listaScroll: { maxHeight: 260 },
  fila: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  filaCol: { gap: 4 },
  nombre: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  meta: { fontSize: 12, color: '#64748B' },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 6 },
});
