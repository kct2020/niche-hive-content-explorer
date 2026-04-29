import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
/**
 * Main application layout optimized for the Niche Hive Explorer.
 * Uses the non-negotiable gutters and spacing.
 */
export function AppLayout({ children, container = true, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarInset className={className}>
        {container ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`py-8 md:py-10 lg:py-12 ${contentClassName || ""}`}>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}