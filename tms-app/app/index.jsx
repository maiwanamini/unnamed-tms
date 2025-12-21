import { View } from "react-native";
import global from "../styles/global";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../components/ThemedText";
import { ThemedButton } from "../components/ThemedButton";
import { Link } from "expo-router";

import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { token, loading } = useAuth();
  if (loading) return null;
  return <Redirect href={token ? "/(tabs)" : "/(auth)"} />;
}

// return (
//   <SafeAreaView style={global.pageWrap}>
//     {/* body */}
//     <View style={global.bodyWrap}>
//       <View style={global.centerWrap}>
//         <View style={global.textWrapLargeCenter}>
//           <ThemedText>Welcome to</ThemedText>
//           <ThemedText type="title">The Unnamed TMS</ThemedText>
//           <ThemedText style={global.faded}>
//             Your go-to app for truckers
//           </ThemedText>
//           <Link href="/(tabs)">go to home</Link>
//         </View>
//       </View>
//     </View>

//     {/* footer */}
//     <View style={global.footerWrap}>
//       <View style={global.buttonWrap}>
//         <ThemedButton>Log in</ThemedButton>
//         <ThemedButton variant="twoLines">
//           By continuing you agree to the Terms of Service and Privacy Policy
//         </ThemedButton>
//       </View>
//     </View>
//   </SafeAreaView>
// );
