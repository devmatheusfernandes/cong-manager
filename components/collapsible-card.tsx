"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CollapsibleCardProps {
  title: string;
  icon?: LucideIcon;
  badge?: string | React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function CollapsibleCard({
  title,
  icon: Icon,
  badge,
  children,
  defaultExpanded = false,
}: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className="rounded-2xl border overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <span className="font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {badge &&
              (typeof badge === "string" ? (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {badge}
                </span>
              ) : (
                badge
              ))}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border/50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
