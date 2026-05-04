import { Stack } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { useEffect } from 'react';

// Inyecta estilos críticos de desktop directamente en el DOM para que
// se apliquen ANTES de que React Native Web recalcule dimensiones.
function useDesktopLayout() {
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const styleId = 'desktop-layout-fix';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                overflow: hidden !important;
            }

            /* Escritorio: fondo y centrado */
            @media (min-width: 600px) {
                html, body {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
                }
                #root {
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    height: 100% !important;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%) !important;
                }
                #root > div {
                    max-width: 430px !important;
                    width: 100% !important;
                    height: 100dvh !important;
                    max-height: 900px !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08) !important;
                }
            }

            /* Móvil: pantalla completa */
            @media (max-width: 599px) {
                #root {
                    display: flex !important;
                    height: 100% !important;
                }
                #root > div {
                    width: 100% !important;
                    height: 100dvh !important;
                }
            }
        `;
        // Insertar al inicio del <head> para máxima prioridad
        document.head.insertBefore(style, document.head.firstChild);
    }, []);
}

export default function Layout() {
    useDesktopLayout();

    return (
        <View style={styles.container}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                    name="nuevo-reporte"
                    options={{
                        headerShown: false,
                        presentation: 'modal',
                        animation: 'slide_from_bottom'
                    }}
                />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        maxWidth: Platform.OS === 'web' ? 430 : '100%',
        alignSelf: 'center',
        backgroundColor: '#09090B',
    }
});

