import { StyleSheet, ViewStyle } from "react-native";
import colors from "../../theme/colors";

interface Style {
  container: ViewStyle;
  header: ViewStyle;
  headerTexts: ViewStyle;
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
      gap: 12,
    },
    headerTexts: {
      flex: 1,
      gap: 2,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
  });
