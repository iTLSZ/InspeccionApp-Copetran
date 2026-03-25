// components/PhotoPicker.jsx
// Selector de foto con modal llamativo para cámara o galería

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform, Modal, Pressable
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function PhotoPicker({ uri, onChange, error }) {
  const [modalVisible, setModalVisible] = useState(false);

  const solicitarPermisos = async (tipo) => {
    if (tipo === 'camara') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
        return false;
      }
    }
    return true;
  };

  const abrirCamara = async () => {
    setModalVisible(false);
    if (!(await solicitarPermisos('camara'))) return;
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!resultado.canceled) onChange(resultado.assets[0].uri);
  };

  const abrirGaleria = async () => {
    setModalVisible(false);
    if (!(await solicitarPermisos('galeria'))) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!resultado.canceled) onChange(resultado.assets[0].uri);
  };

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.label}>EVIDENCIA FOTOGRÁFICA</Text>

      {uri ? (
        <View style={estilos.previewContenedor}>
          <Image source={{ uri }} style={estilos.preview} resizeMode="cover" />
          <TouchableOpacity style={estilos.btnEliminar} onPress={() => onChange(null)}>
            <Text style={estilos.btnEliminarTexto}>✕ Eliminar foto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[estilos.boton, error && estilos.botonError]} onPress={() => setModalVisible(true)}>
          <Text style={estilos.icono}>📷</Text>
          <Text style={estilos.botonTexto}>Agregar foto de evidencia</Text>
          <Text style={estilos.botonSub}>Toca para elegir cámara o galería</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}

      {/* Modal Premium para seleccionar fuente */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={estilos.modalFondo} onPress={() => setModalVisible(false)}>
          <Pressable style={estilos.modalCaja} onPress={() => {}}>
            
            <View style={estilos.modalDragIndicator} />
            <Text style={estilos.modalTitulo}>Selecciona el origen</Text>
            <Text style={estilos.modalSubtitulo}>¿Desde dónde deseas tomar la evidencia?</Text>

            <View style={estilos.opcionesGrid}>
              
              <TouchableOpacity style={estilos.opcionBtnPrimaria} onPress={abrirCamara} activeOpacity={0.85}>
                <View style={estilos.opcionIconoCajaPrimaria}>
                  <Text style={estilos.opcionIcono}>📸</Text>
                </View>
                <Text style={estilos.opcionTextoPrimaria}>Usar Cámara</Text>
                <Text style={estilos.opcionBadge}>Recomendado</Text>
              </TouchableOpacity>

              <TouchableOpacity style={estilos.opcionBtnSecundaria} onPress={abrirGaleria} activeOpacity={0.85}>
                <View style={estilos.opcionIconoCajaSecundaria}>
                  <Text style={estilos.opcionIcono}>🖼️</Text>
                </View>
                <Text style={estilos.opcionTextoSecundaria}>Subir Galería</Text>
              </TouchableOpacity>

            </View>

            <TouchableOpacity style={estilos.modalCerrarIcono} onPress={() => setModalVisible(false)}>
              <Text style={estilos.modalCerrarTextoAbsoluto}>✕</Text>
            </TouchableOpacity>

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
  boton: {
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderStyle: 'dashed', borderRadius: 10, padding: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  botonError: { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  icono: { fontSize: 28, marginBottom: 8 },
  botonTexto: { fontSize: 15, fontWeight: '700', color: '#4338CA' },
  botonSub: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 4 },

  previewContenedor: { borderRadius: 10, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: 200 },
  btnEliminar: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(211, 47, 47, 0.9)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8,
  },
  btnEliminarTexto: { color: '#FFF', fontWeight: 'bold' },

  // ── Modal Premium ──
  modalFondo: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCaja: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 30, paddingTop: 16,
    position: 'relative',
  },
  modalDragIndicator: {
    width: 46, height: 5, backgroundColor: '#E2E8F0',
    borderRadius: 3, alignSelf: 'center', marginBottom: 20,
  },
  modalTitulo: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  modalSubtitulo: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  modalCerrarIcono: {
    position: 'absolute', top: 20, right: 20,
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCerrarTextoAbsoluto: { fontSize: 16, fontWeight: '900', color: '#64748B' },

  opcionesGrid: { gap: 14 },

  // Botón Cámara (Primario)
  opcionBtnPrimaria: {
    backgroundColor: '#EEF2FF', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#C7D2FE',
  },
  opcionIconoCajaPrimaria: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  opcionTextoPrimaria: { fontSize: 18, fontWeight: '800', color: '#4338CA', flex: 1 },
  opcionBadge: {
    backgroundColor: '#4338CA', color: '#FFF', fontSize: 10, fontWeight: '900',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', textTransform: 'uppercase'
  },

  // Botón Galería (Secundario)
  opcionBtnSecundaria: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: '#E2E8F0',
  },
  opcionIconoCajaSecundaria: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  opcionTextoSecundaria: { fontSize: 18, fontWeight: '700', color: '#475569', flex: 1 },
  opcionIcono: { fontSize: 24 },
});
