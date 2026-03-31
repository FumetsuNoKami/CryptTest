import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlideUp } from "@/components/ui/animations";

const COLLAPSED_HEIGHT = 144; // ~6 lines × 24px

interface CoinDescriptionProps {
  name: string;
  description: string;
}

export function CoinDescription({ name, description }: CoinDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  return (
    <SlideUp delay={0.16}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">About {name}</CardTitle>
        </CardHeader>
        <CardContent className="relative pb-0">
          <motion.div
            animate={{ height: expanded ? "auto" : COLLAPSED_HEIGHT }}
            initial={false}
            transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-4">
              {description}
            </p>
          </motion.div>

          {/* Gradient overlay + toggle button */}
          <AnimatePresence initial={false}>
            {!expanded && (
              <motion.div
                key="overlay"
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(1px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent rounded-b-xl pointer-events-none backdrop-blur-[1px]"
              />
            )}
          </AnimatePresence>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer relative z-10 w-full flex items-center justify-center gap-1 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
            {expanded ? "Show less" : "Show more"}
          </button>
        </CardContent>
      </Card>
    </SlideUp>
  );
}
