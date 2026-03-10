import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const APPS_SCRIPT_URL = extra.EXPO_PUBLIC_APPS_SCRIPT_URL || '';
export const NOMBRE_EMPRESA = extra.NOMBRE_EMPRESA || 'InspeccionApp Copetran';
