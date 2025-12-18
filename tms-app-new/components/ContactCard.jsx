import React from "react";
import { View } from "react-native";
import global from "../styles/global";
import colors from "../theme/colors";
import { ThemedText } from "./ThemedText";
import IconButton from "./IconButton";
import { MaterialIcons } from "@expo/vector-icons";

const ContactCard = () => {
  return (
    <View
      style={{
        gap: 16,
        backgroundColor: "white",
        padding: 8,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View>
        {/* profile image */}
        <View style={global.textWrapMainLeftSmallest}>
          <ThemedText>*Company name here*</ThemedText>
          <ThemedText>*Company information here*</ThemedText>
        </View>
      </View>
      <View style={global.buttonWrapSmall}>
        <IconButton
          icon={<MaterialIcons name="phone" size={16} color={colors.muted} />}
          //   get dynamic
          href="tel:+32468292698"
          accessibilityLabel="Call +32 468 34 54 17"
        />
        <IconButton
          icon={<MaterialIcons name="email" size={16} color={colors.muted} />}
          //   get dynamic
          href="mailto:jorre.vandenbussche@student.ap.be"
          accessibilityLabel="Email jorre.vandenbussche@student.ap.be"
        />
      </View>
    </View>
  );
};

export default ContactCard;
