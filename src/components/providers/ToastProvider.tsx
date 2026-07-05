"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize:   "0.875rem",
          fontWeight: "500",
          borderRadius: "6px",
          boxShadow: "0 4px 20px rgba(20,8,12,0.13)",
        },
        success: {
          iconTheme: {
            primary: "#2d6a4f",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#b5485a",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}