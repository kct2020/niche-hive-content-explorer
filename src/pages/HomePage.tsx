import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Loader2, RefreshCw, ChevronLeft, ChevronRight, Search, Filter, Activity, Info, ShieldCheck, Zap, Server, Globe, Terminal } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnnotationCard } from '@/components/AnnotationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api, checkHealth } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { NHCRecord } from '@shared/types';
import { MOCK_NHC_RECORDS } from '@shared/mock-data';
export function HomePage() {
  const [searchParams] = useSearchParams();
  const isDemoMode = searchParams.get('demo') === '1';
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const [search, setSearch] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: checkHealth,
    refetchInterval: 30000,
  });
  const { data, isLoading, error, refetch, isRefetching } = useQuery<{ items: NHCRecord[], next: string | null, total: number }>({
    queryKey: ['nhc-records', cursor, selectedNiche],
    queryFn: () => api<{ items: NHCRecord[], next: string | null, total: number }>(
      `/api/nhc-records?limit=30${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}${selectedNiche ? `&niche=${encodeURIComponent(selectedNiche)}` : ''}`
    ),
    staleTime: 1000 * 60 * 5,
  });
  const rawItems = useMemo(() => {
    const fetchedItems = data?.items ?? [];
    if (isDemoMode || (fetchedItems.length === 0 && !isLoading)) {
      return [...fetchedItems, ...MOCK_NHC_RECORDS];
    }
    return fetchedItems;
  }, [data?.items, isDemoMode, isLoading]);
  const niches = useMemo(() => {
    const set = new Set(rawItems.map(i => i.metadata.niche));
    return Array.from(set).sort();
  }, [rawItems]);
  const filteredItems = useMemo(() => {
    return rawItems.filter(item => {
      const searchStr = search.toLowerCase();
      const title = (item.metadata.title || '').toLowerCase();
      const desc = (item.metadata.description || '').toLowerCase();
      const nicheMatch = !selectedNiche || item.metadata.niche === selectedNiche;
      const searchMatch = title.includes(searchStr) || desc.includes(searchStr);
      return nicheMatch && searchMatch;
    });
  }, [rawItems, search, selectedNiche]);
  const handleNext = () => {
    if (data?.next) {
      setHistory(prev => [...prev, cursor]);
      setCursor(data.next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handlePrev = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setCursor(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-amber-500/30">
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-amber-500/[0.08] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-amber-500/[0.05] blur-[120px] rounded-full pointer-events-none" />
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 lg:py-32">
          <header className="mb-20 text-center space-y-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center p-4 mb-2 rounded-3xl bg-gradient-hive shadow-2xl shadow-amber-500/20 cursor-pointer hover:rotate-6 transition-transform group"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              title="View Node Connectivity"
            >
              <Hexagon className="w-10 h-10 text-white fill-current group-hover:animate-pulse" />
            </motion.div>
            <div className="space-y-6">
              <h1 className="text-4xl xs:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight leading-none text-pretty">
                Niche <span className="text-gradient">Hive</span> Explorer
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-2xl text-muted-foreground/80 font-medium leading-relaxed px-4">
                Curated insights from the decentralized web, archived for permanent discoverability.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-2 py-1.5 px-4 transition-all duration-500 border-2",
                    healthData?.status === 'healthy'
                      ? "border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400"
                      : "border-amber-500/20 bg-amber-500/[0.03] text-amber-600 dark:text-amber-400"
                  )}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="font-black text-[10px] uppercase tracking-widest">
                    Node: {healthData?.status === 'healthy' ? 'CONNECTED' : 'SYNCING'}
                  </span>
                </Badge>
                <Badge variant="outline" className="border-amber-500/20 bg-amber-500/[0.03] text-amber-600 dark:text-amber-400 gap-2 py-1.5 px-4 border-2">
                  <Info className="w-3.5 h-3.5" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Archive: {data?.total ?? rawItems.length} Records</span>
                </Badge>
                {isDemoMode && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none py-1.5 px-4 shadow-lg shadow-blue-600/20">
                    <Terminal className="w-3.5 h-3.5 mr-2" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Demo Sandbox</span>
                  </Badge>
                )}
              </div>
            </div>
          </header>
          <AnimatePresence>
            {showDiagnostics && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                className="mb-16 overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-[2.5rem] bg-secondary/30 border-2 border-border/40 backdrop-blur-xl shadow-inner">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-500" /> Latency
                    </p>
                    <p className="text-2xl font-mono font-bold tracking-tighter">{healthData?.latency.toFixed(0) ?? '--'}ms</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Server className="w-3 h-3 text-amber-500" /> Host
                    </p>
                    <p className="text-2xl font-bold tracking-tight">V2 WORKER</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Globe className="w-3 h-3 text-amber-500" /> Network
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-pretty">HIVE_P2P</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Auth
                    </p>
                    <p className="text-2xl font-bold text-emerald-500 tracking-tight">ACTIVE</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mb-16 space-y-10">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative w-full md:max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                <Input
                  placeholder="Query curated knowledge base..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 bg-secondary/50 border-border/60 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-2xl h-14 text-base shadow-sm"
                />
              </div>
              <Button
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                variant="outline"
                className="w-full md:w-auto h-14 px-8 rounded-2xl border-2 border-amber-500/10 bg-card hover:bg-amber-500/5 hover:border-amber-500/40 hover:text-amber-600 transition-all shadow-sm active:scale-95"
              >
                {isRefetching ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-3" />}
                <span className="font-black uppercase tracking-widest text-[11px]">Sync Protocol</span>
              </Button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 scroll-smooth">
              <div className="flex items-center gap-3 pr-6 border-r border-border/50 shrink-0">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sectors</span>
              </div>
              <Button
                variant={selectedNiche === null ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedNiche(null)}
                className={cn(
                  "rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all", 
                  selectedNiche === null ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "hover:bg-amber-500/10"
                )}
              >
                Discovery
              </Button>
              {niches.map(niche => (
                <Button
                  key={niche}
                  variant={selectedNiche === niche ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedNiche(niche)}
                  className={cn(
                    "rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    selectedNiche === niche ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" : "hover:bg-amber-500/10"
                  )}
                >
                  {niche}
                </Button>
              ))}
            </div>
          </div>
          <main className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-6 p-8 rounded-[2rem] border border-white/10 h-[350px] bg-card/20 backdrop-blur-sm animate-shimmer">
                      <Skeleton className="h-4 w-24 bg-muted/20" />
                      <Skeleton className="h-10 w-full bg-muted/20" />
                      <Skeleton className="h-36 w-full bg-muted/20" />
                      <div className="flex gap-2">
                        <Skeleton className="h-12 flex-grow bg-muted/20" />
                        <Skeleton className="h-12 w-12 bg-muted/20" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 bg-destructive/[0.03] rounded-[3rem] border-2 border-dashed border-destructive/20 max-w-2xl mx-auto"
                >
                  <p className="text-destructive font-black uppercase tracking-widest text-sm mb-6">Transmission Interrupted</p>
                  <p className="text-muted-foreground mb-10 text-sm">Failed to establish secure link with Hive blockchain nodes. Please verify your connection status.</p>
                  <Button variant="outline" onClick={() => refetch()} className="rounded-full px-10 h-12 border-destructive/20 hover:bg-destructive/10">Reconnect Uplink</Button>
                </motion.div>
              ) : (
                <div key="content">
                  <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((record, index) => (
                        <AnnotationCard key={record.id} record={record} index={index} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  {filteredItems.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-40 space-y-8 max-w-lg mx-auto text-center"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                        <div className="text-7xl animate-float relative">🍯</div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-foreground text-2xl font-black tracking-tight">Empty Sector</p>
                        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                          No matching NHC records found in this area of the archive. Current curated database contains {data?.total ?? 0} verified insights.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => { setSearch(''); setSelectedNiche(null); }} 
                        className="rounded-full px-8 h-12 border-amber-500/20 hover:bg-amber-500/5 font-black uppercase tracking-widest text-[10px]"
                      >
                        Reset Filter Parameters
                      </Button>
                    </motion.div>
                  )}
                  {(data?.next || history.length > 0) && filteredItems.length > 0 && (
                    <div className="mt-24 flex items-center justify-center gap-10">
                      <Button
                        onClick={handlePrev}
                        disabled={history.length === 0 || isRefetching}
                        variant="ghost"
                        className="hover:text-amber-600 h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform"
                      >
                        <ChevronLeft className="w-5 h-5 mr-3" /> Previous Segment
                      </Button>
                      <div className="h-12 px-10 rounded-full bg-secondary/40 border border-border/50 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/80 shadow-sm backdrop-blur-md">
                        Phase {history.length + 1}
                      </div>
                      <Button
                        onClick={handleNext}
                        disabled={!data?.next || isRefetching}
                        variant="ghost"
                        className="hover:text-amber-600 h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-transform"
                      >
                        Next Segment <ChevronRight className="w-5 h-5 ml-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      <footer className="py-16 border-t border-border/40 bg-secondary/[0.05]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center items-center gap-4 text-muted-foreground/40">
            <div className="h-px w-8 bg-border/40" />
            <Hexagon className="w-4 h-4" />
            <div className="h-px w-8 bg-border/40" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/60">
            NHC EXPLORER V1.2.4 &bull; DISTRIBUTED REPOSITORY &bull; PERMANENT WEB
          </p>
        </div>
      </footer>
    </div>
  );
}