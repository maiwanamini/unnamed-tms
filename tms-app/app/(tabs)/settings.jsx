import * as Localization from "expo-localization";
import { useRouter } from "expo-router";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedText } from "../../components/ThemedText";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import global from "../../styles/global";
import colors from "../../theme/colors";

const normalizePhone = (input) => (input || "").replace(/\D+/g, "");
const getRegion = () => {
  try {
    const locales = Localization.getLocales?.();
    const region =
      locales && locales.length > 0
        ? locales[0].regionCode
        : Localization.region;
    return (region || "US").toUpperCase();
  } catch {
    return "US";
  }
};
const formatPhone = (input) => {
  const region = getRegion();
  const digits = normalizePhone(input);
  if (!digits) return "";
  const hasPlus = (input || "").trim().startsWith("+");
  const parseInput = hasPlus ? `+${digits}` : digits;
  try {
    const p = parsePhoneNumberFromString(parseInput, region);
    if (p) {
      return hasPlus ? p.formatInternational() : p.formatNational();
    }
  } catch {}
  return digits;
};

const Settings = () => {
  const { logout, user, token } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPhone, setEditPhone] = useState(
    user?.phone ? formatPhone(user.phone) : ""
  );
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setEditEmail(user.email || "");
      setEditPhone(formatPhone(user.phone || ""));
    }
  }, [user]);

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const emailToSend = (editEmail || "").trim();
      if (!emailToSend) {
        setError("Email is required");
        return;
      }
      const userId = user._id || user.id;
      const phoneToSend = (editPhone || "").trim() || "";
      const response = await fetch(`${api.users}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailToSend, phone: phoneToSend }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to update profile";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage =
            response.statusText || `Server error (${response.status})`;
        }
        setError(errorMessage);
        return;
      }

      await response.json();
      setSuccess("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An error occurred while updating your profile";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showFullName = editMode || !!user?.fullName;
  const showEmail = editMode || !!(user?.email || editEmail);
  const showPhone = editMode || !!(user?.phone || editPhone);

  const handleClearPhone = () => {
    setEditPhone("");
  };

  return (
    <SafeAreaView
      style={[global.pageWrap, styles.container, { paddingTop: 16 }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      {/* Content - scrollable area */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error message */}
        {error && (
          <View style={styles.errorMessage}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Success message */}
        {success && (
          <View style={styles.successMessage}>
            <ThemedText style={styles.successText}>{success}</ThemedText>
          </View>
        )}

        {/* Account Details Section */}
        <View style={styles.accountSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Account Details</ThemedText>
            {!editMode && (
              <Pressable onPress={() => setEditMode(true)}>
                <ThemedText style={styles.editLink}>Edit</ThemedText>
              </Pressable>
            )}
          </View>
          <View style={styles.accountCard}>
            {/* Full Name (Display Only) */}
            {showFullName && (
              <View
                style={[styles.accountItem, editMode && styles.disabledField]}
              >
                <ThemedText style={styles.accountLabel}>Full Name</ThemedText>
                <ThemedText style={styles.accountValue}>
                  {user.fullName}
                </ThemedText>
              </View>
            )}

            {/* Email */}
            {showEmail && (
              <View
                style={[
                  styles.accountItem,
                  showFullName && styles.accountItemBorder,
                ]}
              >
                <ThemedText style={styles.accountLabel}>Email</ThemedText>
                {editMode ? (
                  <TextInput
                    style={[
                      styles.accountValue,
                      { paddingVertical: 3.5 },
                      emailFocused && { borderBottomColor: colors.accent },
                    ]}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="Enter email"
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                  />
                ) : (
                  <ThemedText
                    style={[styles.accountValue, { paddingVertical: 0 }]}
                  >
                    {editEmail}
                  </ThemedText>
                )}
              </View>
            )}

            {/* Phone */}
            {showPhone && (
              <View
                style={[
                  styles.accountItem,
                  (showFullName || showEmail) && styles.accountItemBorder,
                ]}
              >
                <ThemedText style={styles.accountLabel}>Phone</ThemedText>
                {editMode ? (
                  <View>
                    <TextInput
                      style={[
                        styles.accountValue,
                        { paddingVertical: 3.5 },
                        phoneFocused && { borderBottomColor: colors.accent },
                      ]}
                      value={editPhone}
                      onChangeText={(text) => {
                        setEditPhone(formatPhone(text));
                      }}
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Enter phone"
                      placeholderTextColor={colors.muted}
                      editable={!loading}
                    />

                    <Pressable
                      onPress={handleClearPhone}
                      disabled={loading}
                      style={{ marginTop: 8 }}
                    >
                      <ThemedText style={styles.editLink}>Clear</ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <ThemedText
                    style={[styles.accountValue, { paddingVertical: 0 }]}
                  >
                    {editPhone}
                  </ThemedText>
                )}
              </View>
            )}
          </View>

          {/* Edit Mode Actions */}
          {editMode && (
            <View style={styles.editActions}>
              <ThemedButton
                variant="primary"
                onPress={handleSaveChanges}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </ThemedButton>
              <ThemedButton
                variant="outline"
                onPress={() => {
                  setEditMode(false);
                  setError(null);
                  setEditEmail(user?.email || "");
                  setEditPhone(formatPhone(user?.phone || ""));
                }}
                disabled={loading}
              >
                Cancel
              </ThemedButton>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer - Buttons */}
      <View style={styles.footer}>
        <ThemedButton
          variant="ghost"
          onPress={() => router.push("/termsModal")}
        >
          Terms & Privacy
        </ThemedButton>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={logout}
        >
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 0,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingVertical: 16,
  },
  accountSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  accountCard: {
    backgroundColor: colors.backgroundDarker,
    borderRadius: 12,
    overflow: "hidden",
  },
  accountItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  accountItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accountLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: "500",
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    paddingVertical: 2,
  },
  textInput: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    paddingVertical: 2,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  disabledField: {
    opacity: 0.5,
  },
  editActions: {
    gap: 10,
    marginTop: 12,
  },
  errorMessage: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "500",
  },
  successMessage: {
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "500",
  },
  footer: {
    gap: 4,
    paddingVertical: 16,
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 0.5,
    borderColor: "#ef4444ff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonPressed: {
    backgroundColor: "#ef444418",
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Settings;
