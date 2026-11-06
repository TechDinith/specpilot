"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/components/auth/auth-provider";
import { authClient } from "@/lib/auth/client";

export function AuthProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        authClient={authClient}
        navigate={({ to, replace }) => {
          const target = to.startsWith("//") ? "/" : to;
          if (replace) router.replace(target);
          else router.push(target);
        }}
        Link={Link}
        redirectTo="/"
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}