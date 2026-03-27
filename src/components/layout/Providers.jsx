"use client";

import { SessionProvider } from "next-auth/react";
import { SearchProvider } from "@/context/SearchContext";
import { TrackedSeriesProvider } from "@/context/TrackedSeriesContext";
import { ToastProvider } from "@/context/ToastContext";
import { ListProvider } from "@/context/ListContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ListProvider>
          <TrackedSeriesProvider>
            <SearchProvider>{children}</SearchProvider>
          </TrackedSeriesProvider>
        </ListProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
