// app.config.js
// Configuración de Expo — lee variables del archivo .env

module.exports = {
  expo: {
    name: 'InspeccionApp',
    slug: 'inspeccion-app',
    version: '1.1.0',
    orientation: 'portrait',
    icon: './public/logoouser.png',
    splash: { backgroundColor: '#09090B' },
    scheme: 'inspeccionapp',
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          "photosPermission": "Necesitamos acceso a tus fotos para seleccionar evidencia.",
          "cameraPermission": "Necesitamos acceso a la cámara para capturar evidencia fotográfica."
        }
      ]
    ],
    extra: {
      EXPO_PUBLIC_APPS_SCRIPT_URL: process.env.EXPO_PUBLIC_APPS_SCRIPT_URL,
      NOMBRE_EMPRESA: process.env.NOMBRE_EMPRESA || 'COPETRAN',
      eas: {
        projectId: "2bec1d05-2096-4f53-b25e-2bf008673771"
      }
    },
    android: {
      adaptiveIcon: { foregroundImage: './public/logoouser.png', backgroundColor: '#1565C0' },
      package: 'com.copetran.inspeccionapp',
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'INTERNET', 'ACCESS_NETWORK_STATE'],
    },
    ios: {
      bundleIdentifier: 'com.copetran.inspeccionapp',
      infoPlist: {
        NSCameraUsageDescription: 'Necesitamos acceso a la cámara para capturar evidencia fotográfica.',
        NSPhotoLibraryUsageDescription: 'Necesitamos acceso a tus fotos para seleccionar evidencia.',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './public/logoouser.png',
      icon: './public/logoouser.png',
      name: 'COPETRAN',
      shortName: 'COPETRAN',
      description: 'Reporte de daños de equipos Copetran',
      themeColor: '#1565C0',
      backgroundColor: '#1565C0',
      startUrl: '/',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      lang: 'es',
    },
    experiments: {
      baseUrl: ''
    }
  },
};
