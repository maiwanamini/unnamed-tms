import React from "react";
import { View } from "react-native";
import useSWR from "swr";
import fetcher from "../lib/_fetcher";
import { api } from "../lib/api";
import global from "../styles/global";
import colors from "../theme/colors";
import { ThemedText } from "./ThemedText";
import IconButton from "./IconButton";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const ContactCard = ({ contact }) => {
  const { token } = useAuth();

  const { data: users } = useSWR(token ? [api.users, token] : null, fetcher);

  const u = contact || (users && users.length > 0 ? users[0] : null);

  const name = u?.companyName || u?.name || "Company name";
  const info = u?.companyInfo || u?.email || "Company information";
  const phone = u?.phone || u?.telephone;
  const email = u?.email;

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
          <ThemedText>{name}</ThemedText>
          <ThemedText>{info}</ThemedText>
        </View>
      </View>
      <View style={global.buttonWrapSmall}>
        {phone ? (
          <IconButton
            icon={
              <MaterialIcons name="phone" size={16} color={colors.accent} />
            }
            href={`tel:${phone}`}
            accessibilityLabel={`Call ${phone}`}
          />
        ) : null}
        {email ? (
          <IconButton
            icon={
              <MaterialIcons name="email" size={16} color={colors.accent} />
            }
            href={`mailto:${email}`}
            accessibilityLabel={`Email ${email}`}
          />
        ) : null}
      </View>
    </View>
  );
};

export default ContactCard;
