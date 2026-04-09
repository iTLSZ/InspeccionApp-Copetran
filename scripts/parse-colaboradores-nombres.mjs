/**
 * Genera data/colaboradoresParque.js desde scripts/colaboradores-nombres.txt
 * (un nombre completo por línea). Uso: node scripts/parse-colaboradores-nombres.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const txtPath = path.join(__dirname, 'colaboradores-nombres.txt');

const raw = fs.readFileSync(txtPath, 'utf8');
const lines = raw
  .split(/\r?\n/)
  .map((l) => l.trim().replace(/\s+/g, ' '))
  .filter(Boolean);

const seen = new Set();
const colaboradores = [];

for (const nombre of lines) {
  const key = nombre.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  const nombreMayus = nombre.toUpperCase();
  colaboradores.push({ nombre: nombreMayus, cedula: '', cargo: '' });
}

colaboradores.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

const out = `// Generado por scripts/parse-colaboradores-nombres.mjs — editá colaboradores-nombres.txt y volvé a ejecutar el script
export const COLABORADORES_PARQUE = ${JSON.stringify(colaboradores, null, 2)};
`;

fs.writeFileSync(path.join(root, 'data', 'colaboradoresParque.js'), out, 'utf8');
console.log(`OK: ${colaboradores.length} colaboradores → data/colaboradoresParque.js`);
