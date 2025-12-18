import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, isLoading, login, token } = useAuthStore();

  const handleLogin = async () => {
    const result = await login(email, password);
    if (!result.success) Alert.alert("Error in handleLogin", result.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* form */}
        <View style={styles.formwrap}>
          <View style={styles.inputwrap}>
            <Text>Email</Text>
            <TextInput
              style={styles.inputfield}
              placeholder="Enter your email"
              placeholderTextColor={"#a0a0a0ff"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            ></TextInput>
          </View>
          <View style={styles.inputwrap}>
            <Text>Password</Text>
            <View style={styles.inputfield}>
              <TextInput
                style={{ flex: 1 }}
                placeholder="Enter your password"
                placeholderTextColor={"#a0a0a0ff"}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
              ></TextInput>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#808080"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* cta wrap */}
        <View style={styles.buttonwrap}>
          <View style={styles.ghostButton}>
            <Link href={"/signup"} asChild>
              <Text style={styles.fadedText}>
                Already have an account?{" "}
                <Text style={styles.ghostButtonText}>Sign up</Text>
              </Text>
            </Link>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  fadedText: {
    color: "#808080",
  },
  formwrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    flexDirection: "column",
    gap: 16,
  },
  inputwrap: {
    width: "100%",
    flexDirection: "column",
    gap: 8,
  },
  inputfield: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d1d1ff",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  buttonwrap: {
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#355BE4",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
  },
  ghostButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    textDecorationLine: "underline",
  },
  ghostButtonText: {
    color: "#355BE4",
  },
});
