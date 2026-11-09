"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            {siteConfig.shortName}
          </span>
          <span>{siteConfig.name}</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/analyze" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Analyze
          </Link>
          {user && (
            <Link href="/projects" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Projects
            </Link>
          )}
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth/sign-in" className={cn(buttonVariants({ size: "sm" }))}>
              Sign in
            </Link>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}