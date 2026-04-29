import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Hexagon, Loader2, RefreshCw, Bee } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnnotationCard } from '@/components/AnnotationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { HypothesisAnnotation } from '@shared/types';
export function HomePage() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<HypothesisAnnotation[]>({
    queryKey: ['nhc-content'],
    queryFn: () => api<HypothesisAnnotation[]>('/api/nhc-content'),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Visual Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-20 lg:py-24">
          {/* Hero Section */}
          <header className="relative z-10 mb-16 text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-hive shadow-lg shadow-amber-500/20"
            >
              <Hexagon className="w-8 h-8 text-white fill-current" />
            </motion.div>
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-display font-black tracking-tight"
              >
                Niche <span className="text-gradient">Hive</span> Content
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-pretty"
              >
                Curated insights and web annotations from Keith Taylor's digital garden. 
                A living stream of knowledge from the Niche Hive.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center items-center gap-4 pt-4"
            >
              <Button 
                onClick={() => refetch()} 
                disabled={isLoading || isRefetching}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-amber-500"
              >
                {isRefetching ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
                Refresh Content
              </Button>
            </motion.div>
          </header>
          {/* Main Grid */}
          <main className="relative z-10">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 px-6 rounded-2xl border-2 border-dashed border-destructive/20 bg-destructive/5">
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-xl font-bold text-destructive">Failed to load content</h3>
                  <p className="text-muted-foreground">We encountered an issue connecting to the Hypothes.is hive. Please try again later.</p>
                  <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
                </div>
              </div>
            ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              >
                {data?.map((item, index) => (
                  <AnnotationCard key={item.id} annotation={item} index={index} />
                ))}
                {data?.length === 0 && (
                  <div className="col-span-full text-center py-24 opacity-50">
                    <p className="text-lg">The hive is empty... check back later.</p>
                  </div>
                )}
              </motion.div>
            )}
          </main>
          <footer className="mt-24 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Curated by Keith Taylor</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Powered by Hypothes.is</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Niche Hive Explorer</p>
          </footer>
        </div>
      </div>
    </div>
  );
}