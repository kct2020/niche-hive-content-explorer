import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import type { HypothesisSearchResponse, NHCRecord, NHCMetadata, HypothesisAnnotation, HivePostRpc } from "@shared/types";
let globalLastHiveFetch = 0;
const HIVE_THROTTLE_MS = 800; // Slightly optimized throttle
function parseNHCTags(annotation: HypothesisAnnotation): NHCMetadata | null {
  const tags = annotation.tags || [];
  const meta: Partial<NHCMetadata> = {};
  const nicheTag = tags.find(t => t.startsWith('NHC-Niche:'));
  if (!nicheTag) return null;
  meta.niche = nicheTag.replace('NHC-Niche:', '').trim();
  meta.title = tags.find(t => t.startsWith('NHC-Title:'))?.replace('NHC-Title:', '').trim() || annotation.document?.title?.[0];
  meta.description = tags.find(t => t.startsWith('NHC-Description:'))?.replace('NHC-Description:', '').trim();
  meta.intro = tags.find(t => t.startsWith('NHC-Intro:'))?.replace('NHC-Intro:', '').trim();
  meta.revision = tags.find(t => t.startsWith('NHC-Revision:'))?.replace('NHC-Revision:', '').trim();
  try {
    const url = new URL(annotation.uri);
    // Flexible path segment matcher for Hive-based URLs (@author/permlink)
    const segments = url.pathname.split('/').filter(Boolean);
    const authorSegment = segments.find(s => s.startsWith('@'));
    if (authorSegment) {
      meta.author = authorSegment.replace('@', '').toLowerCase();
      const authorIndex = segments.indexOf(authorSegment);
      meta.permlink = segments[authorIndex + 1]?.toLowerCase();
    }
  } catch (e) {
    console.error(`Failed to parse NHC URL segments: ${annotation.uri}`);
    return null;
  }
  if (!meta.author || !meta.permlink) return null;
  return meta as NHCMetadata;
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/nhc-records', async (c) => {
    try {
      const cursor = c.req.query('cursor');
      const limit = c.req.query('limit') || '200';
      const filterNiche = c.req.query('niche');
      let url = `https://hypothes.is/api/search?limit=${limit}&tag=NHC&user=acct:KeithTaylor@hypothes.is`;
      if (cursor) url += `&search_after=${encodeURIComponent(cursor)}`;
      const response = await fetch(url, {
        headers: { 
          'Accept': 'application/json', 
          'User-Agent': 'NHC-Explorer-Proxy/1.1' 
        }
      });
      if (!response.ok) return bad(c, `Hypothesis Node Error: ${response.statusText}`);
      const data = await response.json() as HypothesisSearchResponse;
      const records: NHCRecord[] = (data.rows || [])
        .map(row => {
          const metadata = parseNHCTags(row);
          if (!metadata) return null;
          if (filterNiche && metadata.niche.toLowerCase() !== filterNiche.toLowerCase()) return null;
          return {
            id: row.id,
            uri: row.uri,
            created: row.created,
            updated: row.updated,
            tags: row.tags,
            metadata,
            original: row
          };
        })
        .filter((r): r is NHCRecord => r !== null);
      return ok(c, {
        items: records,
        next: data.rows.length > 0 ? data.rows[data.rows.length - 1].updated : null,
        total: data.total
      });
    } catch (error) {
      console.error('NHC Records Fetch Error:', error);
      return bad(c, 'Failed to establish connection to annotation layer');
    }
  });
  app.get('/api/hive-post', async (c) => {
    const author = c.req.query('author')?.toLowerCase().replace('@', '');
    const permlink = c.req.query('permlink')?.toLowerCase();
    if (!author || !permlink) return bad(c, 'author and permlink required');
    const now = Date.now();
    const wait = Math.max(0, (globalLastHiveFetch + HIVE_THROTTLE_MS) - now);
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    globalLastHiveFetch = Date.now();
    try {
      const response = await fetch('https://api.hive.blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "condenser_api.get_content",
          params: [author, permlink],
          id: 1
        })
      });
      const result = await response.json() as HivePostRpc;
      // Basic Hive RPC response validation
      if (result.result && result.result.author !== "") {
        const post = result.result;
        try {
          if (post.json_metadata) {
            post.metadata = JSON.parse(post.json_metadata);
          }
        } catch (e) {
          console.warn(`Malformed metadata in post @${author}/${permlink}`);
        }
        return ok(c, post);
      }
      return notFound(c, 'Niche source content not found on-chain');
    } catch (error) {
      console.error('Hive API Proxy Failure:', error);
      return bad(c, 'Failed to synchronize with Hive blockchain node');
    }
  });
}