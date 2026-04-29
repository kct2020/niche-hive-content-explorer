import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, Quote, Calendar, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NHCRecord } from '@shared/types';
interface AnnotationCardProps {
  record: NHCRecord;
  index: number;
}
export const AnnotationCard = forwardRef<HTMLDivElement, AnnotationCardProps>(
  ({ record, index }, ref) => {
    const { metadata, updated, original } = record;
    const date = new Date(metadata.revision || updated);
    // Safe highlight extraction with fallback for page notes
    const highlight = original.target?.[0]?.selector?.find(
      (s) => s.type === 'TextQuoteSelector'
    )?.exact;
    const description = metadata.description || highlight || original.text || "Insight metadata available. Full body accessible via transmission link.";
    const postUrl = `/@${metadata.author.toLowerCase()}/${metadata.permlink.toLowerCase()}`;
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
        whileHover={{ y: -6 }}
        className="h-full"
      >
        <Card className="h-full flex flex-col overflow-hidden border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-md hover:border-amber-500/40 hover:shadow-2xl transition-all duration-500 group/card">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between gap-2 mb-3">
              <Badge 
                variant="secondary" 
                className="bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-400 border-none px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest max-w-[120px] truncate"
                title={metadata.niche}
              >
                {metadata.niche}
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-muted-foreground/60">
                <Calendar className="w-3 h-3" />
                {format(date, 'MMM d, yyyy')}
              </div>
            </div>
            <Link to={postUrl} className="group/title">
              <h3 className="text-lg font-bold text-foreground leading-tight group-hover/title:text-amber-500 transition-colors line-clamp-2 text-pretty">
                {metadata.title || original.document?.title?.[0] || 'Untitled Hive Post'}
              </h3>
            </Link>
          </CardHeader>
          <CardContent className="p-6 pt-2 flex-grow">
            <div className="relative pl-4 border-l-2 border-amber-500/30">
              <Quote className="absolute -left-1 -top-2 w-3 h-3 text-amber-500/20 rotate-180" />
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap">
                {description}
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0 mt-auto flex gap-2">
            <Button
              asChild
              className="flex-grow bg-gradient-hive hover:opacity-95 text-white font-bold border-none transition-all duration-300 shadow-sm active:scale-[0.98]"
            >
              <Link to={postUrl}>
                Dive Into Niche 
                <ArrowUpRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/card:translate-x-1 group-hover/card:-translate-y-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl"
              title="Read Original Source"
            >
              <a href={record.uri} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
);
AnnotationCard.displayName = 'AnnotationCard';