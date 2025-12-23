import { View, FlatList } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ContactCard from "../../components/ContactCard";
import OrderCard from "../../components/OrderCard";
import UpcomingOrderCard from "../../components/UpcomingOrderCard";
import { ThemedText } from "../../components/ThemedText";
import global from "../../styles/global";
import colors from "../../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import useSWR from "swr";
import fetcher from "../../lib/_fetcher";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";
import { ThemedButton } from "../../components/ThemedButton";

const Home = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch all orders from backend
  const { data: allOrders } = useSWR(
    token ? [api.orders, token] : null,
    fetcher
  );

  // Fetch stops for each order on-demand
  const [orderStopsMap, setOrderStopsMap] = React.useState({});

  // Helper to check if order is in current date range
  const isOrderCurrent = useCallback((order, stops) => {
    if (!stops || stops.length === 0) return false;
    if (order.status === "completed") return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstStop = stops[0];
    const lastStop = stops[stops.length - 1];

    const firstDate = firstStop?.plannedTime
      ? new Date(firstStop.plannedTime)
      : null;
    const lastDate = lastStop?.plannedTime
      ? new Date(lastStop.plannedTime)
      : null;

    if (!firstDate || !lastDate) return false;

    firstDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    return today >= firstDate && today <= lastDate;
  }, []);

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

  // Fetch stops for current order with SWR for auto-revalidation
  const currentOrderId = allOrders?.find((order) => {
    const stops = orderStopsMap[order._id];
    if (!stops || stops.length === 0) return false;
    return isOrderCurrent(order, stops);
  })?._id;

  const { data: currentOrderStopsData } = useSWR(
    token && currentOrderId
      ? [`${api.stops}?order=${currentOrderId}`, token]
      : null,
    fetcher
  );

  const currentOrderStopsFromSWR = Array.isArray(currentOrderStopsData)
    ? currentOrderStopsData
    : currentOrderStopsData?.data || [];

  // Categorize orders
  const { currentOrder, currentOrderStops, upcomingOrders } = useMemo(() => {
    if (!allOrders)
      return { currentOrder: null, currentOrderStops: [], upcomingOrders: [] };

    const incomplete = allOrders.filter(
      (order) => order.status !== "completed"
    );
    let current = null;
    let currentStops = [];
    const upcoming = [];

    for (const order of incomplete) {
      const stops = orderStopsMap[order._id] || [];
      if (!stops || stops.length === 0) continue;

      if (isOrderCurrent(order, stops) && !current) {
        current = order;
        currentStops =
          order._id === currentOrderId ? currentOrderStopsFromSWR : stops;
      } else {
        const firstStop = stops[0];
        const firstDate = firstStop?.plannedTime
          ? new Date(firstStop.plannedTime)
          : null;
        if (firstDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          firstDate.setHours(0, 0, 0, 0);
          if (firstDate > today) {
            upcoming.push(order);
          }
        }
      }
    }

    return {
      currentOrder: current,
      currentOrderStops: currentStops,
      upcomingOrders: upcoming,
    };
  }, [
    allOrders,
    orderStopsMap,
    isOrderCurrent,
    currentOrderId,
    currentOrderStopsFromSWR,
  ]);

  // Fetch stops for all incomplete orders
  React.useEffect(() => {
    if (!allOrders) return;
    allOrders.forEach((order) => {
      if (order.status !== "completed" && !orderStopsMap[order._id]) {
        getOrderStops(order._id);
      }
    });
  }, [allOrders, orderStopsMap, getOrderStops]);

  // Auto-update current order status based on stops
  React.useEffect(() => {
    if (!currentOrder || !currentOrderStops || currentOrderStops.length === 0)
      return;

    const updateOrderStatus = async (newStatus) => {
      try {
        const response = await fetch(`${api.orders}/${currentOrder._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          // Trigger revalidation of orders list
          const { mutate } = await import("swr");
          mutate([api.orders, token]);
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    };

    const allCompleted = currentOrderStops.every((stop) => stop.completed);
    const anyCompleted = currentOrderStops.some((stop) => stop.completed);

    // If all stops completed → set to completed
    if (allCompleted && currentOrder.status !== "completed") {
      updateOrderStatus("completed");
    }
    // If at least one stop is completed → set to moving
    else if (anyCompleted && currentOrder.status !== "moving") {
      updateOrderStatus("moving");
    }
    // Otherwise → set to pending
    else if (!anyCompleted && currentOrder.status !== "pending") {
      updateOrderStatus("pending");
    }
  }, [currentOrder, currentOrderStops, token]);

  const listData = useMemo(() => {
    const items = [];
    if (currentOrder && currentOrderStops.length > 0) {
      items.push({
        type: "current",
        order: currentOrder,
        stops: currentOrderStops,
      });
    }
    items.push({ type: "upcomingHeading" });
    if (upcomingOrders.length > 0) {
      items.push(
        ...upcomingOrders.map((order) => ({ type: "upcoming", order }))
      );
    } else {
      items.push({ type: "noUpcoming" });
    }
    return items;
  }, [currentOrder, currentOrderStops, upcomingOrders]);

  const renderHeader = useCallback(
    () => (
      <View style={{ gap: 24 }}>
        <View style={global.headerWrap}>
          <View style={global.textWrapMainLeft}>
            <ThemedText>Welcome</ThemedText>
            <ThemedText>What's on the planning today?</ThemedText>
          </View>
          <View style={global.itemWrapper}>{/* profile image here */}</View>
        </View>

        <View style={global.bodyWrap}>
          <View style={global.contentWrap}>
            <View style={global.sectionWrap}>
              <View style={global.sectionContainer}>
                <ContactCard />
              </View>
            </View>
          </View>
        </View>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case "current":
          return (
            <View style={[global.sectionContainer, { paddingTop: 32 }]}>
              <View style={global.sectionHeading}>
                <View style={global.hFlexTiny}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={16}
                    color={colors.text}
                  />
                  <ThemedText type="subtitle">Current Order</ThemedText>
                </View>
                <ThemedButton
                  text={"See all"}
                  size="small"
                  variant="ghost"
                  onPress={() => router.push("/allOrders")}
                />
              </View>
              <View>
                <OrderCard
                  order={item.order}
                  stops={item.stops}
                  onPress={() => router.push(`/orders/${item.order._id}`)}
                />
              </View>
            </View>
          );
        case "upcomingHeading":
          return (
            <View style={[global.sectionContainer, { paddingBottom: 8 }]}>
              <View style={global.sectionHeading}>
                <View style={global.hFlexTiny}>
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={16}
                    color={colors.text}
                  />
                  <ThemedText type="subtitle">Upcoming Orders</ThemedText>
                </View>
                <ThemedButton
                  text={"See all"}
                  size="small"
                  variant="ghost"
                  onPress={() => router.push("/allOrders")}
                />
              </View>
            </View>
          );
        case "upcoming":
          return (
            <View style={global.sectionContainer}>
              <UpcomingOrderCard
                order={item.order}
                onPress={() => router.push(`/orders/${item.order._id}`)}
              />
            </View>
          );
        case "noUpcoming":
          return (
            <View style={global.sectionContainer}>
              <ThemedText>No upcoming orders</ThemedText>
            </View>
          );
        default:
          return null;
      }
    },
    [router]
  );

  const keyExtractor = useCallback((item, index) => {
    if (item.type === "current") return `current-${item.order?._id ?? "none"}`;
    if (item.type === "upcoming") return `upcoming-${item.order?._id ?? index}`;
    return `${item.type}-${index}`;
  }, []);

  return (
    <SafeAreaView style={[global.pageWrap, { flex: 1 }]} edges={["top"]}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: (insets?.bottom || 0) + 16,
          paddingHorizontal: 0,
        }}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Home;
