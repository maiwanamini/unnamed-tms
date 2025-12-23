import React from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { ThemedButton } from "../components/ThemedButton";
import colors from "../theme/colors";
import global from "../styles/global";

const TermsModal = () => {
  const router = useRouter();

  const close = () => {
    try {
      router.back();
    } catch (e) {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView
      style={[global.pageWrap, { paddingHorizontal: 16, paddingVertical: 24 }]}
    >
      <View
        style={[
          global.headerWrap,
          {
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
      >
        <ThemedText type="title">Terms & Privacy</ThemedText>
        <TouchableOpacity onPress={close} accessibilityLabel="Close">
          <ThemedText style={{ color: colors.accent }}>Close</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24, gap: 20 }}
      >
        <View style={{ gap: 8 }}>
          <ThemedText type="subtitle">Terms of Service</ThemedText>
          <ThemedText style={global.faded}>
            Welcome to The Unnamed TMS. By using the app you agree to comply
            with these terms. You must provide accurate account information and
            keep your credentials secure. You are responsible for activity on
            your account. We reserve the right to update the app, suspend access
            for misuse, and modify these terms as needed. Continued use after
            updates constitutes acceptance. The app is provided "as-is"—please
            operate trucks safely and follow applicable laws.
          </ThemedText>
        </View>

        <View style={{ gap: 8 }}>
          <ThemedText type="subtitle">Privacy Policy</ThemedText>
          <ThemedText style={global.faded}>
            We collect data you provide (like account details) and operational
            data needed to manage orders and stops. We use this data to deliver
            and improve the service, communicate with you, and maintain
            security. We do not sell your personal information. Data may be
            shared with service providers under confidentiality obligations and
            as required by law. You can request access or deletion subject to
            legal and operational needs. We employ reasonable safeguards but no
            system is perfectly secure.
          </ThemedText>
        </View>

        <View style={{ gap: 8 }}>
          <ThemedText type="subtitle">Contact</ThemedText>
          <ThemedText style={global.faded}>
            For questions about these terms or privacy practices, please reach
            out to support@unnamed-tms.example.
          </ThemedText>
        </View>
      </ScrollView>

      <View style={global.buttonWrap}>
        <ThemedButton onPress={close}>I understand</ThemedButton>
      </View>
    </SafeAreaView>
  );
};

export default TermsModal;
