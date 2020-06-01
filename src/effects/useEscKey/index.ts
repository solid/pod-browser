import { useEffect } from "react";

export const ESC_KEYCODE = 27;

export function handleEscKeydown(
  callback: (evnt: KeyboardEvent) => unknown
): (evnt: KeyboardEvent) => unknown {
  return (e: KeyboardEvent) => {
    if (!e?.keyCode) return;
    if (e.keyCode === ESC_KEYCODE) callback(e);
  };
}

export default function useEscKey(
  callback: (evnt: KeyboardEvent) => unknown
): void {
  return useEffect(() => {
    document.body.addEventListener("keydown", handleEscKeydown(callback));

    return () => {
      document.body.removeEventListener("keydown", handleEscKeydown(callback));
    };
  });
}
