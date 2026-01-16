"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <div className="fixed-top bg-white shadow-sm py-2" style={{ zIndex: 1030 }}>
      <div className="container">
        <button
          onClick={() => router.back()}
          className="btn btn-link d-inline-flex align-items-center text-primary p-0"
        >
          <i className="bi bi-arrow-left me-2 fs-5">Back</i>
        </button>
      </div>
    </div>
  );
}
