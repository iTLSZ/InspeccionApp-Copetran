import { VEHICULOS_PARQUE } from './vehiculosParque';
import { COLABORADORES_PARQUE } from './colaboradoresParque';

const norm = (s) => String(s || '').trim().toLowerCase();

function puntajeInterno(queryDigitos, numeroInterno) {
  const s = String(numeroInterno);
  if (!queryDigitos) return 5;
  if (s === queryDigitos) return 0;
  if (s.startsWith(queryDigitos)) return 1;
  if (s.includes(queryDigitos)) return 2;
  return 4;
}

/**
 * Filtra vehículos por placa o N° interno.
 * Si el texto es solo números, prioriza coincidencias por N° interno (buseta).
 */
export function filtrarVehiculosParque(texto) {
  const raw = String(texto || '').trim();
  const q = norm(raw);
  if (!q) return VEHICULOS_PARQUE;

  const soloDigitos = /^\d+$/.test(raw);
  const qDigitos = soloDigitos ? raw : raw.replace(/\D/g, '');

  const candidatos = VEHICULOS_PARQUE.filter((v) => {
    const pl = norm(v.placa);
    const ni = String(v.numeroInterno);
    return pl.includes(q) || ni.includes(q) || (soloDigitos && ni.includes(raw));
  });

  if (soloDigitos && raw.length > 0) {
    candidatos.sort((a, b) => {
      const pa = puntajeInterno(raw, a.numeroInterno);
      const pb = puntajeInterno(raw, b.numeroInterno);
      if (pa !== pb) return pa - pb;
      return a.numeroInterno - b.numeroInterno;
    });
  } else if (qDigitos && qDigitos.length >= 2 && !soloDigitos) {
    candidatos.sort((a, b) => {
      const pa = puntajeInterno(qDigitos, a.numeroInterno);
      const pb = puntajeInterno(qDigitos, b.numeroInterno);
      if (pa !== pb) return pa - pb;
      return norm(a.placa).localeCompare(norm(b.placa));
    });
  }

  return candidatos;
}

/** Busca sin depender de tildes (Martinez = Martínez) */
const sinTildes = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export function filtrarColaboradoresParque(texto) {
  const q = sinTildes(texto);
  if (!q) return COLABORADORES_PARQUE;
  return COLABORADORES_PARQUE.filter((c) => {
    const blob = `${sinTildes(c.nombre)} ${sinTildes(c.cedula)} ${sinTildes(c.cargo)}`;
    return blob.includes(q);
  });
}
