"use client";

import { useEffect } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";

// loads saved favourites from localStorage once we're in the browser
export default function StoreHydration() {
  useEffect(() => {
    useExplorerStore.persist.rehydrate();
  }, []);
  return null;
}
