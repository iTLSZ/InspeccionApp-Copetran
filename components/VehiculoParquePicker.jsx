// Escribís N° interno (buseta) o placa → lista pequeña → al elegir se llenan placa y N° interno

import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput,
} from 'react-native';
import { filtrarVehiculosParque } from '../data/parqueFilters';

const MAX_SUGERENCIAS = 10;

export function VehiculoParquePicker({
  placa,
  numeroInterno,
  onSeleccionar,
  onCambioNumeroManual,
  error,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [enfocado, setEnfocado] = useState(false);
  const blurTimer = useRef(null);

  const sugerencias = useMemo(() => {
    const q = busqueda.trim();
    if (!q) return [];
    return filtrarVehiculosParque(q).slice(0, MAX_SUGERENCIAS);
  }, [busqueda]);

  const mostrarLista = enfocado && busqueda.trim().length > 0 && sugerencias.length > 0;

  const cancelarBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  };

  const programarBlur = () => {
    cancelarBlur();
    blurTimer.current = setTimeout(() => setEnfocado(false), 220);
  };

  const elegir = (v) => {
    cancelarBlur();
    onSeleccionar(v.placa, v.numeroInterno);
    setBusqueda('');
    setEnfocado(false);
  };

  const onChangeBusqueda = (t) => {
    const u = t.toUpperCase().replace(/\s/g, '');
    setBusqueda(u);
    if (/^\d*$/.test(u)) {
      onCambioNumeroManual?.(u);
    }
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.label}>N° INTERNO (BUSETA)</Text>
      <Text style={estilos.hint}>
        Escribí el número de buseta o la placa; elegí de la lista y se completa la placa al lado.
      </Text>

      <TextInput
        style={[estilos.input, error && estilos.inputError, enfocado && estilos.inputActivo]}
        value={busqueda}
        onChangeText={onChangeBusqueda}
        onFocus={() => {
          cancelarBlur();
          setEnfocado(true);
        }}
        onBlur={programarBlur}
        placeholder="Ej: 2523 o TTX392"
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
      />

      {mostrarLista && (
        <View style={estilos.listaDrop}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={estilos.listaScroll}
            showsVerticalScrollIndicator={sugerencias.length > 5}
          >
            {sugerencias.map((item) => (
              <TouchableOpacity
                key={`${item.placa}-${item.numeroInterno}`}
                style={estilos.fila}
                activeOpacity={0.7}
                onPressIn={cancelarBlur}
                onPress={() => elegir(item)}
              >
                <Text style={estilos.filaInterno}>N° {item.numeroInterno}</Text>
                <Text style={estilos.filaPlaca}>{item.placa}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {(placa || numeroInterno) ? (
        <Text style={estilos.confirmado}>
          Elegido:{' '}
          {numeroInterno !== '' && numeroInterno != null ? (
            <Text style={estilos.confirmadoStrong}>N° {numeroInterno}</Text>
          ) : null}
          {placa ? (
            <>
              {numeroInterno ? ' · ' : ''}
              <Text style={estilos.confirmadoStrong}>{placa}</Text>
            </>
          ) : null}
        </Text>
      ) : null}

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    marginBottom: 0,
    zIndex: 20,
    elevation: 8,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5,
  },
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
    maxHeight: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    overflow: 'hidden',
  },
  listaScroll: { maxHeight: 240 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  filaInterno: { fontSize: 14, fontWeight: '800', color: '#4338CA' },
  filaPlaca: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  confirmado: { marginTop: 8, fontSize: 12, color: '#64748B' },
  confirmadoStrong: { fontWeight: '800', color: '#334155' },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 6 },
});
