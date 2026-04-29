import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronLeft, Loader2, Calendar, User, ArrowRight, ExternalLink, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [author, permlink]);
  if (isPostLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing with Hive Node...</p>
      </div>
    );
  }
  if (postError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-6">
        <div className="text-6xl">📡</div>
        <h1 className="text-3xl font-black tracking-tight">Transmission Lost</h1>
        <p className="text-muted-foreground max-w-md">We couldn't locate this niche post on the Hive network. It may have been moved or the permlink is incorrect.</p>
        <Button asChild variant="outline" className="rounded-full px-8">
          <Link to="/"><ChevronLeft className="w-4 h-4 mr-2" /> Back to Index</Link>
        </Button>
      </div>
    );
  }
  const displayTitle = record?.metadata.title || post.title;
  const displayDate = record?.metadata.revision || post.updated || post.created;
  return (
    <div className="min-h-screen bg-background relative selection:bg-amber-500/30">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-50" style={{ scaleX }} />
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-amber-500 transition-colors group">
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-bold uppercase tracking-widest text-xs">Back to Hive Index</span>
            </Link>
          </Button>
        </motion.div>
        <article className="space-y-12">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-md px-3 py-1 font-black text-[10px] uppercase tracking-widest">
                {record?.metadata.niche || 'General'}
              </Badge>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(displayDate), 'MMMM d, yyyy')}</span>
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> @{post.author}</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black leading-tight tracking-tight text-foreground">
              {displayTitle}
            </h1>
            {record?.metadata.description && (
              <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-amber-500/20 pl-6 py-1 italic">
                {record.metadata.description}
              </p>
            )}
          </header>
          <Separator className="bg-border/50" />
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-amber-500 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg">
            {record?.metadata.intro && (
              <div className="not-prose bg-amber-500/5 border-l-4 border-amber-500 p-8 mb-12 rounded-r-2xl">
                <h4 className="text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest text-xs mb-3">Niche Introduction</h4>
                <p className="text-lg leading-relaxed italic text-foreground/90">
                  {record.metadata.intro}
                </p>
              </div>
            )}
            <div 
              className="whitespace-pre-wrap leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: post.body }} 
            />
          </div>
          <footer className="mt-20 pt-12 border-t border-border space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  Actionable Insights <ArrowRight className="w-4 h-4 text-amber-500" />
                </h3>
                <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This content was curated into the Niche Hive because of its evergreen value. Consider how these principles apply to your current workflow or research niche.
                  </p>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  External Nodes
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline" size="sm" className="rounded-full border-amber-500/20 hover:bg-amber-500/10">
                    <a href={`https://peakd.com/@${post.author}/${post.permlink}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" /> View on PeakD
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-full border-amber-500/20 hover:bg-amber-500/10">
                    <a href={`https://hive.blog/@${post.author}/${post.permlink}`} target="_blank" rel="noopener noreferrer">
                      <Share2 className="w-3.5 h-3.5 mr-2" /> Hive.blog
                    </a>
                  </Button>
                </div>
              </section>
            </div>
            <section className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-3xl bg-gradient-to-br from-secondary/50 to-background border border-border">
              <div className="w-20 h-20 rounded-2xl bg-gradient-hive shrink-0 shadow-lg rotate-3" />
              <div className="text-center sm:text-left space-y-2">
                <h4 className="font-black text-xl tracking-tight">Keith Taylor</h4>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                  Curator of the Niche Hive. Digital gardener, researcher, and explorer of decentralised intelligence networks. Identifying high-signal content in a low-signal world.
                </p>
              </div>
            </section>
            <div className="text-center pb-12">
              <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 font-black uppercase tracking-widest text-xs transition-colors group">
                Return to the Hive Index <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}