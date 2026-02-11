import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>¡Oops! Algo salió mal.</Text>
                    <Text style={styles.subtitle}>
                        Ha ocurrido un error inesperado.
                    </Text>
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            {this.state.error && this.state.error.toString()}
                        </Text>
                    </View>
                    <Pressable
                        style={styles.button}
                        onPress={() => window.location.reload()}
                    >
                        <Text style={styles.buttonText}>Recargar Página</Text>
                    </Pressable>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#001220',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 20,
    },
    errorBox: {
        backgroundColor: 'rgba(255,0,0,0.1)',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,0.3)',
        marginBottom: 30,
        width: '100%',
        maxWidth: 500,
    },
    errorText: {
        color: '#ff6b6b',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    button: {
        backgroundColor: '#0d5c75',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    }
});
