import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";
import { ThemedButton } from "../../../components/ThemedButton";
import { ThemedText } from "../../../components/ThemedText";
import { useAuth } from "../../../context/AuthContext";
import fetcher from "../../../lib/_fetcher";
import { api } from "../../../lib/api";
import colors from "../../../theme/colors";
import spacing from "../../../theme/spacing";

// Native time picker component using DateTimePicker
const TimeSelector = ({ label, value, onChange }) => {
  // Parse HH:mm string to Date object
  const parseTimeToDate = (timeStr) => {
    const date = new Date();
    if (timeStr) {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        date.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
      }
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  };

  // Convert Date object to HH:mm string
  const formatDateToTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const handleChange = (event, selectedDate) => {
    if (selectedDate) {
      onChange(formatDateToTime(selectedDate));
    }
  };

  return (
    <View style={styles.timeRow}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <DateTimePicker
        value={parseTimeToDate(value)}
        mode="time"
        is24Hour={true}
        display="default"
        themeVariant="light"
        textColor={colors.text}
        accentColor={colors.accent}
        onChange={handleChange}
      />
    </View>
  );
};

const steps = [
  { key: "trip", label: "Trip" },
  { key: "mileage", label: "Mileage" },
  { key: "documents", label: "Document" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch order to get base date for ISO time composition
  const { data: order } = useSWR(
    token && id ? [`${api.orders}/${id}`, token] : null,
    fetcher
  );

  // Fetch clients list for dropdown
  const {
    data: clients = [],
    error: clientsError,
    isLoading: clientsLoading,
  } = useSWR(token ? [`${api.clients}`, token] : null, fetcher);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Format kilometers with thousands separator
  const formatKilometers = (value) => {
    if (!value) return "";
    return String(value)
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Remove formatting from displayed value to get raw number
  const parseKilometers = (formatted) => {
    if (!formatted) return "";
    return String(formatted).replace(/\D/g, "");
  };

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    return clients.filter((client) =>
      client.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

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

  const clearImage = () => {
    setField("documentUrl", "");
    setImagePreview(null);
  };

  // Calculate total time from start and end times
  const calculateTotalTime = () => {
    if (!form.startTime || !form.endTime) return "-";
    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };
    const startMin = parseTime(form.startTime);
    const endMin = parseTime(form.endTime);
    let totalMin = endMin - startMin;
    if (totalMin < 0) totalMin += 24 * 60; // Handle overnight
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  // Calculate total kilometers
  const calculateTotalKm = () => {
    if (form.startKilometers === "" || form.endKilometers === "") return "-";
    const start = Number(form.startKilometers) || 0;
    const end = Number(form.endKilometers) || 0;
    const total = end - start;
    return total >= 0 ? formatKilometers(String(total)) : "-";
  };

  const goNext = () => {
    if (!canGoNext) return;
    setShowDropdown(false);
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => {
    setShowDropdown(false);
    setStep((prev) => Math.max(prev - 1, 0));
  };

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
            <View style={styles.dropdownWrapper}>
              <TextInput
                value={searchQuery || form.drivenForCompany}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  setShowDropdown(true);
                  if (form.drivenForCompany && !searchQuery) {
                    setSearchQuery("");
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 200);
                }}
                placeholder="Search client / company"
                style={styles.input}
                placeholderTextColor={colors.muted}
              />
              <View pointerEvents="none" style={styles.dropdownArrowWrap}>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={colors.muted}
                />
              </View>
              {showDropdown && (
                <View style={styles.dropdownList}>
                  {clientsLoading ? (
                    <View style={styles.dropdownItem}>
                      <ThemedText style={styles.noResults}>
                        Loading...
                      </ThemedText>
                    </View>
                  ) : clientsError ? (
                    <View style={styles.dropdownItem}>
                      <ThemedText style={styles.noResults}>
                        Error loading clients
                      </ThemedText>
                    </View>
                  ) : filteredClients.length > 0 ? (
                    <ScrollView
                      style={styles.dropdownScroll}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      {filteredClients.map((item) => (
                        <TouchableOpacity
                          key={item.id?.toString() || item.clientName}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setField("drivenForCompany", item.clientName);
                            setSearchQuery("");
                            setShowDropdown(false);
                          }}
                        >
                          <ThemedText>{item.clientName}</ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.dropdownItem}>
                      <ThemedText style={styles.noResults}>
                        No clients found
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>

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
              value={formatKilometers(form.startKilometers)}
              onChangeText={(text) =>
                setField("startKilometers", parseKilometers(text))
              }
              placeholder="e.g. 12.345"
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={colors.muted}
            />

            <ThemedText style={styles.label}>End kilometers</ThemedText>
            <TextInput
              value={formatKilometers(form.endKilometers)}
              onChangeText={(text) =>
                setField("endKilometers", parseKilometers(text))
              }
              placeholder="e.g. 12.999"
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
                <View style={styles.previewActions}>
                  <ThemedText style={styles.helper}>
                    Compressed preview
                  </ThemedText>
                  <ThemedButton
                    variant="outline"
                    size="small"
                    text="Clear"
                    onPress={clearImage}
                    style={styles.clearButton}
                  />
                </View>
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
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardCol}>
                <ThemedText style={styles.summaryCardLabel}>
                  Total Hours
                </ThemedText>
                <ThemedText style={styles.summaryCardValue}>
                  {calculateTotalTime()}
                </ThemedText>
              </View>
              <View style={styles.summaryCardDivider} />
              <View style={styles.summaryCardCol}>
                <ThemedText style={styles.summaryCardLabel}>
                  Total Distance
                </ThemedText>
                <ThemedText style={styles.summaryCardValue}>
                  {calculateTotalKm()} km
                </ThemedText>
              </View>
            </View>
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
              <ThemedText>
                {formatKilometers(form.startKilometers) || "-"}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>End km</ThemedText>
              <ThemedText>
                {formatKilometers(form.endKilometers) || "-"}
              </ThemedText>
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
              <ThemedText
                style={[
                  styles.stepBadgeText,
                  isActive && styles.stepBadgeTextActive,
                ]}
              >
                {index + 1}
              </ThemedText>
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
  stepBadgeTextActive: {
    color: colors.backgroundOnTop,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  dropdownWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownArrowWrap: {
    position: "absolute",
    right: SPACING_SM,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  dropdownList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: 200,
    marginTop: 4,
    backgroundColor: colors.backgroundOnTop,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: RADIUS_INPUT,
    zIndex: 1001,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  flatList: {
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: SPACING_SM,
    paddingVertical: SPACING_SM,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  noResults: {
    color: colors.muted,
    textAlign: "center",
  },
  previewWrapper: {
    marginTop: SPACING_SM,
    alignItems: "flex-start",
    gap: 6,
  },
  previewActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING_SM,
  },
  clearButton: {
    minWidth: 80,
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
  summaryHighlight: {
    color: colors.accent,
    fontWeight: "600",
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: RADIUS_CARD,
    overflow: "hidden",
    marginBottom: SPACING_MD,
  },
  summaryCardCol: {
    flex: 1,
    paddingHorizontal: SPACING_MD,
    paddingVertical: SPACING_MD,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCardDivider: {
    width: 1,
    backgroundColor: colors.backgroundOnTop,
  },
  summaryCardLabel: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.text,
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
    paddingTop: SPACING_SM,
    paddingBottom: 32,
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
