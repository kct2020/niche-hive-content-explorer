import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import type { HypothesisSearchResponse, NHCRecord, NHCMetadata, HypothesisAnnotation } from "@shared/types";
let globalLastHiveFetch = 0;
const HIVE_THROTTLE_MS = 2000;
function parseNHCTags(annotation: HypothesisAnnotation): NHCMetadata | null {
  const tags = annotation.tags || [];
  const meta: Partial<NHCMetadata> = {};
  const nicheTag = tags.find(t => t.startsWith('NHC-Niche:'));
  if (!nicheTag) return null;
  meta.niche = nicheTag.replace('NHC-Niche:', '').trim();
  meta.title = tags.find(t => t.startsWith('NHC-Title:'))?.replace('NHC-Title:', '').trim();
  meta.description = tags.find(t => t.startsWith('NHC-Description:'))?.replace('NHC-Description:', '').trim();
  meta.intro = tags.find(t => t.startsWith('NHC-Intro:'))?.replace('NHC-Intro:', '').trim();
  meta.revision = tags.find(t => t.startsWith('NHC-Revision:'))?.replace('NHC-Revision:', '').trim();
  try {
    const url = new URL(annotation.uri);
    const parts = url.pathname.split('/').filter(Boolean);
    const authorPart = parts.find(p => p.startsWith('@'));
    if (authorPart) {
      meta.author = authorPart.replace('@', '');
      meta.permlink = parts[parts.indexOf(authorPart) + 1];
    }
  } catch (e) {
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
        headers: { 'Accept': 'application/json', 'User-Agent': 'NHC-Explorer/1.0' }
      });
      if (!response.ok) return bad(c, `Hypothesis API error: ${response.statusText}`);
      const data = await response.json() as HypothesisSearchResponse;
      const records: NHCRecord[] = data.rows
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
      return bad(c, 'Failed to fetch NHC records');
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
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "condenser_api.get_content",
          params: [author, permlink],
          id: 1
        })
      });
      const result = await response.json() as any;
      if (result.error || !result.result || result.result.author === "") {
        return notFound(c, 'Hive post not found');
      }
      return ok(c, result.result);
    } catch (error) {
      return bad(c, 'Failed to fetch Hive post');
    }
  });
}