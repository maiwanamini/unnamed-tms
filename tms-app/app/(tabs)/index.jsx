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

const Home = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Fetch current and upcoming orders from backend
  const { data: currentOrders } = useSWR(
    token ? [api.orders, token] : null,
    fetcher
  );

  // Fetch stops for current order
  const currentOrder = currentOrders?.[0];
  const { data: currentOrderStops } = useSWR(
    token && currentOrder?._id
      ? [`${api.stops}?order=${currentOrder._id}`, token]
      : null,
    fetcher
  );

  const currentOrderStopsArray = Array.isArray(currentOrderStops)
    ? currentOrderStops
    : currentOrderStops?.data || [];

  const upcomingOrders = useMemo(
    () => currentOrders?.slice(1) || [],
    [currentOrders]
  );

  const listData = useMemo(() => {
    const items = [];
    if (currentOrder) {
      items.push({
        type: "current",
        order: currentOrder,
        stops: currentOrderStopsArray,
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
  }, [currentOrder, currentOrderStopsArray, upcomingOrders]);

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
