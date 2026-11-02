import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          © {siteConfig.name}. Built as a portfolio project.
        </p>
        <p className="text-xs">Powered by AI · Free &amp; open source.</p>
      </div>
    </footer>
  );
}