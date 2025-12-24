import React, { useState, useCallback, useMemo } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useSWR from "swr";
import { useAuth } from "../context/AuthContext";
import fetcher from "../lib/_fetcher";
import { api } from "../lib/api";
import { ThemedText } from "../components/ThemedText";
import OrderCard from "../components/OrderCard";
import colors from "../theme/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const AllOrders = () => {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch all orders
  const { data: allOrders } = useSWR(
    token ? [api.orders, token] : null,
    fetcher
  );

  // Fetch stops for each order on-demand
  const [orderStopsMap, setOrderStopsMap] = React.useState({});

  const getOrderStops = useCallback(
    async (orderId) => {
      if (orderStopsMap[orderId]) return orderStopsMap[orderId];
      try {
        const res = await fetch(`${api.stops}?order=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const stops = Array.isArray(data) ? data : data?.data || [];
        setOrderStopsMap((prev) => ({ ...prev, [orderId]: stops }));
        return stops;
      } catch (e) {
        console.error("Error fetching stops:", e);
        return [];
      }
    },
    [orderStopsMap, token]
  );

  // Categorize orders
  const { upcomingOrders, uncompletedOrders, completedOrders } = useMemo(() => {
    if (!allOrders)
      return { upcomingOrders: [], uncompletedOrders: [], completedOrders: [] };

    const upcoming = [];
    const uncompleted = [];
    const completed = [];
    const now = new Date();

    // Helper to parse a stop date using plannedTime first
    const parseStopDate = (stop) => {
      const value =
        stop?.plannedTime || stop?.scheduledArrival || stop?.scheduledDeparture;
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    };

    allOrders.forEach((order) => {
      const stops = orderStopsMap[order._id] || [];

      if (order.status === "completed") {
        completed.push({ order, stops });
        return;
      }

      if (stops.length > 0) {
        const firstStop = stops[0];
        const lastStop = stops[stops.length - 1];

        const firstStopDate = parseStopDate(firstStop);
        const lastStopDate = parseStopDate(lastStop);

        // If first stop is in the future, it's upcoming
        if (firstStopDate && firstStopDate > now) {
          upcoming.push({ order, stops });
        }
        // If last stop is in the past, it's uncompleted
        else if (lastStopDate && lastStopDate < now) {
          uncompleted.push({ order, stops });
        }
        // Otherwise it's current/in progress, or missing dates → uncompleted
        else {
          uncompleted.push({ order, stops });
        }
      } else {
        // No stops data yet, put in uncompleted
        uncompleted.push({ order, stops });
      }
    });

    return {
      upcomingOrders: upcoming,
      uncompletedOrders: uncompleted,
      completedOrders: completed,
    };
  }, [allOrders, orderStopsMap]);

  const currentData = useMemo(() => {
    switch (activeTab) {
      case "upcoming":
        return upcomingOrders;
      case "uncompleted":
        return uncompletedOrders;
      case "completed":
        return completedOrders;
      default:
        return [];
    }
  }, [activeTab, upcomingOrders, uncompletedOrders, completedOrders]);

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title">All Orders</ThemedText>
        <View style={{ width: 24 }} />
      </View>
    ),
    [router]
  );

  const renderTabs = useCallback(
    () => (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Upcoming ({upcomingOrders.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "uncompleted" && styles.activeTab]}
          onPress={() => setActiveTab("uncompleted")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "uncompleted" && styles.activeTabText,
            ]}
          >
            Uncompleted ({uncompletedOrders.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed ({completedOrders.length})
          </ThemedText>
        </TouchableOpacity>
      </View>
    ),
    [
      activeTab,
      upcomingOrders.length,
      uncompletedOrders.length,
      completedOrders.length,
    ]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <OrderCard
          order={item.order}
          stops={item.stops}
          onPress={() => router.push(`/orders/${item.order._id}`)}
        />
      </View>
    ),
    [router]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <ThemedText style={{ color: colors.muted }}>
          No {activeTab} orders
        </ThemedText>
      </View>
    ),
    [activeTab]
  );

  // Fetch stops for all incomplete orders
  React.useEffect(() => {
    if (!allOrders) return;
    allOrders.forEach((order) => {
      if (!orderStopsMap[order._id]) {
        getOrderStops(order._id);
      }
    });
  }, [allOrders, orderStopsMap, getOrderStops]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {renderHeader()}
      {renderTabs()}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: (insets?.bottom || 0) + 16,
        }}
        data={currentData}
        keyExtractor={(item, index) => item.order._id || `order-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.backgroundOnTop,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "500",
  },
  activeTabText: {
    color: colors.accent,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
});

export default AllOrders;
