// hooks/useSync.js
// Hook para manejar la sincronización offline y detectar conectividad

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getPending, syncPending } from '../services/offline';
import { APPS_SCRIPT_URL } from '../app/config';

export function useSync() {
  const [pendientes, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [conectado, setConectado] = useState(true);
  const [ultimaSync, setUltimaSync] = useState(null);

  // Actualiza el conteo de reportes pendientes
  const actualizarPendientes = useCallback(async () => {
    const lista = await getPending();
    setPendientes(lista.length);
  }, []);

  // Sincroniza todos los pendientes
  const sincronizar = useCallback(async () => {
    if (sincronizando || !conectado) return;
    setSincronizando(true);
    try {
      const resultado = await syncPending();
      await actualizarPendientes();
      setUltimaSync(new Date());
      return resultado;
    } catch (error) {
      console.error('Error en sincronización:', error);
    } finally {
      setSincronizando(false);
    }
  }, [sincronizando, conectado, actualizarPendientes]);

  // Monitorear conectividad y auto-sincronizar
  useEffect(() => {
    actualizarPendientes();

    const checkConexionConExcel = async (tieneInternet) => {
      // Ignorar chequeo si está explícitamente sin internet
      if (!tieneInternet) {
        setConectado(false);
        return;
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(APPS_SCRIPT_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        const text = await res.text();
        const respondeConexion = res.ok && text.length > 0;

        setConectado(respondeConexion);

        if (respondeConexion) {
          sincronizar();
        }
      } catch (error) {
        console.log("No se pudo contactar al Excel:", error.message);
        setConectado(false);
      }
    };

    if (Platform.OS === 'web') {
      // En Web los navegadores tienen su propio detector (evita bug 404 de NetInfo)
      const handleOnline = () => checkConexionConExcel(true);
      const handleOffline = () => setConectado(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Chequeo inicial
      checkConexionConExcel(navigator.onLine);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // En nativo (iOS/Android) NetInfo funciona perfecto
      const unsubscribe = NetInfo.addEventListener((state) => {
        const estaConectado = state.isConnected && state.isInternetReachable !== false;
        checkConexionConExcel(estaConectado);
      });

      NetInfo.fetch().then(state => checkConexionConExcel(state.isConnected && state.isInternetReachable !== false));

      return () => unsubscribe();
    }
  }, []);

  return {
    pendientes,
    sincronizando,
    conectado,
    ultimaSync,
    sincronizar,
    actualizarPendientes,
  };
}
