import { StyleSheet } from "react-native";
import colors from "../theme/colors";

export default StyleSheet.create({
  body: {
    fontsize: 20,
    color: colors.text,
  },
  tag: {
    backgroundColor: colors.successBackground,
    color: colors.successForeground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
