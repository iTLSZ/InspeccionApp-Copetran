// services/offline.js
// Manejo de reportes en modo sin conexión usando AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { appendRow, uploadPhoto } from './googleSheets';

const STORAGE_KEY = '@busetas_pendientes';

/**
 * Guarda un reporte localmente cuando no hay conexión
 * @param {Object} reporte - Datos del reporte
 */
export async function saveLocal(reporte) {
  const pendientes = await getPending();
  const nuevo = {
    ...reporte,
    _id: `local_${Date.now()}`,
    _guardadoEn: new Date().toISOString(),
  };
  pendientes.push(nuevo);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pendientes));
  return nuevo._id;
}

/**
 * Retorna todos los reportes pendientes de sincronizar
 * @returns {Array} Lista de reportes locales
 */
export async function getPending() {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Elimina un reporte local por su ID
 * @param {string} id - ID del reporte local
 */
async function removePending(id) {
  const pendientes = await getPending();
  const filtrados = pendientes.filter((r) => r._id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
}

/**
 * Sincroniza todos los reportes pendientes con Google Sheets
 * @param {Function} onProgress - Callback con (sincronizados, total)
 * @returns {Object} { exitosos, fallidos }
 */
export async function syncPending(onProgress) {
  const pendientes = await getPending();
  let exitosos = 0;
  let fallidos = 0;

  for (let i = 0; i < pendientes.length; i++) {
    const reporte = pendientes[i];
    try {
      // Si tiene foto local, subirla primero
      if (reporte._fotoUri && !reporte.linkFoto) {
        const nombre = `buseta_${reporte.placa}_${Date.now()}.jpg`;
        reporte.linkFoto = await uploadPhoto(reporte._fotoUri, nombre);
      }

      await appendRow(reporte);
      await removePending(reporte._id);
      exitosos++;
    } catch (error) {
      console.error(`Error sincronizando reporte ${reporte._id}:`, error);
      fallidos++;
    }

    onProgress?.(i + 1, pendientes.length);
  }

  return { exitosos, fallidos };
}
