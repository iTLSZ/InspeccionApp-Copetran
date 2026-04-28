// components/EditReporteModal.jsx
// Modal premium para editar un reporte existente y sincronizar con Google Sheets

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, Switch, ActivityIndicator, Alert, Platform,
  Animated, KeyboardAvoidingView
} from 'react-native';
import { FormField } from './FormField';
import { PoblacionPicker } from './PoblacionPicker';
import { ComponentePicker } from './ComponentePicker';
import { PhotoPicker } from './PhotoPicker';
import { BusetaPicker } from './BusetaPicker';
import { ResponsablePicker } from './ResponsablePicker';
import { updateRow } from '../services/googleSheets';

export function EditReporteModal({ visible, reporte, onClose, onGuardado }) {
  const [campos, setCampos] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(60)).current;
  const fadeAnim  = React.useRef(new Animated.Value(0)).current;

  // Cargar datos del reporte al abrir
  useEffect(() => {
    if (visible && reporte) {
      setCampos({
        fecha:         reporte.fecha        || '',
        hora:          reporte.hora         || '',
        poblacion:     reporte.poblacion    || '',
        numeroBuseta:  reporte.numeroBuseta || '',
        placa:         reporte.placa        || '',
        componente:    reporte.componente   || '',
        otroComponente:'',
        descripcion:   reporte.descripcion  || '',
        preliminar:    reporte.preliminar   || false,
        responsable:   reporte.responsable  || '',
        observaciones: reporte.observaciones|| '',
        fotoUri:       null,   // null = sin foto nueva; si el user elige, se sube
        linkFoto:      reporte.linkFoto     || '',
      });
      setGuardado(false);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, reporte]);

  const setcampo = (nombre, valor) => setCampos(prev => ({ ...prev, [nombre]: valor }));

  const handleGuardar = async () => {
    if (guardando) return;
    if (!campos.placa?.trim() || !campos.componente?.trim() || !campos.descripcion?.trim()) {
      Alert.alert('Campos requeridos', 'Placa, componente y descripción son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const reporteActualizado = {
        fecha:         campos.fecha,
        hora:          campos.hora,
        poblacion:     campos.poblacion,
        numeroBuseta:  campos.numeroBuseta,
        placa:         campos.placa,
        componente:    campos.componente === 'OTRO'
                         ? campos.otroComponente.trim().toUpperCase()
                         : campos.componente,
        descripcion:   campos.descripcion,
        preliminar:    campos.preliminar,
        responsable:   campos.responsable,
        observaciones: campos.observaciones,
        _fotoUri:      campos.fotoUri,   // null si no eligió nueva foto
      };

      await updateRow(reporte.rowIndex, reporteActualizado);

      setGuardado(true);
      setTimeout(() => {
        onGuardado?.();
        onClose();
      }, 800);
    } catch (err) {
      Alert.alert('Error al guardar', err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!visible || !reporte) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={e.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={e.fondoPresionable} activeOpacity={1} onPress={onClose} />

        <Animated.View style={[e.sheet, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* ── HEADER ── */}
          <View style={e.header}>
            <View style={e.drag} />
            <View style={e.headerRow}>
              <View>
                <Text style={e.headerTitulo}>✏️  Editar Reporte</Text>
                <Text style={e.headerSub}>{reporte.placa}  •  {reporte.fecha}</Text>
              </View>
              <TouchableOpacity style={e.btnCerrar} onPress={onClose}>
                <Text style={e.btnCerrarTexto}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── OVERLAY CONFIRMACIÓN ── */}
          {guardado && (
            <View style={e.overlayConfirmacion}>
              <View style={e.overlayCaja}>
                <View style={e.overlayCirculo}>
                  <Text style={e.overlayIcono}>✓</Text>
                </View>
                <Text style={e.overlayTitulo}>¡Guardado!</Text>
                <Text style={e.overlaySub}>Reporte actualizado con éxito</Text>
              </View>
            </View>
          )}

          <ScrollView
            style={e.scroll}
            contentContainerStyle={e.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── VEHÍCULO ── */}
            <View style={e.seccion}>
              <Text style={e.seccionTitulo}>🚌  Vehículo</Text>
              <View style={e.fila2col}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <FormField label="Fecha" valor={campos.fecha}
                    onChange={v => setcampo('fecha', v)} placeholder="DD/MM/AAAA" />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <FormField label="Hora" valor={campos.hora}
                    onChange={v => setcampo('hora', v)} placeholder="HH:MM" />
                </View>
              </View>
              <PoblacionPicker valor={campos.poblacion} onChange={v => setcampo('poblacion', v)} />
              <BusetaPicker
                numeroBuseta={campos.numeroBuseta}
                placa={campos.placa}
                onChangeNumero={v => setcampo('numeroBuseta', v)}
                onChangePlaca={v => setcampo('placa', v)}
              />
            </View>

            {/* ── FOTO ── */}
            <View style={e.seccion}>
              <Text style={e.seccionTitulo}>📷  Evidencia fotográfica</Text>
              {campos.linkFoto && !campos.fotoUri ? (
                <View style={e.fotoActualContainer}>
                  <Text style={e.fotoActualLabel}>Foto actual en el reporte:</Text>
                  <TouchableOpacity
                    style={e.btnCambiarFoto}
                    onPress={() => setcampo('linkFoto', '')}
                  >
                    <Text style={e.btnCambiarFotoTexto}>🔄 Cambiar foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <PhotoPicker
                  uri={campos.fotoUri}
                  onChange={v => setcampo('fotoUri', v)}
                />
              )}
            </View>

            {/* ── HALLAZGO ── */}
            <View style={e.seccion}>
              <Text style={e.seccionTitulo}>🔧  Hallazgo</Text>
              <ComponentePicker valor={campos.componente} onChange={v => setcampo('componente', v)} />
              {campos.componente === 'OTRO' && (
                <FormField
                  label="¿Cuál componente?"
                  valor={campos.otroComponente}
                  onChange={v => setcampo('otroComponente', v)}
                  placeholder="Nombre del componente..."
                  autoCapitalize="characters"
                />
              )}
              <FormField
                label="Descripción"
                valor={campos.descripcion}
                onChange={v => setcampo('descripcion', v)}
                multiline numberOfLines={4}
                obligatorio
                placeholder="Describe detalladamente el daño..."
              />
              <View style={e.switchFila}>
                <View style={e.switchInfo}>
                  <Text style={e.switchLabel}>⚡ Reporte preliminar</Text>
                  <Text style={e.switchSub}>Requiere confirmación posterior</Text>
                </View>
                <Switch
                  value={campos.preliminar}
                  onValueChange={v => setcampo('preliminar', v)}
                  trackColor={{ false: '#3F3F46', true: '#6D28D9' }}
                  thumbColor={campos.preliminar ? '#A78BFA' : '#71717A'}
                />
              </View>
            </View>

            {/* ── RESPONSABLE ── */}
            <View style={e.seccion}>
              <Text style={e.seccionTitulo}>👤  Responsable</Text>
              <ResponsablePicker
                responsable={campos.responsable}
                onChangeResponsable={v => setcampo('responsable', v)}
              />
              <FormField
                label="Observaciones"
                valor={campos.observaciones}
                onChange={v => setcampo('observaciones', v)}
                multiline numberOfLines={3}
                placeholder="Notas adicionales (opcional)..."
              />
            </View>

            {/* ── BOTÓN GUARDAR ── */}
            <TouchableOpacity
              style={[e.btnGuardar, guardando && e.btnGuardando]}
              onPress={handleGuardar}
              disabled={guardando}
              activeOpacity={0.85}
            >
              {guardando
                ? <ActivityIndicator color="#FFF" />
                : <>
                    <Text style={e.btnGuardarIcono}>✓</Text>
                    <Text style={e.btnGuardarTexto}>Guardar cambios</Text>
                  </>
              }
            </TouchableOpacity>

            <TouchableOpacity style={e.btnCancelar} onPress={onClose}>
              <Text style={e.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const e = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  fondoPresionable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },

  // Header
  header: {
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  drag: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerTitulo: { color: '#FAFAFA', fontSize: 18, fontWeight: '800' },
  headerSub:    { color: '#A1A1AA', fontSize: 13, marginTop: 3, fontWeight: '500' },
  btnCerrar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  btnCerrarTexto: { color: '#A1A1AA', fontSize: 16, fontWeight: '700' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },

  // Secciones
  seccion: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  seccionTitulo: {
    color: '#E4E4E7', fontSize: 14, fontWeight: '800',
    marginBottom: 4, letterSpacing: 0.3,
  },
  fila2col: { flexDirection: 'row' },

  // Foto actual
  fotoActualContainer: {
    backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  fotoActualLabel: { color: '#A1A1AA', fontSize: 13, fontWeight: '600', flex: 1 },
  btnCambiarFoto: {
    backgroundColor: 'rgba(99,102,241,0.25)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  btnCambiarFotoTexto: { color: '#818CF8', fontSize: 13, fontWeight: '700' },

  // Switch
  switchFila: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: '700', color: '#E4E4E7' },
  switchSub:   { fontSize: 12, color: '#71717A', marginTop: 2 },

  // Botones
  btnGuardar: {
    backgroundColor: '#4F46E5', borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    marginTop: 4,
  },
  btnGuardando: { opacity: 0.7 },
  btnGuardarIcono: {
    color: '#FFF', fontSize: 16, fontWeight: '900',
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center', lineHeight: 22,
  },
  btnGuardarTexto: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  btnCancelar: { alignItems: 'center', paddingVertical: 12 },
  btnCancelarTexto: { color: '#71717A', fontSize: 14, fontWeight: '600' },

  // Overlay confirmación
  overlayConfirmacion: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.7)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 99,
  },
  overlayCaja: {
    backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 36, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 20,
  },
  overlayCirculo: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#4338CA', alignItems: 'center', justifyContent: 'center',
  },
  overlayIcono: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  overlayTitulo: { fontSize: 22, fontWeight: '900', color: '#1E293B' },
  overlaySub: { fontSize: 14, color: '#64748B' },
});
