import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Loader2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnnotationCard } from '@/components/AnnotationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { NHCRecord } from '@shared/types';
export function HomePage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const { data, isLoading, error, refetch, isRefetching } = useQuery<{ items: NHCRecord[], next: string | null, total: number }>({
    queryKey: ['nhc-records', cursor],
    queryFn: () => api<{ items: NHCRecord[], next: string | null, total: number }>(`/api/nhc-records?limit=15${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`),
    staleTime: 1000 * 60 * 5,
  });
  const handleNext = () => {
    if (data?.next) {
      setHistory(prev => [...prev, cursor]);
      setCursor(data.next);
    }
  };
  const handlePrev = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCursor(prev);
    }
  };
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-20">
          <header className="mb-16 text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-hive shadow-lg"
            >
              <Hexagon className="w-8 h-8 text-white fill-current" />
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight">
                Niche <span className="text-gradient">Hive</span> Explorer
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground text-pretty">
                Curated insights and structured knowledge from the Niche Hive.
              </p>
            </div>
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button onClick={() => refetch()} disabled={isLoading || isRefetching} variant="ghost" size="sm">
                {isRefetching ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
                Sync Hive
              </Button>
            </div>
          </header>
          <main>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 p-6 rounded-xl border border-white/10 h-64">
                    <Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-full" /><Skeleton className="h-24 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-destructive/5 rounded-2xl border-2 border-dashed border-destructive/20">
                <p className="text-destructive font-bold mb-4">Error loading knowledge records</p>
                <Button variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            ) : (
              <>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[600px]"
                >
                  <AnimatePresence mode="popLayout">
                    {data?.items.map((record, index) => (
                      <AnnotationCard key={record.id} record={record} index={index} />
                    ))}
                  </AnimatePresence>
                </motion.div>
                {data?.items.length === 0 && (
                  <div className="text-center py-24 opacity-50">Empty Hive.</div>
                )}
                <div className="mt-16 flex items-center justify-center gap-8">
                  <Button 
                    onClick={handlePrev} 
                    disabled={history.length === 0 || isRefetching}
                    variant="outline"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Page {history.length + 1}
                  </span>
                  <Button 
                    onClick={handleNext} 
                    disabled={!data?.next || isRefetching}
                    variant="outline"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}