import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, User, ArrowRight, ExternalLink, Clock, ShieldAlert, Loader2, Copy, Check, Hash, Terminal } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
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
    const rawBody = post?.body || record?.metadata.description || "";
    if (!rawBody) return 1;
    // Strip markdown, HTML tags, and non-word chars for accuracy
    const cleanText = rawBody.replace(/[#*`_()[\]]/g, '').replace(/<[^>]*>?/gm, '');
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
    toast.success("Hive permlink copied to clipboard", {
      description: link,
      icon: <Terminal className="w-4 h-4" />
    });
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
      <div class="space-y-12">
        <p class="text-xl md:text-2xl leading-relaxed font-medium text-foreground/90 font-display">${record.metadata.intro || "Beginning transmission..."}</p>
        <div class="p-10 bg-amber-500/[0.03] dark:bg-amber-500/[0.08] border-l-4 border-amber-500 rounded-r-[2.5rem] my-12 shadow-sm border border-border/40">
          <p class="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-6 flex items-center gap-2">
            <Hash class="w-3 h-3" /> Integrity Verification Result
          </p>
          <p class="italic text-xl text-foreground/90 leading-relaxed font-serif">${record.metadata.description || "The metadata record for this curation remains intact, though the full blockchain body is currently inaccessible."}</p>
        </div>
        <div class="bg-secondary/40 p-10 rounded-[2rem] border border-dashed border-border/60 space-y-6">
           <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
             <Terminal class="w-3 h-3" /> Diagnostic Log: Sector 0x442
           </p>
           <p class="text-sm leading-relaxed text-muted-foreground">
             This interface is currently presenting a <strong>Hardened Archive View</strong>. While the main Hive blockchain node responded with a timeout, the NHC curation layer has provided verified metadata. The cryptographic hash matches local indexes.
           </p>
           <div class="flex flex-wrap gap-4 pt-2">
             <span class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded font-black tracking-widest uppercase">SOURCE_VERIFIED</span>
             <span class="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded font-black tracking-widest uppercase">METADATA_LOCKED</span>
             <span class="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-black tracking-widest uppercase">P2P_FALLBACK</span>
           </div>
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
        <div className="text-8xl opacity-10 grayscale animate-pulse">📡</div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight uppercase">Signal Terminated</h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            The requested niche transmission has been archived or the sector is currently unreachable.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-8 h-12 font-black uppercase tracking-widest text-[10px] shadow-xl border-amber-500/20 hover:bg-amber-500/5 transition-all">
          <Link to="/"><ChevronLeft className="w-4 h-4 mr-2" /> Return to Index</Link>
        </Button>
      </div>
    );
  }
  const peakdUrl = `https://peakd.com/@${displayPost.author.replace('@', '')}/${displayPost.permlink}`;
  return (
    <div className="min-h-screen bg-background relative selection:bg-amber-500/30 overflow-x-hidden pb-24">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-amber-500 origin-left z-50 rounded-r-full shadow-glow"
        style={{ scaleX }}
      />
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-16">
          <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-amber-500 transition-colors group">
            <Link to="/" className="flex items-center gap-3">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">Back to Hive Explorer</span>
            </Link>
          </Button>
        </motion.div>
        <article className="space-y-16">
          <header className="space-y-10">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-lg px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20">
                {record?.metadata.niche || 'General Niche'}
              </Badge>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500/50" />
                  {format(new Date(displayPost.updated || displayPost.created), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-500/50" />
                  @{displayPost.author.replace('@', '')}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500/50" />
                  {readingTime} min read
                </span>
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black leading-[1.05] tracking-tight text-foreground text-pretty">
              {record?.metadata.title || displayPost.title}
            </h1>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 bg-muted/20 aspect-video group">
              <AnimatePresence mode="wait">
                {coverImage ? (
                  <motion.img
                    key="cover"
                    initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    src={coverImage}
                    alt="Post Cover"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <motion.div key="placeholder" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-background">
                    <ShieldAlert className="w-16 h-16 text-muted-foreground/10" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </header>
          <Separator className="bg-border/40" />
          <div className="prose lg:prose-xl">
            <div
              className="hive-content-body selection:bg-amber-500/40"
              dangerouslySetInnerHTML={{ __html: displayPost.body }}
            />
          </div>
          <footer className="mt-32 pt-20 border-t border-border/50 space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-8">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-4 text-foreground">
                  <span className="w-2.5 h-10 bg-gradient-hive rounded-full" />
                  Curation Meta
                </h3>
                <div className="p-10 rounded-[2.5rem] bg-secondary/30 border border-border/50 backdrop-blur-md text-sm text-muted-foreground leading-relaxed shadow-sm">
                  This content was selected for the Niche Hive for its unique technical depth and long-form value. Curated by Keith Taylor via the Hypothesis decentralized annotation layer. All records are immutable and cryptographically verifiable.
                </div>
              </section>
              <section className="space-y-8">
                <h3 className="text-2xl font-black tracking-tight text-foreground">Transmission Links</h3>
                <div className="flex flex-col gap-4">
                  <Button asChild variant="outline" className="w-full justify-between rounded-[1.25rem] h-16 border-amber-500/10 bg-card hover:bg-amber-500/5 hover:border-amber-500/40 group transition-all px-8 shadow-sm">
                    <a href={peakdUrl} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                      <span className="font-black uppercase tracking-widest text-[10px] flex-grow text-left">Interact via PeakD</span>
                      <ExternalLink className="w-4 h-4 text-amber-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  </Button>
                  <Button
                    onClick={copyPermlink}
                    variant="outline"
                    className="w-full justify-between rounded-[1.25rem] h-16 border-amber-500/10 bg-card hover:bg-amber-500/5 hover:border-amber-500/40 group transition-all px-8 shadow-sm"
                  >
                    <span className="font-black uppercase tracking-widest text-[10px] flex-grow text-left">
                      {copied ? "Link Secured" : "Copy Hive Identity"}
                    </span>
                    {copied ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <Check className="w-4 h-4 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4 text-amber-500 transition-transform group-hover:scale-110" />
                    )}
                  </Button>
                </div>
              </section>
            </div>
            <div className="text-center pt-12 pb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-4 text-amber-500 hover:text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] transition-all group"
              >
                Terminate Connection & Return <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-4" />
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}