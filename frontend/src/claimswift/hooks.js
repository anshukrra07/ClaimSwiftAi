import { useCallback, useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, tone = "teal") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, tone }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  return { toasts, addToast };
}
