"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}