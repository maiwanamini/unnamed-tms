import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "../../../components/ThemedText";
import { ThemedButton } from "../../../components/ThemedButton";
import colors from "../../../theme/colors";
import spacing from "../../../theme/spacing";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import useSWR from "swr";
import fetcher from "../../../lib/_fetcher";

// Lightweight in-app time selector producing HH:mm without extra deps
const TimeSelector = ({ label, value, onChange }) => {
  const parse = (v) => {
    const m = String(v || "").match(/^(\d{1,2}):(\d{2})$/);
    const h = m ? Math.max(0, Math.min(23, parseInt(m[1], 10))) : 0;
    const mm = m ? Math.max(0, Math.min(59, parseInt(m[2], 10))) : 0;
    return { h, mm };
  };
  const { h, mm } = parse(value);
  const setH = (nh) =>
    onChange(`${String(nh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  const setM = (nm) =>
    onChange(`${String(h).padStart(2, "0")}:${String(nm).padStart(2, "0")}`);

  const inc = (cur, max, step = 1) => (cur + step) % (max + 1);
  const dec = (cur, max, step = 1) => (cur - step + (max + 1)) % (max + 1);

  return (
    <View style={styles.timeRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={styles.timeControls}>
        <View style={styles.timeCol}>
          <ThemedButton
            size="small"
            variant="outline"
            text="▲"
            onPress={() => setH(inc(h, 23))}
          />
          <ThemedText style={styles.timeValue}>
            {String(h).padStart(2, "0")}
          </ThemedText>
          <ThemedButton
            size="small"
            variant="outline"
            text="▼"
            onPress={() => setH(dec(h, 23))}
          />
        </View>
        <ThemedText style={styles.timeColon}>:</ThemedText>
        <View style={styles.timeCol}>
          <ThemedButton
            size="small"
            variant="outline"
            text="▲"
            onPress={() => setM(inc(mm, 59, 5))}
          />
          <ThemedText style={styles.timeValue}>
            {String(mm).padStart(2, "0")}
          </ThemedText>
          <ThemedButton
            size="small"
            variant="outline"
            text="▼"
            onPress={() => setM(dec(mm, 59, 5))}
          />
        </View>
      </View>
    </View>
  );
};

const steps = [
  { key: "trip", label: "Trip" },
  { key: "mileage", label: "Mileage" },
  { key: "documents", label: "Document (optional)" },
  { key: "review", label: "Review" },
];

const defaultForm = {
  drivenForCompany: "",
  startTime: "",
  endTime: "",
  startKilometers: "",
  endKilometers: "",
  documentUrl: "",
};

const SPACING_SM = 12;
const SPACING_MD = 16;
const SPACING_LG = 24;
const RADIUS_CARD = spacing?.borderRadiusCard || 8;
const RADIUS_INPUT = 8;

const ExtraOrderInfo = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);

  // Fetch order to get base date for ISO time composition
  const { data: order } = useSWR(
    token && id ? [`${api.orders}/${id}`, token] : null,
    fetcher
  );

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const canGoNext = useMemo(() => {
    if (step === 0)
      return form.drivenForCompany && form.startTime && form.endTime;
    if (step === 1)
      return form.startKilometers !== "" && form.endKilometers !== "";
    if (step === 2) return true;
    return true;
  }, [step, form]);

  const compressAndSetImage = async (uri) => {
    setProcessingImage(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      setField("documentUrl", manipulated.uri);
      setImagePreview(manipulated.uri);
    } catch (error) {
      console.error("Failed to process image", error);
      // Fallback: use original URI without compression to avoid blocking user
      if (uri) {
        setField("documentUrl", uri);
        setImagePreview(uri);
      } else {
        Alert.alert(
          "Image error",
          "Could not process the image. Please try again."
        );
      }
    } finally {
      setProcessingImage(false);
    }
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const pickFromLibrary = async () => {
    const granted = await requestLibraryPermission();
    if (!granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await compressAndSetImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await compressAndSetImage(result.assets[0].uri);
    }
  };

  const goNext = () => {
    if (!canGoNext) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    const toNumberIfValid = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return Number.isNaN(num) ? null : num;
    };

    // Compose ISO from HH:mm strings using order.date (or today)
    const composeIsoFromTime = (timeStr) => {
      if (!timeStr) return null;
      // if already a valid date string
      const asDate = new Date(timeStr);
      if (!isNaN(asDate.getTime())) return asDate.toISOString();

      const m = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!m) return null;
      const [, hh, mm, ss] = m;
      const base = order?.date ? new Date(order.date) : new Date();
      base.setHours(
        parseInt(hh, 10),
        parseInt(mm, 10),
        ss ? parseInt(ss, 10) : 0,
        0
      );
      return base.toISOString();
    };

    // Build multipart form data with only provided fields
    const formData = new FormData();
    const appendIf = (key, value) => {
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    };

    appendIf("drivenForCompany", form.drivenForCompany);
    appendIf("startTime", composeIsoFromTime(form.startTime));
    appendIf("endTime", composeIsoFromTime(form.endTime));
    const startKmNum = toNumberIfValid(form.startKilometers);
    const endKmNum = toNumberIfValid(form.endKilometers);
    if (startKmNum !== null)
      formData.append("startKilometers", String(startKmNum));
    if (endKmNum !== null) formData.append("endKilometers", String(endKmNum));
    if (imagePreview) {
      formData.append("proofImage", {
        uri: imagePreview,
        name: "proof.jpg",
        type: "image/jpeg",
      });
    }

    setSubmitting(true);
    try {
      // Always send multipart/form-data so multer can parse fields
      const res = await fetch(`${api.orders}/${id}/extra-info`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed ${res.status}: ${text}`);
      }
      Alert.alert("Saved", "Extra order info submitted.");
      router.back();
    } catch (error) {
      console.error("Failed to submit extra order info", error);
      Alert.alert(
        "Not saved",
        "Could not submit the extra info. Please check the network and backend endpoint /orders/:id/extra-info."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Trip details
            </ThemedText>
            <ThemedText style={styles.label}>Driven for</ThemedText>
            <TextInput
              value={form.drivenForCompany}
              onChangeText={(text) => setField("drivenForCompany", text)}
              placeholder="Client / Company"
              style={styles.input}
              placeholderTextColor={colors.muted}
            />

            <TimeSelector
              label="Start time"
              value={form.startTime}
              onChange={(text) => setField("startTime", text)}
            />
            <TimeSelector
              label="End time"
              value={form.endTime}
              onChange={(text) => setField("endTime", text)}
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Mileage
            </ThemedText>
            <ThemedText style={styles.label}>Start kilometers</ThemedText>
            <TextInput
              value={form.startKilometers}
              onChangeText={(text) => setField("startKilometers", text)}
              placeholder="e.g. 12345"
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={colors.muted}
            />

            <ThemedText style={styles.label}>End kilometers</ThemedText>
            <TextInput
              value={form.endKilometers}
              onChangeText={(text) => setField("endKilometers", text)}
              placeholder="e.g. 12999"
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={colors.muted}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Document (optional)
            </ThemedText>
            <ThemedText style={styles.label}>
              Please upload a photo of the route document.
            </ThemedText>
            <View style={styles.row}>
              <ThemedButton
                variant="outline"
                size="small"
                text="Pick from gallery"
                onPress={pickFromLibrary}
                disabled={processingImage}
                style={styles.halfButton}
              />
              <ThemedButton
                variant="outline"
                size="small"
                text="Take a photo"
                onPress={takePhoto}
                disabled={processingImage}
                style={styles.halfButton}
              />
            </View>
            <ThemedText style={styles.helper}>
              Choose an image from gallery or take a photo.
            </ThemedText>
            {imagePreview ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: imagePreview }} style={styles.preview} />
                <ThemedText style={styles.helper}>
                  Compressed preview
                </ThemedText>
              </View>
            ) : null}
          </View>
        );

      case 3:
      default:
        return (
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Review
            </ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Driven for</ThemedText>
              <ThemedText>{form.drivenForCompany || "-"}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Start time</ThemedText>
              <ThemedText>{form.startTime || "-"}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>End time</ThemedText>
              <ThemedText>{form.endTime || "-"}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Start km</ThemedText>
              <ThemedText>{form.startKilometers || "-"}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>End km</ThemedText>
              <ThemedText>{form.endKilometers || "-"}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Document</ThemedText>
              {imagePreview || form.documentUrl ? (
                <ThemedText style={styles.summaryValue}>Ready</ThemedText>
              ) : (
                <ThemedText style={styles.summaryValue}>-</ThemedText>
              )}
            </View>
            {imagePreview || form.documentUrl ? (
              <View style={styles.previewWrapper}>
                <Image
                  source={{ uri: imagePreview || form.documentUrl }}
                  style={styles.previewWide}
                />
                <ThemedText style={styles.helper}>Review preview</ThemedText>
              </View>
            ) : null}

            <View style={styles.editRow}>
              <ThemedButton
                variant="outline"
                size="small"
                text="Edit trip"
                onPress={() => setStep(0)}
              />
              <ThemedButton
                variant="outline"
                size="small"
                text="Edit mileage"
                onPress={() => setStep(1)}
              />
              <ThemedButton
                variant="outline"
                size="small"
                text="Edit document"
                onPress={() => setStep(2)}
              />
            </View>
          </View>
        );
    }
  };

  const renderStepper = () => (
    <View style={styles.stepper}>
      {steps.map((s, index) => {
        const isActive = index === step;
        const isDone = index < step;
        return (
          <View key={s.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepBadge,
                isActive && styles.stepBadgeActive,
                isDone && styles.stepBadgeDone,
              ]}
            >
              <ThemedText style={styles.stepBadgeText}>{index + 1}</ThemedText>
            </View>
            <ThemedText
              style={[styles.stepLabel, isActive && styles.stepLabelActive]}
            >
              {s.label}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <ThemedButton
          variant="ghost"
          text="Back"
          onPress={() => router.back()}
          size="small"
          textStyle={styles.backText}
        />
        <ThemedText type="title">Extra order info</ThemedText>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepper()}
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <ThemedButton
          variant="outline"
          text="Previous"
          onPress={goBack}
          disabled={step === 0 || submitting}
          style={styles.footerButton}
        />
        {step < steps.length - 1 ? (
          <ThemedButton
            text="Next"
            onPress={goNext}
            disabled={!canGoNext || submitting}
            style={styles.footerButton}
          />
        ) : (
          <ThemedButton
            text={submitting ? "Submitting..." : "Submit"}
            onPress={handleSubmit}
            disabled={submitting}
            style={styles.footerButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING_MD,
    paddingVertical: SPACING_SM,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    color: colors.accent,
  },
  content: {
    paddingHorizontal: SPACING_MD,
    paddingBottom: SPACING_LG,
    gap: SPACING_MD,
  },
  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING_SM,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepBadgeActive: {
    backgroundColor: colors.accent,
  },
  stepBadgeDone: {
    backgroundColor: "#d1e0ff",
  },
  stepBadgeText: {
    color: colors.text,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  stepLabelActive: {
    color: colors.text,
  },
  card: {
    backgroundColor: colors.backgroundOnTop,
    borderRadius: RADIUS_CARD,
    padding: SPACING_MD,
    borderWidth: 1,
    borderColor: colors.border,
    gap: SPACING_SM,
  },
  cardTitle: {
    marginBottom: 4,
  },
  label: {
    color: colors.text,
    marginTop: SPACING_SM,
    marginBottom: 4,
  },
  helper: {
    color: colors.muted,
    fontSize: 13,
  },
  timeRow: {
    marginTop: SPACING_SM,
  },
  timeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeCol: {
    alignItems: "center",
    gap: 6,
  },
  timeValue: {
    fontSize: 18,
    color: colors.text,
  },
  timeColon: {
    fontSize: 18,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: SPACING_SM,
  },
  halfButton: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS_INPUT,
    paddingHorizontal: SPACING_SM,
    paddingVertical: SPACING_SM,
    color: colors.text,
    backgroundColor: colors.backgroundOnTop,
  },
  previewWrapper: {
    marginTop: SPACING_SM,
    alignItems: "flex-start",
    gap: 6,
  },
  preview: {
    width: "100%",
    aspectRatio: 358 / 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  previewWide: {
    width: "100%",
    aspectRatio: 358 / 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    color: colors.muted,
  },
  summaryValue: {
    maxWidth: "65%",
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: SPACING_MD,
    flexWrap: "wrap",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: SPACING_MD,
    paddingVertical: SPACING_SM,
    gap: SPACING_SM,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundOnTop,
  },
  footerButton: {
    flex: 1,
  },
});

export default ExtraOrderInfo;
