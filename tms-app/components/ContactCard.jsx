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

const ContactCard = ({ companyId, contact }) => {
  const { token } = useAuth();

  const resolvedCompanyId = companyId || contact?.companyId;

  // Fetch a single company by id (when provided)
  const { data: company } = useSWR(
    token && resolvedCompanyId
      ? [`${api.companies}/${resolvedCompanyId}`, token]
      : null,
    fetcher
  );

  // Fallback: fetch all companies and pick the first if no companyId was passed
  const { data: companies } = useSWR(
    token && !resolvedCompanyId ? [api.companies, token] : null,
    fetcher
  );

  const effectiveCompany = resolvedCompanyId
    ? company
    : Array.isArray(companies) && companies.length > 0
    ? companies[0]
    : null;

  const name = effectiveCompany?.name || "Company name";
  const info = effectiveCompany?.companyId
    ? effectiveCompany.companyId
    : "Company information";
  const email = effectiveCompany?.email;
  const phone = effectiveCompany?.phone;

  return (
    <View
      style={{
        gap: 16,
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        justifyContent: "space-between",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.text,
          }}
        />
        <View style={global.textWrapMainLeftSmallest}>
          <ThemedText type="h2" style={{ marginBottom: 2 }}>
            {name}
          </ThemedText>
          <ThemedText style={{ color: colors.muted }}>
            {`DOT:${info}`}
          </ThemedText>
        </View>
      </View>
      <View style={[global.buttonWrapSmall, { columnGap: 4 }]}>
        {email ? (
          <IconButton
            icon={<MaterialIcons name="email" size={18} color={colors.muted} />}
            href={`mailto:${email}`}
            accessibilityLabel={`Email ${email}`}
          />
        ) : null}
        {phone ? (
          <IconButton
            icon={<MaterialIcons name="call" size={18} color={colors.muted} />}
            href={`tel:${phone}`}
            accessibilityLabel={`Call ${phone}`}
          />
        ) : null}
      </View>
    </View>
  );
};

export default ContactCard;
