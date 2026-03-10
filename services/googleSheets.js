// services/googleSheets.js
// Servicio interactuando mediante Google Apps Script Proxy

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { APPS_SCRIPT_URL } from '../app/config';

// ─── Google Sheets (Mediante Apps Script) ──────────────────────────────

/**
 * Agrega una nueva fila al Google Sheet usando Apps Script
 * @param {Object} reporte - Datos del reporte de daño
 */
export async function appendRow(reporte) {
  // Orden de columnas: debe coincidir con la cabecera del Sheet
  const fila = [
    reporte.fecha,
    reporte.hora,
    reporte.poblacion,
    reporte.numeroBuseta,
    reporte.placa,
    reporte.linkFoto || '',
    reporte.componente,
    reporte.descripcion,
    reporte.preliminar ? 'Sí' : 'No',
    reporte.responsable,
    reporte.observaciones || '',
  ];

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'appendRow',
      values: fila,
    }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Error en Apps Script: ${data.error}`);
  }
  return data;
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

// ─── Google Drive (Mediante Apps Script) ───────────────────────────────

/**
 * Sube una foto a Google Drive (a través del proxy) y retorna el link
 * @param {string} uri - URI local de la imagen
 * @param {string} nombre - Nombre del archivo
 */
export async function uploadPhoto(uri, nombre) {
  let base64 = '';

  if (Platform.OS === 'web') {
    // Si estamos en la web (navegador) extrae base64 directo de la URL Object/Data
    const res = await fetch(uri);
    const blob = await res.blob();
    base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  } else {
    // Si estamos en un celular físico (Android/iOS)
    base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'uploadPhoto',
      nombre: nombre,
      base64: base64,
    }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Error subiendo foto: ${data.error}`);
  }

  // Apps Script nos devuelve la URL pública generada
  return data.link;
}
