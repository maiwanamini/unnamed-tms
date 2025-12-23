import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useSWR from "swr";
import { useSWRConfig } from "swr";
import { useAuth } from "../../context/AuthContext";
import fetcher from "../../lib/_fetcher";
import { api } from "../../lib/api";
import { ThemedText } from "../../components/ThemedText";
import Tag from "../../components/Tag";
import colors from "../../theme/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import React, { useState, useEffect } from "react";

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [showCompleted, setShowCompleted] = useState(false);

  // Fetch order data
  const { data: order, mutate: mutateOrder } = useSWR(
    token && id ? [`${api.orders}/${id}`, token] : null,
    fetcher
  );

  // Fetch stops data filtered by order ID
  const { data: stopsData, mutate: mutateStops } = useSWR(
    token && id ? [`${api.stops}?order=${id}`, token] : null,
    fetcher
  );

  const stops = Array.isArray(stopsData) ? stopsData : stopsData?.data || [];
  const stopCount = stops.length;

  const updateOrderStatus = async (newStatus) => {
    try {
      const response = await fetch(`${api.orders}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        mutateOrder();
        // Revalidate the orders list on home page
        globalMutate([api.orders, token]);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const markStopAsCompleted = async (stopId, completedStatus) => {
    try {
      const response = await fetch(`${api.stops}/${stopId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: completedStatus }),
      });

      if (response.ok) {
        // Refresh the stops data
        await mutateStops();
      } else {
        console.error("Failed to mark stop as completed");
      }
    } catch (error) {
      console.error("Error marking stop as completed:", error);
    }
  };

  // Auto-update order status based on stops
  useEffect(() => {
    if (!order || !stops || stops.length === 0) return;

    const allCompleted = stops.every((stop) => stop.completed);
    const firstStop = stops[0];
    const firstStopTime = firstStop?.plannedTime
      ? new Date(firstStop.plannedTime)
      : null;
    const now = new Date();

    // If all stops completed → set to completed
    if (allCompleted && order.status !== "completed") {
      updateOrderStatus("completed");
    }
    // If first stop time has passed → set to moving
    else if (
      firstStopTime &&
      now > firstStopTime &&
      !allCompleted &&
      order.status !== "moving"
    ) {
      updateOrderStatus("moving");
    }
    // Otherwise → set to pending
    else if (
      !allCompleted &&
      (!firstStopTime || now <= firstStopTime) &&
      order.status !== "pending"
    ) {
      updateOrderStatus("pending");
    }
  }, [stops, order]);

  if (!order || !stopsData) return null;

  // Find the first non-completed stop (current stop)
  const currentStopIndex = stops.findIndex((stop) => !stop.completed);

  // Filter stops based on showCompleted
  const filteredStops = showCompleted
    ? stops
    : stops.filter((stop) => !stop.completed);

  const getStopColor = (index) => {
    const colors_palette = ["#c8e6c9", "#bbdefb", "#ffe0b2"];
    return colors_palette[index % colors_palette.length];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Entypo name="chevron-small-left" size={24} color={colors.accent} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText type="title" style={styles.orderId}>
            Order #{order.orderNumber}
          </ThemedText>
          <ThemedText style={styles.companyName}>
            {order.customerName || "Company Name"}
          </ThemedText>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stops Section Header */}
        <View style={styles.stopsHeader}>
          <View style={styles.stopsTitle}>
            <ThemedText type="subtitle" style={styles.stopsTitleText}>
              Stops
            </ThemedText>
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{stopCount}</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowCompleted(!showCompleted)}
            style={styles.showCompletedButton}
          >
            <MaterialIcons
              name={showCompleted ? "check-box" : "check-box-outline-blank"}
              size={20}
              color={colors.accent}
            />
            <ThemedText style={styles.showCompletedText}>
              Show completed
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Stops List */}
        <View style={styles.stopsList}>
          {filteredStops.map((stop, index) => {
            const originalIndex = stops.findIndex((s) => s._id === stop._id);
            const isCurrentOrFirst =
              originalIndex === currentStopIndex || originalIndex === 0;
            const showOnLocationButton = isCurrentOrFirst || stop.completed;
            const stopType = stop.type ? String(stop.type).toLowerCase() : null;
            const stopTagVariant =
              stopType === "pickup" || stopType === "pick-up"
                ? "pickup"
                : stopType === "dropoff" || stopType === "drop-off"
                ? "dropoff"
                : "planned";
            const stopTagLabel = stop.type
              ? stop.type.charAt(0).toUpperCase() + stop.type.slice(1)
              : undefined;

            return (
              <View key={stop._id || index} style={styles.stopCard}>
                {/* Stop Number and Status Indicator */}
                <View style={styles.stopNumberContainer}>
                  <View
                    style={[
                      styles.stopNumber,
                      { backgroundColor: getStopColor(index) },
                    ]}
                  >
                    <ThemedText style={styles.stopNumberText}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <View style={styles.stopStatusLine} />
                </View>

                {/* Stop Content */}
                <View style={styles.stopContent}>
                  <View style={styles.stopHeader}>
                    <View style={styles.stopHeaderLeft}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.companyNameStop}
                      >
                        {stop.locationName ||
                          stop.company ||
                          stop.name ||
                          "Location"}
                      </ThemedText>
                    </View>
                    {stop.type ? (
                      <Tag
                        variant={stopTagVariant}
                        label={stopTagLabel}
                        style={styles.stopTypeTag}
                      />
                    ) : null}
                  </View>

                  <ThemedText style={styles.address}>
                    {stop.address || "Address not available"}
                  </ThemedText>

                  {(stop.city || stop.postalCode) && (
                    <ThemedText style={styles.address}>
                      {stop.city}
                      {stop.city && stop.postalCode ? ", " : ""}
                      {stop.postalCode}
                    </ThemedText>
                  )}

                  {stop.plannedTime && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.label}>Planned time</ThemedText>
                      <ThemedText style={styles.value}>
                        {new Date(stop.plannedTime).toLocaleDateString()}{" "}
                        {new Date(stop.plannedTime).toLocaleTimeString()}
                      </ThemedText>
                    </View>
                  )}

                  {stop.reference && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.label}>Ref</ThemedText>
                      <ThemedText style={styles.value}>
                        {stop.reference}
                      </ThemedText>
                    </View>
                  )}

                  {stop.note && (
                    <View style={styles.infoRow}>
                      <ThemedText style={styles.label}>Note</ThemedText>
                      <ThemedText style={styles.value}>{stop.note}</ThemedText>
                    </View>
                  )}

                  {/* On Location Button */}
                  {showOnLocationButton && (
                    <TouchableOpacity
                      style={[
                        styles.onLocationButton,
                        stop.completed && styles.onLocationButtonUndone,
                      ]}
                      onPress={() =>
                        markStopAsCompleted(stop._id, !stop.completed)
                      }
                    >
                      <MaterialIcons
                        name={stop.completed ? "undo" : "location-on"}
                        size={18}
                        color={stop.completed ? "#355BE4" : "white"}
                      />
                      <ThemedText
                        style={[
                          styles.onLocationButtonText,
                          stop.completed && styles.onLocationButtonTextUndone,
                        ]}
                      >
                        {stop.completed ? "Mark as undone" : "On Location"}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundOnTop,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "600",
  },
  companyName: {
    fontSize: 14,
    color: colors.muted,
  },
  stopsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.backgroundOnTop,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stopsTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  stopsTitleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  showCompletedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  showCompletedText: {
    fontSize: 14,
    color: colors.text,
  },
  stopsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stopCard: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stopNumberContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  stopNumber: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stopNumberText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  stopStatusLine: {
    width: 3,
    height: 40,
    backgroundColor: colors.border,
    marginTop: 8,
  },
  stopContent: {
    flex: 1,
    backgroundColor: colors.backgroundOnTop,
    borderRadius: 8,
    padding: 12,
  },
  stopHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  stopHeaderLeft: {
    flex: 1,
  },
  stopTypeTag: {
    flexShrink: 0,
  },
  companyNameStop: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  onLocationButton: {
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  onLocationButtonUndone: {
    backgroundColor: "rgba(53, 91, 228, 0.2)",
  },
  onLocationButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  onLocationButtonTextUndone: {
    color: "#355BE4",
  },
});
