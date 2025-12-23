import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { ThemedText } from "../../components/ThemedText";
import colors from "../../theme/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <ThemedText type="title">Login to your account</ThemedText>
              <ThemedText style={{ textAlign: "center", color: colors.muted }}>
                Your admin should have provided you with your login information.
              </ThemedText>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Placeholder"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!loading}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity
                      style={styles.inputIcon}
                      onPress={() => setEmail("")}
                      disabled={loading}
                    >
                      <MaterialIcons
                        name="close"
                        size={20}
                        color={colors.muted}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••••"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.inputIcon}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "Logging in..." : "Log in"}
                </Text>
              </TouchableOpacity>

              {/* Terms Text */}
              <TouchableOpacity onPress={() => router.push("/termsModal")}>
                <Text style={styles.termsText}>
                  By continuing you agree to the Terms of Service and Privacy
                  Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOnTop,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  titleSection: {
    marginTop: 24,
    gap: 12,
    alignItems: "center",
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundOnTop,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
  },
  bottomSection: {
    gap: 16,
    paddingBottom: 24,
  },
  loginButton: {
    backgroundColor: "#4F62E8",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: colors.text,
    fontWeight: "500",
  },
});
