import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import useSWR from "swr";
import { useAuth } from "../../../context/AuthContext";
import fetcher from "../../../lib/_fetcher";
import { api } from "../../../lib/api";

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();

  const { data } = useSWR(
    token ? [`${api.orders}/${id}`, token] : null,
    fetcher
  );

  if (!data) return null;

  return (
    <View style={{ padding: 16 }}>
      <Text>Order #{data.id}</Text>
      {data.stops?.map((s) => (
        <Text key={s.id}>{s.address}</Text>
      ))}
    </View>
  );
}
