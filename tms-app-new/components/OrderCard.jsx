import { View } from "react-native";
import { ThemedText } from "./ThemedText";
import Tag from "./Tag";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import global from "../styles/global";
import React from "react";

const OrderCard = () => {
  return (
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
        <Tag />
      </View>
      <View>
        <ThemedText>Order #ID</ThemedText>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            gap: 8,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ThemedText>start location</ThemedText>
          <MaterialIcons name="arrow-forward" size={16} color="gray" />
          <ThemedText>end location</ThemedText>
        </View>
      </View>
      <View style={{ width: "100%", alignItems: "flex-end" }}>
        <Tag style={{ width: "fit-content" }} />
      </View>
    </View>
  );
};

export default OrderCard;
