// components/PhotoPicker.jsx
// Selector de foto: cámara o galería, con miniatura y opción de eliminar

import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function PhotoPicker({ uri, onChange, error, compact = false }) {
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
    if (!(await solicitarPermisos('camara'))) return;
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!resultado.canceled) onChange(resultado.assets[0].uri);
  };

  const abrirGaleria = async () => {
    if (!(await solicitarPermisos('galeria'))) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!resultado.canceled) onChange(resultado.assets[0].uri);
  };

  const elegirFuente = () => {
    if (Platform.OS === 'web') {
      abrirGaleria();
      return;
    }
    Alert.alert('Evidencia fotográfica', 'Selecciona la fuente', [
      { text: '📷 Cámara', onPress: abrirCamara },
      { text: '🖼 Galería', onPress: abrirGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={[estilos.contenedor, compact && estilos.contenedorCompacto]}>
      {/* Ocultamos el label si es compact para ahorrar espacio */}
      {!compact && <Text style={estilos.label}>EVIDENCIA FOTOGRÁFICA</Text>}

      {uri ? (
        <View style={estilos.previewContenedor}>
          <Image source={{ uri }} style={[estilos.preview, compact && estilos.previewCompacto]} resizeMode="cover" />
          <TouchableOpacity style={[estilos.btnEliminar, compact && estilos.btnEliminarCompacto]} onPress={() => onChange(null)}>
            <Text style={[estilos.btnEliminarTexto, compact && estilos.btnEliminarTextoCompacto]}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[estilos.boton, compact && estilos.botonCompacto, error && estilos.botonError]} onPress={elegirFuente}>
          <Text style={[estilos.icono, compact && estilos.iconoCompacto]}>📷</Text>
          {!compact && <Text style={estilos.botonTexto}>Agregar foto</Text>}
        </TouchableOpacity>
      )}

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 16 },
  contenedorCompacto: { marginBottom: 0 },
  label: {
    fontSize: 13, fontWeight: '600', color: '#616161',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  boton: {
    backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#E0E0E0',
    borderStyle: 'dashed', borderRadius: 10, padding: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  botonCompacto: { padding: 0, height: 75, width: '100%' },
  botonError: { borderColor: '#D32F2F', backgroundColor: '#FFF8F8' },
  icono: { fontSize: 32, marginBottom: 8 },
  iconoCompacto: { fontSize: 24, marginBottom: 0 },
  botonTexto: { fontSize: 13, fontWeight: '600', color: '#1565C0', marginTop: 4 },
  previewContenedor: { borderRadius: 10, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: 200, borderRadius: 10 },
  previewCompacto: { height: 75 },
  btnEliminar: {
    backgroundColor: '#FFEBEE', paddingVertical: 8,
    alignItems: 'center', marginTop: 8, borderRadius: 8,
  },
  btnEliminarCompacto: { position: 'absolute', top: 4, right: 4, marginTop: 0, width: 24, height: 24, paddingVertical: 0, justifyContent: 'center', borderRadius: 12 },
  btnEliminarTexto: { color: '#D32F2F', fontWeight: '600', fontSize: 13 },
  btnEliminarTextoCompacto: { fontSize: 10 },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
});
