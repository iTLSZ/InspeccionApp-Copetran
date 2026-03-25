// components/FormField.jsx
// Input reutilizable con label, validación y mensaje de error

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const COLORES = {
  primario: '#1565C0',
  error: '#D32F2F',
  gris: '#616161',
  grisSuave: '#F5F5F5',
  borde: '#E0E0E0',
  bordeActivo: '#1565C0',
};

export function FormField({
  label,
  valor,
  onChange,
  error,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  obligatorio = false,
  editable = true,
  numberOfLines = 1,
  compact = false,
}) {
  const [activo, setActivo] = React.useState(false);

  return (
    <View style={[estilos.contenedor, compact && estilos.contenedorCompacto]}>
      <Text style={[estilos.label, compact && estilos.labelCompacto]}>
        {label}
        {obligatorio && <Text style={estilos.asterisco}> *</Text>}
      </Text>

      <TextInput
        style={[
          estilos.input,
          compact && estilos.inputCompacto,
          multiline && estilos.inputMultiline,
          activo && estilos.inputActivo,
          error && estilos.inputError,
          !editable && estilos.inputDeshabilitado,
        ]}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#BDBDBD"
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={() => setActivo(true)}
        onBlur={() => setActivo(false)}
        textAlignVertical={multiline ? 'top' : 'center'}
      />

      {error && (
        <Text style={estilos.textoError}>⚠ {error}</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  contenedorCompacto: {
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORES.gris,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelCompacto: {
    fontSize: 11,
    marginBottom: 4,
  },
  asterisco: {
    color: COLORES.error,
  },
  input: {
    backgroundColor: COLORES.grisSuave,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
  },
  inputCompacto: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    borderRadius: 8,
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: 12,
  },
  inputActivo: {
    borderColor: COLORES.bordeActivo,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: COLORES.error,
    backgroundColor: '#FFF8F8',
  },
  inputDeshabilitado: {
    opacity: 0.6,
  },
  textoError: {
    color: COLORES.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
