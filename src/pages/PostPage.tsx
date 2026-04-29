import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronLeft, Loader2, Calendar, User, ArrowRight, ExternalLink, Share2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import type { HivePost, NHCRecord } from '@shared/types';
export function PostPage() {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const { data: records } = useQuery<{ items: NHCRecord[] }>({
    queryKey: ['nhc-records-full'],
    queryFn: () => api<{ items: NHCRecord[] }>('/api/nhc-records?limit=200'),
    staleTime: 1000 * 60 * 10,
  });
  const record = records?.items.find(r =>
    r.metadata.author.toLowerCase() === author?.toLowerCase() &&
    r.metadata.permlink.toLowerCase() === permlink?.toLowerCase()
  );
  const { data: post, isLoading: isPostLoading, error: postError } = useQuery<HivePost>({
    queryKey: ['hive-post', author, permlink],
    queryFn: () => api<HivePost>(`/api/hive-post?author=${author}&permlink=${permlink}`),
    enabled: !!author && !!permlink,
    retry: 1,
  });
  const readingTime = useMemo(() => {
    if (!post?.body) return 0;
    const words = post.body.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 225));
  }, [post?.body]);
  const coverImage = useMemo(() => {
    return post?.metadata?.image?.[0] || null;
  }, [post?.metadata]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [author, permlink]);
  if (isPostLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-amber-500/10 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Establishing Node Connection...</p>
      </div>
    );
  }
  if (postError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-8">
        <div className="relative">
          <div className="text-8xl opacity-20">📡</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-1 bg-destructive/50 -rotate-45" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Signal Interrupted</h1>
          <p className="text-muted-foreground max-w-md mx-auto">This niche broadcast is no longer available on the Hive network. It may have been archived or moved to a new permlink.</p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-8 h-12 font-bold shadow-lg hover:shadow-amber-500/10 transition-all">
          <Link to="/"><ChevronLeft className="w-4 h-4 mr-2" /> Return to Index</Link>
        </Button>
      </div>
    );
  }
  const displayTitle = record?.metadata.title || post.title;
  const displayDate = record?.metadata.revision || post.updated || post.created;
  return (
    <div className="min-h-screen bg-background relative selection:bg-amber-500/30 overflow-x-hidden">
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-amber-500 origin-left z-50 rounded-r-full" style={{ scaleX }} />
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-amber-500 transition-colors group">
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase tracking-[0.15em] text-[10px]">Back to Hive Index</span>
            </Link>
          </Button>
        </motion.div>
        <article className="space-y-10">
          <header className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-md px-3 py-1 font-black text-[10px] uppercase tracking-widest shadow-md">
                {record?.metadata.niche || 'General Niche'}
              </Badge>
              <div className="flex items-center gap-5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-amber-500/60" /> {format(new Date(displayDate), 'MMMM d, yyyy')}</span>
                <span className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-amber-500/60" /> @{post.author}</span>
                <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-amber-500/60" /> {readingTime} min read</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black leading-[1.1] tracking-tight text-foreground text-pretty">
              {displayTitle}
            </h1>
            {coverImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-3xl shadow-2xl border border-white/10"
              >
                <AspectRatio ratio={16 / 9}>
                  <img src={coverImage} alt="Post Cover" className="w-full h-full object-cover" />
                </AspectRatio>
              </motion.div>
            )}
            {record?.metadata.description && (
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed border-l-4 border-amber-500/30 pl-8 py-2 italic font-medium">
                {record.metadata.description}
              </p>
            )}
          </header>
          <Separator className="bg-border/30" />
          <div className="prose">
            {record?.metadata.intro && (
              <div className="not-prose bg-amber-500/5 border-l-4 border-amber-500 p-8 mb-12 rounded-r-3xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <ArrowRight className="w-32 h-32 rotate-12" />
                </div>
                <h4 className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-amber-500/30" /> Niche Context
                </h4>
                <p className="text-xl leading-relaxed italic text-foreground/90 font-serif">
                  {record.metadata.intro}
                </p>
              </div>
            )}
            <div
              className="hive-content-body"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </div>
          <footer className="mt-20 pt-16 border-t border-border space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <span className="w-2 h-8 bg-amber-500 rounded-full" />
                  Niche Value
                </h3>
                <div className="p-8 rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-sm">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    This post has been curated into the Niche Hive Explorer for its specific insights into decentralized systems and digital knowledge management. Use these insights to expand your own digital garden.
                  </p>
                </div>
              </section>
              <section className="space-y-6">
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  Nodes & Mirrors
                </h3>
                <div className="flex flex-col gap-3">
                  <Button asChild variant="outline" className="w-full justify-start rounded-2xl h-14 border-amber-500/10 hover:bg-amber-500/5 group">
                    <a href={`https://peakd.com/@${post.author}/${post.permlink}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-3 text-amber-500" /> 
                      <span className="font-bold">Interact via PeakD</span>
                      <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start rounded-2xl h-14 border-amber-500/10 hover:bg-amber-500/5 group">
                    <a href={`https://hive.blog/@${post.author}/${post.permlink}`} target="_blank" rel="noopener noreferrer">
                      <Share2 className="w-4 h-4 mr-3 text-amber-500" /> 
                      <span className="font-bold">View on Hive.blog</span>
                      <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </a>
                  </Button>
                </div>
              </section>
            </div>
            <section className="flex flex-col sm:flex-row items-center gap-8 p-10 rounded-[2.5rem] bg-gradient-to-br from-secondary/50 via-background to-secondary/30 border border-border/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
              <div className="w-24 h-24 rounded-3xl bg-gradient-hive shrink-0 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="text-center sm:text-left space-y-3">
                <h4 className="font-black text-2xl tracking-tight">Keith Taylor</h4>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                  Curator of the Niche Hive. Identifying high-signal content in a low-signal world. Building a bridge between digital gardens and the decentralized hive mind.
                </p>
              </div>
            </section>
            <div className="text-center pb-20">
              <Link to="/" className="inline-flex items-center gap-3 text-amber-500 hover:text-amber-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all group">
                Close Transmission & Return <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}