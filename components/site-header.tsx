import Link from "next/link";
import { siteConfig } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
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
          <Link href="/analyze" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}