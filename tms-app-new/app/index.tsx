import { Text, View } from "react-native";
import global from "../styles/global";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={global.body}>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
