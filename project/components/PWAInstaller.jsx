"use client";

import { useEffect } from "react";

export default function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(
        (registration) => {
          console.log("SW registered:", registration);
        },
        (err) => {
          console.log("SW registration failed:", err);
        },
      );
    }
  }, []);

  return null;
}
