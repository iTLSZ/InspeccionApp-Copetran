// app.config.js
// Configuración de Expo — lee variables del archivo .env

module.exports = {
  expo: {
    name: 'InspeccionApp',
    slug: 'inspeccion-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: { backgroundColor: '#1565C0' },
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
      NOMBRE_EMPRESA: process.env.NOMBRE_EMPRESA || 'InspeccionApp Copetran',
    },
    android: {
      adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#1565C0' },
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
    web: { bundler: 'metro' },
    experiments: {
      baseUrl: '/InspeccionApp-Copetran'
    }
  },
};
