import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Redirect } from "expo-router";
import global from "../styles/global";
import { ThemedText } from "../components/ThemedText";
import { ThemedButton } from "../components/ThemedButton";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { token, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;
  if (token) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView style={global.pageWrap}>
      {/* body */}
      <View style={global.bodyWrap}>
        <View style={global.centerWrap}>
          <View style={global.textWrapLargeCenter}>
            <ThemedText>Welcome to</ThemedText>
            <ThemedText type="title">The Unnamed TMS</ThemedText>
            <ThemedText style={global.faded}>
              Your go-to app for truckers
            </ThemedText>
          </View>
        </View>
      </View>

      {/* footer */}
      <View style={global.footerWrap}>
        <View style={global.buttonWrap}>
          <ThemedButton onPress={() => router.push("/(auth)")}>
            Log in
          </ThemedButton>
          <ThemedButton
            variant="twoLines"
            onPress={() => router.push("/termsModal")}
          >
            By continuing you agree to the Terms of Service and Privacy Policy
          </ThemedButton>
        </View>
      </View>
    </SafeAreaView>
  );
}
