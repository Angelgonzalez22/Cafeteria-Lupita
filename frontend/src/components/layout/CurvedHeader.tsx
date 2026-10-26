/* ENCABEZADO AZUL CON CURVA RESPONSIVA */

import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { useResponsive } from "../../hooks/useResponsive";

type CurvedHeaderProps = PropsWithChildren<{
  backgroundColor?: string;
  curveColor?: string;
}>;

export const CurvedHeader = ({
  children,
  backgroundColor = colors.primary,
  curveColor = colors.background,
}: CurvedHeaderProps) => {
  const { horizontalPadding, maxContentWidth, isTablet } = useResponsive();

  return (
    <View style={{ backgroundColor, flexShrink: 0 }}>
      <SafeAreaView edges={["top", "left", "right"]}>
        <View
          style={[
            styles.content,
            {
              maxWidth: maxContentWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {children}
        </View>
      </SafeAreaView>

      <Svg
        width="100%"
        height={isTablet ? 40 : 24}
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        accessible={false}
      >
        <Path
          d="M0 0 Q200 60 400 0 V60 H0 Z"
          fill={curveColor}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignSelf: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
