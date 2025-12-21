import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "./ThemedText";
import Tag from "./Tag";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import global from "../styles/global";

// OrderCard now accepts an `order` prop and renders available fields
const OrderCard = ({ order = {}, onPress }) => {
  const id = order.orderNumber || "--";
  const start =
    order.start_location || order.from || order.pickup || "start location";
  const end =
    order.end_location || order.to || order.delivery || "end location";
  const status = order.status || order.state || "unknown";

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

  //temp for testing purposes
  const name = order.customerName || "Customer Name";

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
            <ThemedText>{name}</ThemedText>
            <MaterialIcons name="arrow-forward" size={16} color="gray" />
            <ThemedText>{end}</ThemedText>
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
