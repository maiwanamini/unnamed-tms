import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContactCard from "../../components/ContactCard";
import OrderCard from "../../components/OrderCard";

import { ThemedText } from "../../components/ThemedText";
import { ThemedButton } from "../../components/ThemedButton";

import global from "../../styles/global";
import colors from "../../theme/colors";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";

const Home = () => {
  return (
    <SafeAreaView style={global.pageWrap}>
      <ScrollView>
        <View style={{ gap: 32 }}>
          {/* Header */}
          <View style={global.headerWrap}>
            <View style={global.textWrapMainLeft}>
              <ThemedText>Welcome</ThemedText>
              <ThemedText>What’s on the planning today?</ThemedText>
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
                        color={colors.muted}
                      />
                      <ThemedText type="subtitle">Current Order</ThemedText>
                    </View>
                    <View>
                      <ThemedButton
                        text="See all"
                        variant="ghost"
                        size="small"
                      />
                    </View>
                  </View>
                  <View>
                    <OrderCard />
                  </View>
                </View>
                <View style={global.sectionContainer}>
                  <View style={global.sectionHeading}>
                    <View style={global.hFlexTiny}>
                      <MaterialCommunityIcons
                        name="package-variant-closed"
                        size={16}
                        color={colors.muted}
                      />
                      <ThemedText type="subtitle">Upcomming Orders</ThemedText>
                    </View>
                    <View>
                      <ThemedButton
                        text="See all"
                        variant="ghost"
                        size="small"
                      />
                    </View>
                  </View>
                  <View>
                    <OrderCard />
                    <OrderCard />
                    <OrderCard />
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
