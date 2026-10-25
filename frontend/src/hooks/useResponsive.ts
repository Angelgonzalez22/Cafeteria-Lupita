/* MEDIDAS DE LA PANTALLA */

import { useWindowDimensions } from "react-native";
import { spacing } from "../constants/spacing";

export const useResponsive = () => {
  const { width, height, fontScale } = useWindowDimensions();

  const isSmallPhone = width < 380;
  const isTablet = width >= 600;
  const isLargeTablet = width >= 900;

  return {
    width,
    height,
    fontScale,

    isSmallPhone,
    isTablet,
    isLargeTablet,

    horizontalPadding: isTablet
      ? spacing.xxl
      : spacing.base,

    maxContentWidth: isLargeTablet ? 1200 : 900,
  };
};

