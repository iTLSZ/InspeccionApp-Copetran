// app/nuevo-reporte.jsx
// Formulario ultra-compacto (una sola pantalla, sin scroll si es posible)

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Alert, ActivityIndicator, Platform, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { FormField } from '../components/FormField';
import { PoblacionPicker } from '../components/PoblacionPicker';
import { ComponentePicker } from '../components/ComponentePicker';
import { PhotoPicker } from '../components/PhotoPicker';
import { useForm } from '../hooks/useForm';
import { appendRow } from '../services/googleSheets';
import { saveLocal } from '../services/offline';
import NetInfo from '@react-native-community/netinfo';
import { MaterialIcons } from '@expo/vector-icons';

export default function NuevoReporte({ onGuardado }) {
  const router = useRouter();
  const { campos, errores, enviando, setEnviando, setcampo, validar, resetear } = useForm();
  const [confirmado, setConfirmado] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Lógica para "OTRO" componente
  const [mostrarOtro, setMostrarOtro] = useState(false);

  useEffect(() => {
    resetear();
    setMostrarOtro(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const selectComponente = (v) => {
    setcampo('componente', v);
    setMostrarOtro(v === 'OTRO');
  };

  const handleEnviar = async () => {
    if (enviando || confirmado) return;
    
    // Validación manual rápida para el campo "OTRO" si es necesario
    if (campos.componente === 'OTRO' && !campos.otroComponente) {
      Alert.alert('Falta campo', 'Escribe el nombre del otro componente');
      return;
    }

    if (!validar()) {
      Alert.alert('Campos requeridos', 'Completa los campos en rojo');
      return;
    }

    setEnviando(true);
    try {
      let hayConexion = false;
      if (Platform.OS === 'web') {
        hayConexion = navigator.onLine;
      } else {
        const netState = await NetInfo.fetch();
        hayConexion = netState.isConnected && netState.isInternetReachable !== false;
      }

      const compFinal = campos.componente === 'OTRO' ? campos.otroComponente?.toUpperCase() : campos.componente;

      const reporte = {
        fecha: campos.fecha,
        hora: campos.hora,
        poblacion: campos.poblacion,
        numeroBuseta: campos.numeroBuseta,
        placa: campos.placa,
        linkFoto: '',
        componente: compFinal,
        descripcion: campos.descripcion,
        preliminar: campos.preliminar,
        responsable: campos.responsable,
        observaciones: campos.observaciones,
        _fotoUri: campos.fotoUri,
      };

      if (hayConexion) {
        appendRow(reporte).catch(async (err) => {
          console.error('Error silencioso, guardando local', err.message);
          await saveLocal(reporte);
        });

        setConfirmado(true);
        setTimeout(() => {
          setConfirmado(false);
          resetear();
          setMostrarOtro(false);
          if (onGuardado) onGuardado();
          router.back();
        }, 600);
      } else {
        await saveLocal(reporte);
        Alert.alert(
          '📱 Guardado sin conexión',
          'Guardado localmente. Se sincronizará al recuperar internet.',
          [{ text: 'Entendido', onPress: () => { resetear(); setMostrarOtro(false); onGuardado?.(); } }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `${error.message}`, [{ text: 'OK' }]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Animated.View style={[estilos.contenedor, { opacity: fadeAnim }]}>
      
      {/* HEADER MÍNIMO COMPACTO */}
      <View style={estilos.headerMini}>
        <TouchableOpacity onPress={() => router.back()} style={estilos.btnVolver}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={estilos.headerTitulo}>Nuevo Reporte</Text>
        <TouchableOpacity style={estilos.btnLimpiar} onPress={() => { resetear(); setMostrarOtro(false); }}>
          <Text style={estilos.btnLimpiarTexto}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* BLOQUE COMPACTO BLANCO */}
        <View style={estilos.panelUnico}>
          
          {/* Fila 1: Fecha, Hora, Placa */}
          <View style={estilos.filaForm}>
            <View style={{ flex: 1.2 }}>
              <FormField label="Fecha/Hora" valor={`${campos.fecha} ${campos.hora}`} editable={false} placeholder="Auto" compact />
            </View>
            <View style={{ flex: 1, paddingLeft: 6 }}>
              <FormField label="Placa*" valor={campos.placa} onChange={(v) => setcampo('placa', v.toUpperCase())}
                error={errores.placa} autoCapitalize="characters" placeholder="ABC123" compact />
            </View>
            <View style={{ flex: 1, paddingLeft: 6 }}>
              <FormField label="Buseta" valor={campos.numeroBuseta} onChange={(v) => setcampo('numeroBuseta', v.replace(/\D/g, ''))}
                keyboardType="numeric" placeholder="001" compact />
            </View>
          </View>

          {/* Fila 2: Población + Responsable */}
          <View style={estilos.filaForm}>
            <View style={{ flex: 1, paddingRight: 4, zIndex: 10 }}>
              <PoblacionPicker valor={campos.poblacion} onChange={(v) => setcampo('poblacion', v)} compact />
            </View>
            <View style={{ flex: 1.2, paddingLeft: 4 }}>
              <FormField label="Responsable*" valor={campos.responsable} onChange={(v) => setcampo('responsable', v)} 
                error={errores.responsable} placeholder="Conductor" compact autoCapitalize="words" />
            </View>
          </View>

          {/* Línea divisoria */}
          <View style={estilos.divider} />

          {/* Fila 3: Daño (Componente + Foto lateral) */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4, zIndex: 5 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <ComponentePicker valor={campos.componente} onChange={selectComponente} error={errores.componente} compact />
              
              {mostrarOtro && (
                <View style={{ marginTop: 2 }}>
                  <FormField label="Escribe el componente*" valor={campos.otroComponente} 
                    onChange={(v) => setcampo('otroComponente', v)} placeholder="Especifique..." compact />
                </View>
              )}
            </View>

            <View style={{ width: 85 }}>
              <Text style={[estilos.labelCompact, { marginBottom: 6 }]}>EVIDENCIA</Text>
              <PhotoPicker uri={campos.fotoUri} onChange={(v) => setcampo('fotoUri', v)} error={errores.fotoUri} compact />
            </View>
          </View>

          {/* Fila 4: Descripción completa */}
          <FormField label="Descripción del hallazgo*" valor={campos.descripcion} 
            onChange={(v) => setcampo('descripcion', v)} error={errores.descripcion}
            multiline numberOfLines={3} placeholder="Detalle del daño..." compact />

          <FormField label="Observaciones (opcional)" valor={campos.observaciones}
            onChange={(v) => setcampo('observaciones', v)} multiline numberOfLines={2} placeholder="Notas extra..." compact />

          {/* Fila 5: Switch Preliminar + Botón de Envío */}
          <View style={estilos.filaFinal}>
            <View style={estilos.switchCaja}>
              <Switch value={campos.preliminar} onValueChange={(v) => setcampo('preliminar', v)}
                trackColor={{ false: '#E2E8F0', true: '#C7D2FE' }} thumbColor={campos.preliminar ? '#6366F1' : '#CBD5E1'} />
              <Text style={estilos.switchTexto}>Es Preliminar</Text>
            </View>

            <TouchableOpacity style={[estilos.btnEnviar, enviando && estilos.btnEnviando]} onPress={handleEnviar} disabled={enviando}>
              {enviando ? <ActivityIndicator color="#FFF" /> : (
                <Text style={estilos.btnEnviarTexto}>GUARDAR REPORTE</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* OVERLAY EXITO */}
      {confirmado && (
        <View style={estilos.overlay}>
          <View style={estilos.overlayCirculo}><MaterialIcons name="check" size={40} color="#FFF" /></View>
          <Text style={estilos.overlayTitulo}>Guardado</Text>
        </View>
      )}

    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EFF6FF' },
  
  // Header súper mínimo
  headerMini: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 10, paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
  },
  btnVolver: { paddingRight: 10 },
  headerTitulo: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  btnLimpiar: { paddingLeft: 10 },
  btnLimpiarTexto: { color: '#6366F1', fontSize: 14, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, paddingBottom: 20 },

  // Panel unificado para evitar scroll
  panelUnico: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 12,
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },

  filaForm: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  labelCompact: { fontSize: 11, fontWeight: '700', color: '#64748B' },

  // Pie final
  filaFinal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  switchCaja: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchTexto: { fontSize: 12, fontWeight: '700', color: '#475569' },
  
  // Botón enviar
  btnEnviar: {
    backgroundColor: '#4338CA', borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', flex: 1, marginLeft: 15,
  },
  btnEnviando: { opacity: 0.7 },
  btnEnviarTexto: { color: '#FFF', fontSize: 14, fontWeight: '800' },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  overlayCirculo: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  overlayTitulo: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 15 },
});
