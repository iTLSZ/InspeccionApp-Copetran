// app.config.js
// Configuración de Expo — lee variables del archivo .env

module.exports = {
  expo: {
    name: 'InspeccionApp',
    slug: 'inspeccion-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './public/ICON.png',
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
      adaptiveIcon: { foregroundImage: './public/ICON.png', backgroundColor: '#1565C0' },
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
      favicon: './public/ICON.png',
      name: 'InspeccionApp Copetran',
      shortName: 'InspeccionApp',
      description: 'Reporte de daños de equipos Copetran',
      themeColor: '#1565C0',
      backgroundColor: '#1565C0',
      startUrl: '/InspeccionApp-Copetran/',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/InspeccionApp-Copetran/',
      lang: 'es',
      icon: './public/ICON.png',
    },
    experiments: {
      baseUrl: '/InspeccionApp-Copetran'
    }
  },
};
