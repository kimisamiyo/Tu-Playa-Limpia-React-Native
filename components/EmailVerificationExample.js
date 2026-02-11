// ═══════════════════════════════════════════════════════════════════════════
// EJEMPLO DE USO - SERVICIO DE EMAIL
// ═══════════════════════════════════════════════════════════════════════════
// Este es un ejemplo de cómo implementar verificación de email en tu app
// Puedes copiar y adaptar este código a tus necesidades
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  sendVerificationEmail,
  generateVerificationCode,
  validateEmail,
} from "../utils/emailService";

export default function EmailVerificationExample() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("email"); // 'email' or 'code'
  const [timer, setTimer] = useState(0);

  // Temporizador para reenvío
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendCode = async () => {
    // Validar email
    if (!validateEmail(email)) {
      Alert.alert("❌ Error", "Por favor ingresa un email válido");
      return;
    }

    setLoading(true);

    try {
      // Generar código de 6 dígitos
      const verificationCode = generateVerificationCode();

      // Enviar email
      const result = await sendVerificationEmail({
        toEmail: email,
        toName: email.split("@")[0], // Usar parte del email como nombre
        verificationCode: verificationCode,
      });

      if (result.success) {
        setSentCode(verificationCode);
        setStep("code");
        setTimer(60); // 60 segundos para reenviar
        Alert.alert(
          "✉️ Código Enviado",
          `Hemos enviado un código de verificación a ${email}`,
        );
      } else {
        Alert.alert(
          "❌ Error",
          result.message || "No se pudo enviar el correo",
        );
      }
    } catch (error) {
      Alert.alert("❌ Error", "Ocurrió un error inesperado");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      Alert.alert("❌ Error", "El código debe tener 6 dígitos");
      return;
    }

    if (code === sentCode) {
      Alert.alert(
        "✅ ¡Verificado!",
        "Tu email ha sido verificado exitosamente",
        [
          {
            text: "Continuar",
            onPress: () => {
              // Aquí puedes navegar a la siguiente pantalla
              console.log("Email verificado:", email);
            },
          },
        ],
      );
    } else {
      Alert.alert("❌ Error", "El código es incorrecto. Inténtalo de nuevo.");
    }
  };

  const handleResendCode = () => {
    if (timer > 0) return;
    handleSendCode();
  };

  if (step === "email") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient colors={["#0ea5e9", "#3b82f6"]} style={styles.gradient}>
          <View style={styles.content}>
            <Ionicons name="mail" size={80} color="#fff" />
            <Text style={styles.title}>Verificación de Email</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo para recibir un código de verificación
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Enviar Código</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#0ea5e9", "#3b82f6"]} style={styles.gradient}>
        <View style={styles.content}>
          <Ionicons name="shield-checkmark" size={80} color="#fff" />
          <Text style={styles.title}>Ingresa el Código</Text>
          <Text style={styles.subtitle}>
            Enviamos un código de 6 dígitos a{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
            <Text style={styles.buttonText}>Verificar</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>¿No recibiste el código?</Text>
            <TouchableOpacity onPress={handleResendCode} disabled={timer > 0}>
              <Text
                style={[
                  styles.resendButton,
                  timer > 0 && styles.resendButtonDisabled,
                ]}
              >
                {timer > 0 ? `Reenviar en ${timer}s` : "Reenviar código"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setStep("email");
              setCode("");
            }}
          >
            <Text style={styles.backButton}>← Cambiar email</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  emailText: {
    fontWeight: "700",
    color: "#0ea5e9",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    fontSize: 16,
    color: "#1a1a1a",
  },
  codeContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 10,
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  button: {
    width: "100%",
    backgroundColor: "#0ea5e9",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resendText: {
    color: "#666",
    fontSize: 13,
    marginBottom: 5,
  },
  resendButton: {
    color: "#0ea5e9",
    fontSize: 14,
    fontWeight: "700",
  },
  resendButtonDisabled: {
    color: "#94a3b8",
  },
  backButton: {
    color: "#666",
    fontSize: 14,
    marginTop: 20,
    textDecorationLine: "underline",
  },
});
