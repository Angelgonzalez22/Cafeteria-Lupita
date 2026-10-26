/* RECARGA POR GESTO CON INDICADOR VISUAL EN LOS SKELETONS */

import { RefreshControl } from "react-native";
import type { RefreshControlProps } from "react-native";

export const SkeletonRefreshControl = (props: Omit<RefreshControlProps, "refreshing">) => (
  <RefreshControl
    {...props}
    refreshing={false}
    tintColor="transparent"
    colors={["transparent"]}
    progressBackgroundColor="transparent"
    progressViewOffset={-1000}
  />
);
