import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const raw = fs.readFileSync(path.join(__dirname, 'vehiculos-parque-list.txt'), 'utf8');
const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const vehiculos = [];
const seen = new Set();

for (const line of lines) {
  if (/^placa/i.test(line) || /^n[°º]?\s*interno/i.test(line)) continue;
  const parts = line.split(/\s+/).filter(Boolean);
  if (parts.length < 2) continue;
  const last = parts[parts.length - 1];
  if (!/^\d+$/.test(last)) continue;
  const numeroInterno = parseInt(last, 10);
  const placa = parts
    .slice(0, -1)
    .join('')
    .replace(/\s/g, '')
    .toUpperCase();
  if (!placa) continue;
  const key = `${placa}-${numeroInterno}`;
  if (seen.has(key)) continue;
  seen.add(key);
  vehiculos.push({ placa, numeroInterno });
}

vehiculos.sort((a, b) => a.numeroInterno - b.numeroInterno);

const out = `// Generado por scripts/parse-vehiculos-parque.mjs — no editar a mano
export const VEHICULOS_PARQUE = ${JSON.stringify(vehiculos, null, 2)};
`;

fs.writeFileSync(path.join(root, 'data', 'vehiculosParque.js'), out, 'utf8');
console.log(`OK: ${vehiculos.length} vehículos → data/vehiculosParque.js`);
