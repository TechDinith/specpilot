import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          {siteConfig.name} — AI-powered project planning.
        </p>
        <p className="text-xs">
          © {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}