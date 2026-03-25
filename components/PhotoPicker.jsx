// components/PhotoPicker.jsx
// Selector de foto: cámara o galería, con miniatura y opción de eliminar

import React from 'react';
import {
  View, Text, TouchableOpacity, Image, StyleSheet, Alert, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export function PhotoPicker({ uri, onChange, error }) {
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
      const resp = window.confirm("¿Deseas tomar la foto con la CÁMARA?\n(Pulsa Aceptar para Cámara, Cancelar para Galería)");
      if (resp) {
        abrirCamara();
      } else {
        abrirGaleria();
      }
      return;
    }
    Alert.alert('Evidencia fotográfica', 'Selecciona la fuente', [
      { text: '📷 Cámara', onPress: abrirCamara },
      { text: '🖼 Galería', onPress: abrirGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
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
        <TouchableOpacity style={[estilos.boton, error && estilos.botonError]} onPress={elegirFuente}>
          <Text style={estilos.icono}>📷</Text>
          <Text style={estilos.botonTexto}>Agregar foto de evidencia</Text>
          <Text style={estilos.botonSub}>Toca para abrir cámara o galería</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={estilos.textoError}>⚠ {error}</Text>}
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
  icono: { fontSize: 32, marginBottom: 8 },
  botonTexto: { fontSize: 15, fontWeight: '600', color: '#1565C0' },
  botonSub: { fontSize: 12, color: '#9E9E9E', marginTop: 4 },
  previewContenedor: { borderRadius: 10, overflow: 'hidden' },
  preview: { width: '100%', height: 200, borderRadius: 10 },
  btnEliminar: {
    backgroundColor: '#FFEBEE', paddingVertical: 8,
    alignItems: 'center', marginTop: 8, borderRadius: 8,
  },
  btnEliminarTexto: { color: '#D32F2F', fontWeight: '600', fontSize: 13 },
  textoError: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
});
