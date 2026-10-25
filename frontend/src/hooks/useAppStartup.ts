/* Coordina la presentación inicial y la salida del splash nativo. */

import { useCallback, useEffect, useState } from "react";
import * as NativeSplashScreen from "expo-splash-screen";

export const useAppStartup = (ready: boolean, busy: boolean) => {
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 900);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleLayout = useCallback(() => {
    void NativeSplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return {
    showSplash: !introFinished || (!ready && busy),
    handleLayout,
  };
};