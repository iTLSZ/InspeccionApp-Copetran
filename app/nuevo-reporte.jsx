// app/nuevo-reporte.jsx
// Pantalla principal del formulario de reporte de daños

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Alert, ActivityIndicator, Platform, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { FormField } from '../components/FormField';
import { PhotoPicker } from '../components/PhotoPicker';
import { useForm } from '../hooks/useForm';
import { appendRow, uploadPhoto } from '../services/googleSheets';
import { saveLocal } from '../services/offline';
import NetInfo from '@react-native-community/netinfo';

const COMPONENTES = [
  '', 'Motor', 'Carrocería', 'Frenos', 'Suspensión',
  'Eléctrico', 'Neumáticos', 'Vidrios', 'Puertas',
  'Aire acondicionado', 'Otro',
];

export default function NuevoReporte({ onGuardado }) {
  const router = useRouter();
  const { campos, errores, enviando, setEnviando, setcampo, validar, resetear } = useForm();
  const [showComponentePicker, setShowComponentePicker] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const handleEnviar = async () => {
    if (!validar()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios marcados con *');
      return;
    }

    setEnviando(true);
    try {
      const netState = await NetInfo.fetch();
      const hayConexion = netState.isConnected && netState.isInternetReachable;

      let linkFoto = '';
      if (campos.fotoUri && hayConexion) {
        // Subir foto a Google Drive
        const nombre = `buseta_${campos.placa}_${Date.now()}.jpg`;
        linkFoto = await uploadPhoto(campos.fotoUri, nombre);
      }

      const reporte = {
        fecha: campos.fecha,
        hora: campos.hora,
        poblacion: campos.poblacion,
        numeroBuseta: campos.numeroBuseta,
        placa: campos.placa,
        linkFoto,
        componente: campos.componente,
        descripcion: campos.descripcion,
        preliminar: campos.preliminar,
        responsable: campos.responsable,
        observaciones: campos.observaciones,
        _fotoUri: campos.fotoUri, // solo para guardado offline
      };

      if (hayConexion) {
        await appendRow(reporte);
        setConfirmado(true);
        setTimeout(() => {
          setConfirmado(false);
          resetear();
          onGuardado?.();
        }, 2000);
      } else {
        await saveLocal(reporte);
        Alert.alert(
          '📱 Guardado sin conexión',
          'El reporte fue guardado localmente y se sincronizará automáticamente cuando recuperes internet.',
          [{ text: 'Entendido', onPress: () => { resetear(); onGuardado?.(); } }]
        );
      }
    } catch (error) {
      console.error('Error al enviar reporte:', error);
      Alert.alert(
        'Error al enviar',
        'Hubo un problema. ¿Deseas guardar el reporte localmente?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Guardar local',
            onPress: async () => {
              await saveLocal({ ...campos });
              resetear();
              onGuardado?.();
            },
          },
        ]
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVolver}>
          <Text style={estilos.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Nuevo Reporte</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContent}>
        {/* Sección: Datos básicos */}
        <Text style={estilos.seccion}>INFORMACIÓN DEL VEHÍCULO</Text>

        <View style={estilos.fila2col}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <FormField label="Fecha" valor={campos.fecha} onChange={(v) => setcampo('fecha', v)}
              error={errores.fecha} obligatorio placeholder="DD/MM/AAAA" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <FormField label="Hora" valor={campos.hora} onChange={(v) => setcampo('hora', v)}
              error={errores.hora} obligatorio placeholder="HH:MM" />
          </View>
        </View>

        <FormField label="Población" valor={campos.poblacion} onChange={(v) => setcampo('poblacion', v)}
          placeholder="Ciudad o municipio" />

        <View style={estilos.fila2col}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <FormField label="N° Buseta" valor={campos.numeroBuseta}
              onChange={(v) => setcampo('numeroBuseta', v.replace(/\D/g, ''))}
              keyboardType="numeric" placeholder="001" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <FormField label="Placa" valor={campos.placa}
              onChange={(v) => setcampo('placa', v.toUpperCase())}
              error={errores.placa} obligatorio autoCapitalize="characters"
              placeholder="ABC123" />
          </View>
        </View>

        {/* Foto */}
        <PhotoPicker uri={campos.fotoUri} onChange={(v) => setcampo('fotoUri', v)} error={errores.fotoUri} />

        {/* Sección: Hallazgo */}
        <Text style={estilos.seccion}>DETALLE DEL HALLAZGO</Text>

        {/* Componente afectado */}
        <View style={estilos.campoContenedor}>
          <Text style={estilos.label}>COMPONENTE AFECTADO <Text style={estilos.asterisco}>*</Text></Text>
          <TouchableOpacity
            style={[estilos.selectorBoton, errores.componente && estilos.selectorError]}
            onPress={() => setShowComponentePicker(true)}>
            <Text style={campos.componente ? estilos.selectorTexto : estilos.selectorPlaceholder}>
              {campos.componente || 'Seleccionar componente...'}
            </Text>
            <Text style={estilos.selectorArrow}>▼</Text>
          </TouchableOpacity>
          {errores.componente && <Text style={estilos.textoError}>⚠ {errores.componente}</Text>}
        </View>

        <FormField label="Descripción del hallazgo" valor={campos.descripcion}
          onChange={(v) => setcampo('descripcion', v)} error={errores.descripcion}
          multiline numberOfLines={4} obligatorio placeholder="Describe detalladamente el daño encontrado..." />

        {/* Preliminar toggle */}
        <View style={estilos.switchFila}>
          <View style={estilos.switchInfo}>
            <Text style={estilos.switchLabel}>¿Es un reporte preliminar?</Text>
            <Text style={estilos.switchSub}>Indica si requiere confirmación posterior</Text>
          </View>
          <Switch value={campos.preliminar} onValueChange={(v) => setcampo('preliminar', v)}
            trackColor={{ false: '#E0E0E0', true: '#1565C020' }}
            thumbColor={campos.preliminar ? '#1565C0' : '#BDBDBD'} />
        </View>

        {/* Sección: Responsable */}
        <Text style={estilos.seccion}>RESPONSABLE</Text>

        <FormField label="Conductor o Responsable" valor={campos.responsable}
          onChange={(v) => setcampo('responsable', v)} error={errores.responsable}
          obligatorio placeholder="Nombre completo" autoCapitalize="words" />

        <FormField label="Observaciones" valor={campos.observaciones}
          onChange={(v) => setcampo('observaciones', v)}
          multiline numberOfLines={3} placeholder="Notas adicionales (opcional)..." />

        {/* Botón enviar */}
        <TouchableOpacity style={[estilos.btnEnviar, enviando && estilos.btnEnviando]}
          onPress={handleEnviar} disabled={enviando}>
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={estilos.btnEnviarTexto}>✓ Guardar Reporte</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={estilos.btnLimpiar} onPress={resetear}>
          <Text style={estilos.btnLimpiarTexto}>Limpiar formulario</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal Picker Componente (iOS-friendly) */}
      <Modal visible={showComponentePicker} transparent animationType="slide">
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContenido}>
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>Componente afectado</Text>
              <TouchableOpacity onPress={() => setShowComponentePicker(false)}>
                <Text style={estilos.modalCerrar}>Listo</Text>
              </TouchableOpacity>
            </View>
            <Picker selectedValue={campos.componente}
              onValueChange={(v) => { setcampo('componente', v); }}>
              {COMPONENTES.map((c) => (
                <Picker.Item key={c} label={c || 'Seleccionar...'} value={c} />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>

      {/* Overlay de confirmación */}
      {confirmado && (
        <View style={estilos.confirmacionOverlay}>
          <View style={estilos.confirmacionCaja}>
            <Text style={estilos.confirmacionIcono}>✅</Text>
            <Text style={estilos.confirmacionTexto}>¡Reporte guardado!</Text>
            <Text style={estilos.confirmacionSub}>Sincronizado con Google Sheets</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1565C0', paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16, paddingHorizontal: 16,
  },
  btnVolver: { padding: 4 },
  btnVolverTexto: { color: '#FFFFFF', fontSize: 15 },
  headerTitulo: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  seccion: {
    fontSize: 11, fontWeight: '800', color: '#1565C0',
    letterSpacing: 1.5, marginTop: 8, marginBottom: 14,
    borderBottomWidth: 2, borderBottomColor: '#E3F2FD', paddingBottom: 6,
  },
  fila2col: { flexDirection: 'row' },
  // Selector
  campoContenedor: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#616161', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  asterisco: { color: '#D32F2F' },
  selectorBoton: {
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectorError: { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  selectorTexto: { fontSize: 15, color: '#212121' },
  selectorPlaceholder: { fontSize: 15, color: '#BDBDBD' },
  selectorArrow: { color: '#9E9E9E' },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  // Switch
  switchFila: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', borderRadius: 12, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: '#E0E0E0',
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#212121' },
  switchSub: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  // Botones
  btnEnviar: {
    backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 8, shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnEnviando: { backgroundColor: '#1976D2', opacity: 0.8 },
  btnEnviarTexto: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  btnLimpiar: { alignItems: 'center', paddingVertical: 12, marginTop: 8 },
  btnLimpiarTexto: { color: '#9E9E9E', fontSize: 14 },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContenido: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalTitulo: { fontSize: 16, fontWeight: '700', color: '#212121' },
  modalCerrar: { fontSize: 16, color: '#1565C0', fontWeight: '600' },
  // Confirmación
  confirmacionOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmacionCaja: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 32,
    alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  confirmacionIcono: { fontSize: 48, marginBottom: 12 },
  confirmacionTexto: { fontSize: 20, fontWeight: '800', color: '#212121' },
  confirmacionSub: { fontSize: 14, color: '#4CAF50', marginTop: 6, fontWeight: '600' },
});
