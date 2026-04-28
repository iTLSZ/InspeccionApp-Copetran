// services/googleSheets.js
// Servicio interactuando mediante Google Apps Script Proxy

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { APPS_SCRIPT_URL } from '../app/config';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convierte una URL de Google Drive a un thumbnail directo que funciona en web.
 * - /file/d/{ID}/view    → thumbnail directo
 * - /open?id={ID}        → thumbnail directo
 * - export=view          → thumbnail directo
 * URLs que ya son directas o de otros dominios se devuelven sin cambios.
 */
export function normalizeImageUrl(url) {
  if (!url) return null;
  try {
    // Extraer el ID de distintos formatos de URL de Google Drive
    let fileId = null;

    const matchView = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchView) fileId = matchView[1];

    if (!fileId) {
      const matchOpen = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchOpen) fileId = matchOpen[1];
    }

    if (fileId) {
      // Thumbnail de Google Drive que funciona sin autenticación en web
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  } catch (_) {}
  return url; // Devolver sin cambios si no es URL de Drive
}


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

  const totalFilas = filas.length;
  return filas.slice(-limite).reverse().map((fila, idx) => {
    // rowIndex real en Sheets (fila 1 = encabezado, filas de datos desde 2)
    const rowIndex = totalFilas - idx; // Fila real en el sheet (2 = primera fila de datos)
    let f = fila[0] || '';
    if (f.includes('T')) {
      const [yyyy, mm, dd] = f.split('T')[0].split('-');
      f = `${dd}/${mm}/${yyyy}`;
    }
    
    return {
      id: `row_${idx}`,
      rowIndex,
      fecha:        f,
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
    };
  });
}

// ─── Editar fila existente ────────────────────────────────────────────────────

/**
 * Actualiza una fila existente en Google Sheets por su rowIndex (base 2, encabezado en fila 1).
 * Si se proporciona _fotoUri, se sube y vincula la imagen.
 */
export async function updateRow(rowIndex, reporte) {
  const fila = [
    reporte.fecha,
    reporte.hora,
    reporte.poblacion,
    reporte.numeroBuseta,
    reporte.placa,
    '',             // Foto: la maneja el script
    reporte.componente,
    reporte.descripcion,
    reporte.preliminar ? 'Sí' : 'No',
    reporte.responsable,
    reporte.observaciones || '',
  ];

  const data = await postScript({ action: 'updateRow', rowIndex, values: fila });
  if (!data.success) {
    throw new Error(`Error actualizando fila: ${data.error || 'Desconocido'}`);
  }

  // Si hay nueva foto, subirla
  if (reporte._fotoUri) {
    (async () => {
      try {
        const imageBase64 = await imageUriToBase64(reporte._fotoUri);
        if (!imageBase64) return;
        await postScript({
          action: 'insertImageRow',
          rowIndex,
          imageBase64,
          placa: reporte.placa,
        });
        console.log('[updateRow] Imagen actualizada correctamente.');
      } catch (imgErr) {
        console.warn('[updateRow] Error al subir imagen:', imgErr.message);
      }
    })();
  }

  return data;
}

// ─── Compatibilidad (no se usa, sólo por si hay código que la llame) ────────
export async function uploadPhoto() {
  console.warn('[uploadPhoto] Deprecada. La imagen se maneja en appendRow.');
  return '';
}
