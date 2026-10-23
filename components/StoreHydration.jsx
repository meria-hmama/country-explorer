"use client";

import { useEffect } from "react";
import { useExplorerStore } from "@/store/useExplorerStore";

// Loads saved favourites/sort from localStorage once the page is in the browser.
export default function StoreHydration() {
  useEffect(() => {
    useExplorerStore.persist.rehydrate();
  }, []);
  return null;
}
