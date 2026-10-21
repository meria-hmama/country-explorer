"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCountries } from "@/lib/countriesApi";

// status is always one of: "loading", "success", "error"
export function useCountries() {
  const [state, setState] = useState({ status: "loading", data: [], error: null });
  const [request, setRequest] = useState({ id: 0, simulateError: false });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: "loading", error: null }));

    fetchCountries({ simulateError: request.simulateError, signal: controller.signal })
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((err) => {
        if (err.aborted) return; // unmounted or replaced by a newer request
        setState({ status: "error", data: [], error: err.message });
      });

    return () => controller.abort();
  }, [request]);

  const retry = useCallback(
    () => setRequest((r) => ({ id: r.id + 1, simulateError: false })),
    []
  );
  const simulateError = useCallback(
    () => setRequest((r) => ({ id: r.id + 1, simulateError: true })),
    []
  );

  return { ...state, retry, simulateError };
}
