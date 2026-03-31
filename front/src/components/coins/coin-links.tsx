import { ExternalLink, Github, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SlideUp } from "@/components/ui/animations";
import { formatDate } from "@/lib/utils";
import type { CoinDetail } from "@/types/api";

interface CoinLinksProps {
  links: CoinDetail["links"];
  lastUpdated: string;
}

export function CoinLinks({ links, lastUpdated }: CoinLinksProps) {
  return (
    <SlideUp delay={0.2}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {links.homepage
              ?.filter(Boolean)
              .slice(0, 1)
              .map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              ))}
            {links.reposUrl?.github
              ?.filter(Boolean)
              .slice(0, 2)
              .map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                >
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              ))}
            {links.blockchainSite
              ?.filter(Boolean)
              .slice(0, 2)
              .map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-accent transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Explorer
                </a>
              ))}
          </div>

          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDate(lastUpdated)}
          </p>
        </CardContent>
      </Card>
    </SlideUp>
  );
}
