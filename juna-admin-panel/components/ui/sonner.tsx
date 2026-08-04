"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster({ ...props }: React.ComponentProps<typeof SonnerToaster>) {
  return (
    <SonnerToaster
      theme="light"
      toastOptions={{
        style: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "14px",
        },
      }}
      {...props}
    />
  );
}
