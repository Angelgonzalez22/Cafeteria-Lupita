/* PESTAÑAS DISPONIBLES SEGÚN EL ROL */

import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import type { MainTabParamList } from "../models/auth/navigation";
import { RoleHomeScreen } from "../screens/home/RoleHomeScreen";
import { PedidosScreen } from "../screens/pedidos/PedidosScreen";
import { ProductosScreen } from "../screens/productos/ProductosScreen";
import { ReportesScreen } from "../screens/reportes/ReportesScreen";
import { ConfiguracionScreen } from "../screens/settings/ConfiguracionScreen";
import { useSessionStore } from "../store/sessionStore";

const Tab = createBottomTabNavigator<MainTabParamList>();
const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Inicio: "home-outline",
  Pedidos: "receipt-outline",
  Productos: "cube-outline",
  Reportes: "bar-chart-outline",
  Configuracion: "settings-outline",
};

export const MainTabNavigator = () => {
  const role = useSessionStore((state) => state.session?.usuario.rol);
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: "fade",
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 180,
          },
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarActiveBackgroundColor: "transparent",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarButton: (props) => (
          <PlatformPressable
            {...props}
            pressColor="transparent"
            pressOpacity={1}
            android_ripple={{ color: "transparent", borderless: false }}
            hoverEffect={{ color: "transparent", hoverOpacity: 0, activeOpacity: 0 }}
          />
        ),
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, { height: 50 + insets.bottom, paddingBottom: insets.bottom }],
        tabBarIcon: ({ color }) => (
          <Ionicons
            name={icons[route.name]}
            size={19}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={RoleHomeScreen}
      />
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
      />
      {role === "ADMINISTRADOR" && (
        <>
          <Tab.Screen
            name="Productos"
            component={ProductosScreen}
          />
          <Tab.Screen
            name="Reportes"
            component={ReportesScreen}
          />
        </>
      )}
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{ title: "Configuración", tabBarLabel: "Config.", tabBarAccessibilityLabel: "Configuración" }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    paddingTop: 3,
    elevation: 0,
  },
  item: {
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
});
