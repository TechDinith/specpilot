import Link from "next/link";
import { auth } from "@/lib/auth/server";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  let user: { email?: string | null } | null = null;
  if (process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET) {
    try {
      const { data: session } = await auth.getSession();
      user = session?.user ?? null;
    } catch {
      user = null;
    }
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
          <Link href="/projects" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Projects
          </Link>
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <SignOutButton />
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