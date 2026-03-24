"use client";

import { SessionProvider } from "next-auth/react";
import { SearchProvider } from "@/context/SearchContext";
import { TrackedSeriesProvider } from "@/context/TrackedSeriesContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <TrackedSeriesProvider>
        <SearchProvider>{children}</SearchProvider>
      </TrackedSeriesProvider>
    </SessionProvider>
  );
}
