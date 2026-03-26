"use client";

import { SessionProvider } from "next-auth/react";
import { SearchProvider } from "@/context/SearchContext";
import { TrackedSeriesProvider } from "@/context/TrackedSeriesContext";
import { ToastProvider } from "@/context/ToastContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <TrackedSeriesProvider>
          <SearchProvider>{children}</SearchProvider>
        </TrackedSeriesProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
