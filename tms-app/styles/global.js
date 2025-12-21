import { StyleSheet } from "react-native";

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
    gap: 8,
  },
  centerWrap: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  bodyWrap: {
    flex: 1,

    gap: 8,
  },
  footerWrap: {
    gap: 8,
  },
  buttonWrap: {
    gap: 8,
  },
  contentWrap: {
    gap: 16,
  },
  buttonWrapSmall: {
    flexDirection: "row",
    gap: 4,
  },
  textWrapLargeCenter: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  textWrapMainLeft: {
    gap: 8,
  },
  textWrapMainLeftSmallest: {
    gap: 0,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sectionWrap: {
    gap: 32,
  },
  sectionContainer: { gap: 8 },
  hSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  hFlexTiny: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  //
  faded: { opacity: 0.6 },
});
