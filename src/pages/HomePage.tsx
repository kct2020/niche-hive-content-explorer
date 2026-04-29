import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Loader2, RefreshCw, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnnotationCard } from '@/components/AnnotationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { NHCRecord } from '@shared/types';
export function HomePage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const { data, isLoading, error, refetch, isRefetching } = useQuery<{ items: NHCRecord[], next: string | null, total: number }>({
    queryKey: ['nhc-records', cursor, selectedNiche],
    queryFn: () => api<{ items: NHCRecord[], next: string | null, total: number }>(
      `/api/nhc-records?limit=30${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}${selectedNiche ? `&niche=${encodeURIComponent(selectedNiche)}` : ''}`
    ),
    staleTime: 1000 * 60 * 5,
  });
  const niches = useMemo(() => {
    if (!data?.items) return [];
    const set = new Set(data.items.map(i => i.metadata.niche));
    return Array.from(set).sort();
  }, [data?.items]);
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(item => {
      const searchStr = search.toLowerCase();
      const title = (item.metadata.title || '').toLowerCase();
      const desc = (item.metadata.description || '').toLowerCase();
      return title.includes(searchStr) || desc.includes(searchStr);
    });
  }, [data?.items, search]);
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
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16 lg:py-20">
          <header className="mb-12 text-center space-y-6">
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
                A visually stunning curated feed of specialized knowledge, insights, and digital gardening notes.
              </p>
            </div>
          </header>
          <div className="mb-12 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search titles and summaries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-secondary/50 border-input/50 focus:ring-amber-500/50"
                />
              </div>
              <Button onClick={() => refetch()} disabled={isLoading || isRefetching} variant="outline" size="sm" className="shrink-0">
                {isRefetching ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-2" />}
                Sync Hive
              </Button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <div className="flex items-center gap-2 pr-4 border-r border-border shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Niches</span>
              </div>
              <Button
                variant={selectedNiche === null ? "default" : "ghost"}
                size="sm"
                onClick={() => { setSelectedNiche(null); setCursor(null); setHistory([]); }}
                className={cn("rounded-full px-4 h-8 text-xs font-bold", selectedNiche === null && "bg-amber-500 hover:bg-amber-600")}
              >
                All
              </Button>
              {niches.map(niche => (
                <Button
                  key={niche}
                  variant={selectedNiche === niche ? "default" : "ghost"}
                  size="sm"
                  onClick={() => { setSelectedNiche(niche); setCursor(null); setHistory([]); }}
                  className={cn("rounded-full px-4 h-8 text-xs font-bold whitespace-nowrap", selectedNiche === niche && "bg-amber-500 hover:bg-amber-600")}
                >
                  {niche}
                </Button>
              ))}
            </div>
          </div>
          <main>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4 p-6 rounded-xl border border-white/10 h-80 bg-card/20">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-dashed border-destructive/20">
                <p className="text-destructive font-bold mb-4">Error accessing the Hive nodes</p>
                <Button variant="outline" onClick={() => refetch()}>Retry Connection</Button>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((record, index) => (
                      <AnnotationCard key={record.id} record={record} index={index} />
                    ))}
                  </AnimatePresence>
                </motion.div>
                {filteredItems.length === 0 && (
                  <div className="text-center py-32 space-y-4">
                    <div className="text-4xl">🍯</div>
                    <p className="text-muted-foreground font-medium">No results found in this sector of the Hive.</p>
                  </div>
                )}
                <div className="mt-16 flex items-center justify-center gap-8">
                  <Button
                    onClick={handlePrev}
                    disabled={history.length === 0 || isRefetching}
                    variant="ghost"
                    className="hover:text-amber-500"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <div className="h-8 px-4 rounded-full bg-secondary flex items-center justify-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Sector {history.length + 1}
                  </div>
                  <Button
                    onClick={handleNext}
                    disabled={!data?.next || isRefetching}
                    variant="ghost"
                    className="hover:text-amber-500"
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