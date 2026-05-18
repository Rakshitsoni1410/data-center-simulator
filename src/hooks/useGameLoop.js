import { useEffect } from "react";

export const useGameLoop = (
  callback,
  speed = 1000,
  active = true
) => {
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      callback();
    }, speed);

    return () => clearInterval(interval);
  }, [callback, speed, active]);
};