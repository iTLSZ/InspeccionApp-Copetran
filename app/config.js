import Constants from 'expo-constants';

export const APPS_SCRIPT_URL = process.env.EXPO_PUBLIC_APPS_SCRIPT_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwNOlCilNEfnBuyAlqVFU6jMIKODofxk6AGpHK5Q7j610qq6ih-1DeDN5JhwOm45DKo/exec';
export const NOMBRE_EMPRESA = process.env.EXPO_PUBLIC_NOMBRE_EMPRESA || Constants.expoConfig?.extra?.NOMBRE_EMPRESA || 'InspeccionApp Copetran';
