"use client";

import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export const useAuthGuard = () => {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const requireAuth = (callback) => {
    if (!session) {
      showToast(
        <span>
          Please{" "}
          <Link href="/login" style={{ textDecoration: "underline", fontWeight: "bold" }}>
            log in
          </Link>{" "}
          to continue.
        </span>,
        "error",
      );
      return false;
    }
    callback();
    return true;
  };
  return { requireAuth, isAuthenticated: !!session };
};
