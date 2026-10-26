/* TRANSICIÓN DEL ESTADO DEL BOTÓN */

import { useEffect, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

export const useButtonAnimation = (disabled: boolean) => {
  const [progress] = useState(() => new Animated.Value(disabled ? 0 : 1));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;

    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) {
        setReduceMotion(enabled);
      }
    }).catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(disabled ? 0 : 1);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: disabled ? 0 : 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
      isInteraction: false,
    });

    animation.start();

    return () => {
      animation.stop();
    };
  }, [disabled, progress, reduceMotion]);

  return progress;
};
