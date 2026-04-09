// Copia los archivos PWA estáticos al directorio de salida docs/
import { copyFileSync, writeFileSync, existsSync } from 'fs';

const assets = [
  ['public/ICON.png', 'docs/ICON.png'],
  ['public/manifest.json', 'docs/manifest.json'],
  ['public/service-worker.js', 'docs/service-worker.js'],
];

if (!existsSync('docs')) {
  console.error('❌ El directorio docs/ no existe. Ejecuta primero expo export.');
  process.exit(1);
}

for (const [src, dest] of assets) {
  if (!existsSync(src)) {
    console.error(`❌ Archivo fuente no encontrado: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, dest);
}

writeFileSync('docs/.nojekyll', '');

console.log('✅ PWA assets copiados a docs/');
