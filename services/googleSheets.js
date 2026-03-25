// services/googleSheets.js
// Servicio interactuando mediante Google Apps Script Proxy

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { APPS_SCRIPT_URL } from '../app/config';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function imageUriToBase64(uri) {
  if (!uri) return null;
  try {
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
  } catch (e) {
    console.warn('[imageUriToBase64] Error:', e.message);
    return null;
  }
}

async function postScript(body) {
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Respuesta inválida del servidor: ${text.substring(0, 120)}`);
  }
}

// ─── Google Sheets ───────────────────────────────────────────────────────────

/**
 * PASO 1 — Agrega la fila de texto al Sheet (siempre funciona con el script actual)
 * PASO 2 — Intenta insertar la imagen incrustada (requiere script actualizado, falla en silencio si no)
 */
export async function appendRow(reporte) {
  // Construir fila — columna 6 (índice 5) queda vacía, el script la llena con la imagen
  const fila = [
    reporte.fecha,
    reporte.hora,
    reporte.poblacion,
    reporte.numeroBuseta,
    reporte.placa,
    '',            // Foto: la maneja el script
    reporte.componente,
    reporte.descripcion,
    reporte.preliminar ? 'Sí' : 'No',
    reporte.responsable,
    reporte.observaciones || '',
  ];

  // ── PASO 1: guardar fila de texto (probado y funcional) ──────────────────
  const data = await postScript({ action: 'appendRow', values: fila });
  if (!data.success) {
    throw new Error(`Error en el Script: ${data.error || 'Desconocido'}`);
  }

  // ── PASO 2: insertar imagen (opcional, no bloquea si falla) ──────────────
  if (reporte._fotoUri) {
    // No await para no bloquear la confirmación al usuario
    (async () => {
      try {
        const imageBase64 = await imageUriToBase64(reporte._fotoUri);
        if (!imageBase64) return;

        const imgData = await postScript({
          action: 'insertImageLastRow',
          imageBase64,
          placa: reporte.placa,
        });

        if (imgData.success) {
          console.log('[appendRow] Imagen incrustada correctamente en Excel.');
        } else {
          console.warn('[appendRow] Script no soporta insertImageLastRow aún:', imgData.error);
        }
      } catch (imgErr) {
        console.warn('[appendRow] Error no crítico al incrustar imagen:', imgErr.message);
      }
    })();
  }

  return data;
}

// ─── Google Sheets — Leer reportes ──────────────────────────────────────────

export async function getRows(limite = 20) {
  console.log('FETCHING URL:', APPS_SCRIPT_URL);
  const response = await fetch(APPS_SCRIPT_URL);
  if (!response.ok) throw new Error('Error al conectar con Apps Script');

  let text = '';
  let data;
  try {
    text = await response.text();
    data = JSON.parse(text);
  } catch (error) {
    console.error('Respuesta cruda que no es JSON:', text.substring(0, 300));
    throw new Error('Error parseando JSON: ' + error.message);
  }

  if (!data.success) throw new Error(data.error);

  const filas = data.values || [];

  return filas.slice(-limite).reverse().map((fila, idx) => ({
    id: `row_${idx}`,
    fecha:        fila[0]  || '',
    hora:         fila[1]  || '',
    poblacion:    fila[2]  || '',
    numeroBuseta: fila[3]  || '',
    placa:        fila[4]  || '',
    linkFoto:     fila[11] || fila[5] || '',  // col 12 = URL foto para la app, col 6 = fallback
    componente:   fila[6]  || '',
    descripcion:  fila[7]  || '',
    preliminar:   fila[8]  === 'Sí',
    responsable:  fila[9]  || '',
    observaciones:fila[10] || '',
  }));
}

// ─── Compatibilidad (no se usa, sólo por si hay código que la llame) ────────
export async function uploadPhoto() {
  console.warn('[uploadPhoto] Deprecada. La imagen se maneja en appendRow.');
  return '';
}
