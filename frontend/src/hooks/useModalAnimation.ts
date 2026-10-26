/* APERTURA Y CIERRE SUAVES DEL MODAL */

import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing } from "react-native";

export const useModalAnimation = () => {
  const [progress] = useState(() => new Animated.Value(0));
  const closing = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    let active = true;
    const animation = Animated.spring(progress, {
      toValue: 1,
      stiffness: 190,
      damping: 24,
      mass: 0.8,
      overshootClamping: true,
      useNativeDriver: true,
    });

    animation.start();
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!active) return;
      reduceMotion.current = enabled;
      if (enabled && !closing.current) {
        animation.stop();
        progress.setValue(1);
      }
    }).catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      reduceMotion.current = enabled;
    });

    return () => {
      active = false;
      animation.stop();
      progress.stopAnimation();
      subscription.remove();
    };
  }, [progress]);

  const close = useCallback((onClosed: () => void) => {
    if (closing.current) return;
    closing.current = true;

    Animated.timing(progress, {
      toValue: 0,
      duration: reduceMotion.current ? 0 : 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClosed();
    });
  }, [progress]);

  return { progress, close };
};
