import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContactCard from "../../components/ContactCard";
import OrderCard from "../../components/OrderCard";
import UpcomingOrderCard from "../../components/UpcomingOrderCard";
import { ThemedText } from "../../components/ThemedText";
import { ThemedButton } from "../../components/ThemedButton";
import global from "../../styles/global";
import colors from "../../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import useSWR from "swr";
import fetcher from "../../lib/_fetcher";
import { api } from "../../lib/api";
import { useRouter } from "expo-router";

const Home = () => {
  const { token, user } = useAuth();
  const router = useRouter();

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

  const upcomingOrders = currentOrders?.slice(1) || [];

  return (
    <SafeAreaView style={global.pageWrap}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 32 }}>
          {/* Header */}
          <View style={global.headerWrap}>
            <View style={global.textWrapMainLeft}>
              <ThemedText>Welcome</ThemedText>
              <ThemedText>What's on the planning today?</ThemedText>
            </View>
            <View style={global.itemWrapper}>{/* profile image here */}</View>
          </View>
          {/* Body */}
          <View style={global.bodyWrap}>
            <View style={global.contentWrap}>
              <View style={global.sectionWrap}>
                <View style={global.sectionContainer}>
                  <ContactCard />
                </View>
                <View style={global.sectionContainer}>
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
                    {currentOrder ? (
                      <OrderCard
                        order={currentOrder}
                        stops={currentOrderStopsArray}
                        onPress={() =>
                          router.push(`/orders/${currentOrder._id}`)
                        }
                      />
                    ) : (
                      <ThemedText>No current orders</ThemedText>
                    )}
                  </View>
                </View>
                <View style={global.sectionContainer}>
                  <View style={global.sectionHeading}>
                    <View style={global.hFlexTiny}>
                      <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={16}
                        color={colors.text}
                      />
                      <ThemedText type="subtitle">Upcoming Orders</ThemedText>
                    </View>
                    {/* <View>
                      <ThemedButton variant="ghost" size="small">
                        See all
                      </ThemedButton>
                    </View> */}
                  </View>
                  <View>
                    {upcomingOrders && upcomingOrders.length > 0 ? (
                      upcomingOrders.map((order) => (
                        <UpcomingOrderCard
                          key={order._id}
                          order={order}
                          onPress={() => router.push(`/orders/${order._id}`)}
                        />
                      ))
                    ) : (
                      <ThemedText>No upcoming orders</ThemedText>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
