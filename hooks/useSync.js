// hooks/useSync.js
// Hook para manejar la sincronización offline y detectar conectividad

import { useState, useEffect, useCallback } from 'react';
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
      if (!tieneInternet) {
        setConectado(false);
        return;
      }
      try {
        // Hacemos una llamada ligera para verificar si nuestra nube Excel responde
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de tiempo de espera

        const res = await fetch(APPS_SCRIPT_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        // Si responde cualquier texto, asumimos éxito (no importa si es JSON válido)
        const text = await res.text();
        const respondeConexion = res.ok && text.length > 0;

        setConectado(respondeConexion);

        // Auto-sincronizar al recuperar conexión
        if (respondeConexion) {
          sincronizar();
        }
      } catch (error) {
        console.log("No se pudo contactar al Excel:", error.message);
        setConectado(false); // Hay internet, pero el Excel no está alcanzable
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const estaConectado = state.isConnected && state.isInternetReachable !== false;
      checkConexionConExcel(estaConectado);
    });

    // Validar por primera vez al encender la app
    NetInfo.fetch().then(state => checkConexionConExcel(state.isConnected && state.isInternetReachable !== false));

    return () => unsubscribe();
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
