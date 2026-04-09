// Configuración Expo — variables en .env o al ejecutar export
//
// • Desarrollo local:  npm run web  → abrís http://localhost:8081/ (sin subcarpeta)
// • GitHub Pages:     npm run deploy  define EXPO_PUBLIC_BASE_PATH=/InspeccionApp-Copetran

const raw = process.env.EXPO_PUBLIC_BASE_PATH;
const BASE_PATH =
  raw === undefined || raw === '' || raw === '/'
    ? '/'
    : String(raw).replace(/\/$/, '') || '/';

const webStart = BASE_PATH === '/' ? '/' : `${BASE_PATH}/`;
const webScope = webStart;

module.exports = {
  expo: {
    name: 'InspeccionApp',
    slug: 'inspeccion-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './public/ICON.png',
    splash: { backgroundColor: '#F8FAFC' },
    scheme: 'inspeccionapp',
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission: 'Necesitamos acceso a tus fotos para seleccionar evidencia.',
          cameraPermission: 'Necesitamos acceso a la cámara para capturar evidencia.',
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_APPS_SCRIPT_URL: process.env.EXPO_PUBLIC_APPS_SCRIPT_URL,
      NOMBRE_EMPRESA: process.env.NOMBRE_EMPRESA || 'InspeccionApp Copetran',
    },
    android: {
      adaptiveIcon: { foregroundImage: './public/ICON.png', backgroundColor: '#4338CA' },
      package: 'com.copetran.inspeccionapp',
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'INTERNET',
        'ACCESS_NETWORK_STATE',
      ],
    },
    ios: {
      bundleIdentifier: 'com.copetran.inspeccionapp',
      infoPlist: {
        NSCameraUsageDescription: 'Necesitamos acceso a la cámara para capturar evidencia.',
        NSPhotoLibraryUsageDescription: 'Necesitamos acceso a tus fotos para seleccionar evidencia.',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './public/ICON.png',
      name: 'InspeccionApp Copetran',
      shortName: 'InspeccionApp',
      description: 'Reporte de daños de equipos Copetran',
      themeColor: '#4338CA',
      backgroundColor: '#F8FAFC',
      startUrl: webStart,
      display: 'standalone',
      orientation: 'portrait',
      scope: webScope,
      lang: 'es',
      icon: './public/ICON.png',
    },
    ...(BASE_PATH !== '/'
      ? { experiments: { baseUrl: BASE_PATH } }
      : {}),
  },
};
