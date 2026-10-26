/* MENSAJES DEL SPLASH */

import { useEffect, useState } from "react";

const messages = [
  "Mejor control de tus pedidos",
  "Tu menú, siempre a mano",
  "Todo listo para servir mejor",
];

export const useSplashMessages = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return messages[messageIndex];
};
