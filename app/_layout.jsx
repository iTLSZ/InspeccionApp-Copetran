import { Stack } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';

export default function Layout() {
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
        maxWidth: Platform.OS === 'web' ? 500 : '100%',
        alignSelf: 'center',
        backgroundColor: '#FAFAFA'
    }
});
