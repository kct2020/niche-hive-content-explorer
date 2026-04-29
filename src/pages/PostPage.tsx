import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { HivePost, NHCRecord, ApiResponse } from '@shared/types';
export function PostPage() {
  const { author, permlink } = useParams<{ author: string; permlink: string }>();
  const { data: records } = useQuery<{ items: NHCRecord[] }>({
    queryKey: ['nhc-records'],
    queryFn: () => api<{ items: NHCRecord[] }>('/api/nhc-records'),
    staleTime: 1000 * 60 * 10,
  });
  const record = records?.items.find(r => r.metadata.author === author && r.metadata.permlink === permlink);
  const { data: post, isLoading: isPostLoading, error: postError } = useQuery<HivePost>({
    queryKey: ['hive-post', author, permlink],
    queryFn: () => api<HivePost>(`/api/hive-post?author=${author}&permlink=${permlink}`),
    enabled: !!author && !!permlink,
    retry: 1,
  });
  if (isPostLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }
  if (postError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button asChild variant="outline"><Link to="/">Return to Index</Link></Button>
      </div>
    );
  }
  const displayTitle = record?.metadata.title || post.title;
  const displayDate = record?.metadata.revision || post.updated || post.created;
  return (
    <div className="min-h-screen bg-background relative">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button asChild variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-amber-500">
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to Hive Index
            </Link>
          </Button>
        </motion.div>
        <article className="glass-dark border-white/5 rounded-3xl overflow-hidden p-6 md:p-10 shadow-2xl">
          <header className="mb-10 space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-bold uppercase tracking-tighter">
                {record?.metadata.niche || 'General'}
              </span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(displayDate), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                @{post.author}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black leading-tight text-foreground">
              {displayTitle}
            </h1>
          </header>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {record?.metadata.intro && (
              <div className="bg-amber-500/5 border-l-4 border-amber-500 p-6 mb-10 rounded-r-xl italic text-lg leading-relaxed">
                {record.metadata.intro}
              </div>
            )}
            <div 
              className="whitespace-pre-wrap leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: post.body }} 
            />
          </div>
          <footer className="mt-16 pt-10 border-t border-white/10 space-y-12">
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Next Steps <ArrowRight className="w-4 h-4 text-amber-500" />
              </h3>
              <div className="p-6 rounded-2xl bg-accent/30 border border-accent">
                <p className="text-muted-foreground italic">
                  Apply these insights to your current projects. Look for overlaps in your existing knowledge base and iterate on these concepts.
                </p>
              </div>
            </section>
            <div className="text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-amber-500 hover:underline font-medium">
                Leave {record?.metadata.niche || 'this niche'} to browse the Index
              </Link>
            </div>
            <Separator className="bg-white/5" />
            <section className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-hive shrink-0" />
              <div>
                <h4 className="font-bold text-lg">Author Bio</h4>
                <p className="text-muted-foreground">
                  Keith Taylor is a digital gardener and niche content curator exploring the intersections of technology, business, and hive-mind intelligence.
                </p>
              </div>
            </section>
          </footer>
        </article>
      </div>
    </div>
  );
}