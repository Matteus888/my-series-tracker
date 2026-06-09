"use client";

import { SessionProvider } from "next-auth/react";
import { SearchProvider } from "@/context/SearchContext";
import { TrackedSeriesProvider } from "@/context/TrackedSeriesContext";
import { ToastProvider } from "@/context/ToastContext";
import { ListProvider } from "@/context/ListContext";
import { NavigationProgressProvider } from "@/context/NavigationProgressContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <NavigationProgressProvider>
        <ToastProvider>
          <ListProvider>
            <TrackedSeriesProvider>
              <SearchProvider>{children}</SearchProvider>
            </TrackedSeriesProvider>
          </ListProvider>
        </ToastProvider>
      </NavigationProgressProvider>
    </SessionProvider>
  );
}
