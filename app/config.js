import Constants from 'expo-constants';

export const APPS_SCRIPT_URL = process.env.EXPO_PUBLIC_APPS_SCRIPT_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_APPS_SCRIPT_URL || '';
export const NOMBRE_EMPRESA = process.env.EXPO_PUBLIC_NOMBRE_EMPRESA || Constants.expoConfig?.extra?.NOMBRE_EMPRESA || 'InspeccionApp Copetran';
