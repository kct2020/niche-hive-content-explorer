import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Quote, Calendar, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HypothesisAnnotation } from '@shared/types';
import { cn } from '@/lib/utils';
interface AnnotationCardProps {
  annotation: HypothesisAnnotation;
  index: number;
}
export function AnnotationCard({ annotation, index }: AnnotationCardProps) {
  const date = new Date(annotation.created);
  const domain = new URL(annotation.uri).hostname.replace('www.', '');
  // Find the exact highlighted text if it exists
  const highlight = annotation.target[0]?.selector?.find(s => s.type === 'TextQuoteSelector')?.exact;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden border-white/10 dark:border-white/5 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(date, 'MMM d, yyyy')}
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none">
              {domain}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
            {annotation.document?.title?.[0] || annotation.title || 'Untitled Source'}
          </h3>
        </CardHeader>
        <CardContent className="p-5 pt-2 flex-grow space-y-4">
          {highlight && (
            <div className="relative pl-4 border-l-2 border-amber-500/50 italic text-muted-foreground text-sm leading-relaxed">
              <Quote className="absolute -left-1 -top-2 w-3 h-3 text-amber-500/30 rotate-180" />
              <p className="line-clamp-4">{highlight}</p>
            </div>
          )}
          {annotation.text && (
            <div className="text-sm text-foreground/90 font-medium leading-relaxed bg-accent/30 p-3 rounded-md border border-accent">
              <p className={cn(!highlight && "line-clamp-6")}>{annotation.text}</p>
            </div>
          )}
          {!highlight && !annotation.text && (
            <div className="text-xs italic text-muted-foreground">
              Annotation content unavailable.
            </div>
          )}
        </CardContent>
        <CardFooter className="p-5 pt-0 mt-auto">
          <Button 
            asChild 
            variant="outline" 
            size="sm" 
            className="w-full group border-amber-500/20 hover:bg-amber-500 hover:text-white transition-colors"
          >
            <a href={annotation.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <Bookmark className="w-3.5 h-3.5 group-hover:fill-current" />
              Read Source
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}