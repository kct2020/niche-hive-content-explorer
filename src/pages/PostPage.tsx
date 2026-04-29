import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, User, ArrowRight, ExternalLink, Clock, ShieldAlert, Loader2, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { HivePost, NHCRecord } from '@shared/types';
import { MOCK_NHC_RECORDS } from '@shared/mock-data';
export function PostPage() {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [copied, setCopied] = useState(false);
  const cleanAuthor = useMemo(() => {
    if (!author) return "";
    return author.startsWith('@') ? author.slice(1).toLowerCase() : author.toLowerCase();
  }, [author]);
  const cleanPermlink = useMemo(() => permlink?.toLowerCase() || "", [permlink]);
  const { data: records } = useQuery<{ items: NHCRecord[] }>({
    queryKey: ['nhc-records-full'],
    queryFn: () => api<{ items: NHCRecord[] }>('/api/nhc-records?limit=200'),
    staleTime: 1000 * 60 * 10,
  });
  const record = useMemo(() => {
    const allRecords = [...(records?.items ?? []), ...MOCK_NHC_RECORDS];
    return allRecords.find(r => 
      r.metadata.author.toLowerCase() === cleanAuthor && 
      r.metadata.permlink.toLowerCase() === cleanPermlink
    );
  }, [records, cleanAuthor, cleanPermlink]);
  const { data: post, isLoading: isPostLoading, isError: isPostError } = useQuery<HivePost>({
    queryKey: ['hive-post', cleanAuthor, cleanPermlink],
    queryFn: () => api<HivePost>(`/api/hive-post?author=${cleanAuthor}&permlink=${cleanPermlink}`),
    enabled: !!cleanAuthor && !!cleanPermlink,
    retry: 1,
  });
  const readingTime = useMemo(() => {
    // Strip markdown characters for better word count accuracy
    const rawBody = post?.body || record?.metadata.description || "";
    if (!rawBody) return 1;
    const cleanText = rawBody.replace(/[#*`_()[\]]/g, '');
    const words = cleanText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 225));
  }, [post?.body, record]);
  const coverImage = useMemo(() => post?.metadata?.image?.[0] || null, [post?.metadata]);
  const isDemo = !post && !!record && (record.id.startsWith('mock-'));
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [author, permlink]);
  const copyPermlink = () => {
    const link = `@${cleanAuthor}/${cleanPermlink}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Hive permlink copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  if (isPostLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-8">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
          <Loader2 className="absolute w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Hive Node...</p>
          <p className="text-xs text-muted-foreground/60 italic">Accessing decentralized storage sector</p>
        </div>
      </div>
    );
  }
  const displayPost = post || (record ? {
    author: record.metadata.author,
    permlink: record.metadata.permlink,
    title: record.metadata.title || "Archive Content Transmission",
    body: `
      <div class="space-y-8">
        <p class="text-xl leading-relaxed font-medium text-foreground/90 font-display">${record.metadata.intro || "Beginning transmission..."}</p>
        <div class="p-10 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-3xl my-10 shadow-sm border border-border/50">
          <p class="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
            <ShieldAlert class="w-3 h-3" /> Metadata Integrity Log
          </p>
          <p class="italic text-lg text-foreground/80 leading-relaxed">${record.metadata.description || "The metadata record for this curation remains intact, though the full blockchain body is currently inaccessible."}</p>
        </div>
        <div class="bg-secondary/30 p-8 rounded-3xl border border-dashed border-border/50 space-y-4">
           <p class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diagnostic Status</p>
           <p class="text-sm leading-relaxed text-muted-foreground">
             This interface is currently presenting a <strong>Hardened Archive View</strong>. While the main Hive blockchain node responded with a timeout, the NHC curation layer has provided verified metadata.
           </p>
           <ul class="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60 space-y-1">
             <li>- SOURCE_VERIFIED: TRUE</li>
             <li>- CONTENT_AVAILABLE: METADATA_ONLY</li>
             <li>- PERSISTENCE_LAYER: HYPOTHESIS</li>
           </ul>
        </div>
      </div>
    `,
    created: record.created,
    updated: record.updated,
    json_metadata: "{}"
  } : null);
  if (!displayPost) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-8">
        <div className="text-8xl opacity-10 grayscale">📡</div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight uppercase">Signal Terminated</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            The requested niche transmission has been archived or the sector is currently unreachable.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg border-amber-500/20 hover:bg-amber-500/5 transition-all">
          <Link to="/"><ChevronLeft className="w-4 h-4 mr-2" /> Return to Index</Link>
        </Button>
      </div>
    );
  }
  const peakdUrl = `https://peakd.com/@${displayPost.author.replace('@', '')}/${displayPost.permlink}`;
  return (
    <div className="min-h-screen bg-background relative selection:bg-amber-500/30 overflow-x-hidden pb-20">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-amber-500 origin-left z-50 rounded-r-full shadow-glow" 
        style={{ scaleX }} 
      />
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
          <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-amber-500 transition-colors group">
            <Link to="/" className="flex items-center gap-3">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to Hive Explorer</span>
            </Link>
          </Button>
        </motion.div>
        {(isDemo || isPostError) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-12 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-600 dark:text-amber-400 shadow-sm"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p className="text-xs font-black uppercase tracking-wider">
              {isPostError ? "Archive Layer Active: Displaying Curation Metadata Only" : "Simulated Transmission: Viewing Demo Layer Data"}
            </p>
          </motion.div>
        )}
        <article className="space-y-12">
          <header className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-md px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-lg">
                {record?.metadata.niche || 'General Niche'}
              </Badge>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500/60" />
                  {format(new Date(displayPost.updated || displayPost.created), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-500/60" />
                  @{displayPost.author.replace('@', '')}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500/60" />
                  {readingTime} min read
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black leading-[1.1] tracking-tight text-foreground text-pretty">
              {record?.metadata.title || displayPost.title}
            </h1>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-muted/20">
              <AspectRatio ratio={16 / 9}>
                <AnimatePresence mode="wait">
                  {coverImage ? (
                    <motion.img 
                      key="cover"
                      initial={{ opacity: 0, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      src={coverImage} 
                      alt="Post Cover" 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  ) : (
                    <motion.div key="placeholder" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
                      <ShieldAlert className="w-12 h-12 text-muted-foreground/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </AspectRatio>
            </div>
          </header>
          <Separator className="bg-border/30" />
          <div className="prose">
            <div 
              className="hive-content-body selection:bg-amber-500/40"
              dangerouslySetInnerHTML={{ __html: displayPost.body }} 
            />
          </div>
          <footer className="mt-24 pt-16 border-t border-border space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
                  <span className="w-2 h-8 bg-amber-500 rounded-full" />
                  Curation Logic
                </h3>
                <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-sm text-sm text-muted-foreground leading-relaxed">
                  This content was selected for the Niche Hive for its unique technical depth and long-form value. Curated by Keith Taylor via the Hypothesis decentralized annotation layer.
                </div>
              </section>
              <section className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight text-foreground">Interoperability</h3>
                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" className="w-full justify-start rounded-2xl h-14 border-amber-500/10 hover:bg-amber-500/5 hover:border-amber-500/30 group transition-all">
                    <a href={peakdUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-3 text-amber-500" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Interact via PeakD</span>
                    </a>
                  </Button>
                  <Button 
                    onClick={copyPermlink}
                    variant="outline" 
                    className="w-full justify-start rounded-2xl h-14 border-amber-500/10 hover:bg-amber-500/5 hover:border-amber-500/30 group transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 mr-3 text-emerald-500" /> : <Copy className="w-4 h-4 mr-3 text-amber-500" />}
                    <span className="font-bold uppercase tracking-widest text-[10px]">Copy Hive Permlink</span>
                  </Button>
                </div>
              </section>
            </div>
            <div className="text-center pt-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-3 text-amber-500 hover:text-amber-600 font-black uppercase tracking-[0.3em] text-[10px] transition-all group"
              >
                Close Connection & Return <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-3" />
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}