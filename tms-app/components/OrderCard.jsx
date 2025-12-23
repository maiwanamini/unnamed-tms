import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import Tag from "./Tag";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import global from "../styles/global";

// OrderCard now accepts an `order` prop and renders available fields
const OrderCard = ({ order = {}, stops = [], onPress }) => {
  const id = order.orderNumber || "--";
  const status = order.status || order.state || "unknown";

  // Get first stop address as start location
  const firstStop = stops && stops.length > 0 ? stops[0] : null;
  const start = firstStop?.address || "start location";

  // Get last stop address as end location
  const lastStop = stops && stops.length > 0 ? stops[stops.length - 1] : null;
  const end = lastStop?.address || "end location";

  // Format time from planned time
  const formatTime = (dateString) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      const dayName = date.toLocaleDateString([], { weekday: "short" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString([], { month: "short" });
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${dayName} ${day} ${monthName}, ${time}`;
    } catch {
      return "--";
    }
  };

  const firstStopTime = formatTime(firstStop?.plannedTime);
  const lastStopTime = formatTime(lastStop?.plannedTime);

  const statusToVariant = {
    pending: "planned",
    planned: "planned",
    moving: "moving",
    in_transit: "moving",
    completed: "completed",
    done: "completed",
    canceled: "canceled",
    cancelled: "canceled",
  };
  const tagVariant = statusToVariant[String(status).toLowerCase()] || "planned";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={{
          gap: 16,
          backgroundColor: "white",
          padding: 8,
          marginBottom: 12,
          alignItems: "flex-start",
          borderRadius: 8,
        }}
      >
        <View>
          <Tag variant={tagVariant} />
        </View>
        <View style={{ width: "100%", overflow: "clip" }}>
          <ThemedText>Order #{id}</ThemedText>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1}>{start}</ThemedText>
              <ThemedText type="small" style={global.faded} numberOfLines={1}>
                {firstStopTime}
              </ThemedText>
            </View>
            <MaterialIcons name="arrow-forward" size={16} color="gray" />
            <View style={{ flex: 1 }}>
              <ThemedText numberOfLines={1}>{end}</ThemedText>
              <ThemedText type="small" style={global.faded} numberOfLines={1}>
                {lastStopTime}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={{ width: "100%", alignItems: "flex-end" }}>
          <Tag variant="distance" style={{ width: "fit-content" }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;
