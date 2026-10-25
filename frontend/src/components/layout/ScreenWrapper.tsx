/* ENVOLVENTE PARA EL DISEÑO DE LA PANTALLA */
import { ReactNode } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import {
  SafeAreaView,
  Edge,
} from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useResponsive } from "../../hooks/useResponsive";

type ScreenWrapperProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboardAvoiding?: boolean;
  edges?: Edge[];
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export const ScreenWrapper = ({
  children,
  scroll = false,
  padded = true,
  keyboardAvoiding = false,
  edges = ["top", "bottom"],
  backgroundColor = colors.background,
  style,
  contentStyle,
}: ScreenWrapperProps) => {
  const { horizontalPadding, maxContentWidth } =
    useResponsive();

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    {
      maxWidth: maxContentWidth,
      paddingHorizontal: padded
        ? horizontalPadding
        : 0,
    },
    !scroll && styles.flex,
    contentStyle,
  ];

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingVertical: padded ? spacing.base : 0 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={containerStyles}>
        {children}
      </View>
    </ScrollView>
  ) : (
    <View style={styles.flex}>
      <View style={containerStyles}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        { backgroundColor },
        style,
      ]}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  container: {
    width: "100%",
    alignSelf: "center",
  },
});
