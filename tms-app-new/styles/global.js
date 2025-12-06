import { StyleSheet } from "react-native";
import colors from "../theme/colors";

export default StyleSheet.create({
  // Layout
  pageWrap: {
    width: "100%",
    alignItems: "stretch",
    flex: 1,
    paddingHorizontal: 16,
    gap: 32,
  },
  headerWrap: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  bodyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  footerWrap: {
    gap: 8,
  },
  buttonWrap: {
    gap: 8,
  },
  contentWrap: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  textWrap: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  //
  faded: { opacity: 0.6 },
});
