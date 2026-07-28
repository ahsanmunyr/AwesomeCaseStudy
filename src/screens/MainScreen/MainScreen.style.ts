import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import colors from "../../theme/colors";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  listContent: ViewStyle;
}

export default () =>
  StyleSheet.create<Style>({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 10,
      gap: 2,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
  });
