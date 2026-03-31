import { TrendingUp, Github, ExternalLink } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">CryptoScope</span>
            <span className="text-muted-foreground text-sm">
              — real-time crypto market data
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link
              to="/"
              viewTransition
              className="hover:text-foreground transition-colors"
            >
              Markets
            </Link>
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Powered by CoinGecko
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          © {year} CryptoScope. Market data provided by{" "}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            CoinGecko
          </a>
          . Not financial advice.
        </div>
      </div>
    </footer>
  );
}
