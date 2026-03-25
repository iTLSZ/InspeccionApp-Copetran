// services/googleSheets.js
// Servicio interactuando mediante Google Apps Script Proxy

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { APPS_SCRIPT_URL } from '../app/config';

// ─── Google Sheets (Mediante Apps Script) ──────────────────────────────

/**
 * Convierte una URI local de imagen a base64
 * @param {string} uri - URI local de la imagen
 */
async function imageUriToBase64(uri) {
  if (!uri) return null;
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  } else {
    return FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

/**
 * Agrega una nueva fila al Google Sheet e incrusta la imagen directamente en la celda.
 * Usa la acción 'appendRowWithImage' para que el script inserte el base64 en la hoja.
 * @param {Object} reporte - Datos del reporte de daño (incluye _fotoUri para imagen local)
 */
export async function appendRow(reporte) {
  // Convertir imagen a base64 si existe
  let imageBase64 = null;
  if (reporte._fotoUri) {
    try {
      imageBase64 = await imageUriToBase64(reporte._fotoUri);
    } catch (e) {
      console.warn('No se pudo leer imagen para incrustar:', e.message);
    }
  }

  // Orden de columnas: debe coincidir con la cabecera del Sheet
  // La columna de foto (índice 5) la manejamos con imagen incrustada, no URL
  const fila = [
    reporte.fecha,
    reporte.hora,
    reporte.poblacion,
    reporte.numeroBuseta,
    reporte.placa,
    '',  // Columna foto: el script inserta la imagen, no texto
    reporte.componente,
    reporte.descripcion,
    reporte.preliminar ? 'Sí' : 'No',
    reporte.responsable,
    reporte.observaciones || '',
  ];

  try {
    const body = imageBase64
      ? JSON.stringify({ action: 'appendRowWithImage', values: fila, imageBase64 })
      : JSON.stringify({ action: 'appendRow', values: fila });

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Servidor devolvió respuesta inválida: ${text.substring(0, 100)}...`);
    }

    if (!data.success) {
      throw new Error(`Error en el Script: ${data.error || 'Desconocido'}`);
    }
    return data;
  } catch (error) {
    console.error('Fallo en conectividad POST Excel:', error.message);
    throw error;
  }
}

/**
 * Obtiene los últimos N reportes del Google Sheet usando Apps Script
 * @param {number} limite - Cantidad de filas a traer (default 20)
 */
export async function getRows(limite = 20) {
  console.log("FETCHING URL:", APPS_SCRIPT_URL);
  const response = await fetch(APPS_SCRIPT_URL);

  if (!response.ok) throw new Error('Error al conectar con Apps Script');

  let text = '';
  let data;
  try {
    text = await response.text();
    data = JSON.parse(text);
  } catch (error) {
    console.error("Respuesta cruda que no es JSON:", text.substring(0, 300));
    throw new Error('Error parseando JSON: ' + error.message);
  }

  if (!data.success) throw new Error(data.error);

  const filas = data.values || [];

  // Tomar las últimas N filas y mapearlas a objetos
  return filas.slice(-limite).reverse().map((fila, idx) => ({
    id: `row_${idx}`,
    fecha: fila[0] || '',
    hora: fila[1] || '',
    poblacion: fila[2] || '',
    numeroBuseta: fila[3] || '',
    placa: fila[4] || '',
    linkFoto: fila[5] || '',
    componente: fila[6] || '',
    descripcion: fila[7] || '',
    preliminar: fila[8] === 'Sí',
    responsable: fila[9] || '',
    observaciones: fila[10] || '',
  }));
}

// ─── uploadPhoto ya no es necesaria ─────────────────────────────────────
// La imagen ahora se incrusta directamente en el Excel a través de appendRow.
// Se mantiene la función por compatibilidad con reportes offline si los hubiera.
export async function uploadPhoto(uri, nombre) {
  console.log('[uploadPhoto] Función deprecada: las imágenes ahora se incrustan en Excel.');
  return '';
}
