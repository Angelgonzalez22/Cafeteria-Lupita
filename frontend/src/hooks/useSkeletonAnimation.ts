/* PULSO SUAVE DE LOS SKELETONS DE CARGA */

import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing } from "react-native";

export const useSkeletonAnimation = () => {
  const [opacity] = useState(() => new Animated.Value(0.75));
  const [reduceMotion, setReduceMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState !== "background");

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    }).catch(() => undefined);
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    const state = AppState.addEventListener("change", (value) => setActive(value === "active"));

    return () => {
      mounted = false;
      motion.remove();
      state.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion || !active) {
      opacity.setValue(0.75);
      return;
    }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.35, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true, isInteraction: false }),
      Animated.timing(opacity, { toValue: 0.85, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();

    return () => animation.stop();
  }, [opacity, reduceMotion, active]);

  return opacity;
};
