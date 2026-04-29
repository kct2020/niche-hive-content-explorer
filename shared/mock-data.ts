import type { User, NHCRecord } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Keith Taylor' },
  { id: 'u2', name: 'Niche Explorer' }
];
export const MOCK_NHC_RECORDS: NHCRecord[] = [
  {
    id: 'mock-1',
    uri: 'https://hive.blog/@keithtaylor/digital-gardening-in-the-hive',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['NHC', 'NHC-Niche:Gardening', 'NHC-Title:The Art of Digital Gardening'],
    metadata: {
      niche: 'Gardening',
      title: 'The Art of Digital Gardening',
      description: 'An exploration of how personal knowledge management systems can be mirrored on decentralized ledgers.',
      intro: 'Digital gardening is not just about notes; it is about growth.',
      author: 'keithtaylor',
      permlink: 'digital-gardening-in-the-hive'
    },
    original: {
      id: 'h-1',
      uri: 'https://hive.blog/@keithtaylor/digital-gardening-in-the-hive',
      text: 'Cultivating ideas in public.',
      user: 'acct:KeithTaylor@hypothes.is',
      tags: ['NHC'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      target: [{ source: 'https://hive.blog', selector: [{ type: 'TextQuoteSelector', exact: 'Digital gardening is a philosophy of intimacy.' }] }]
    }
  },
  {
    id: 'mock-2',
    uri: 'https://hive.blog/@keithtaylor/web3-social-layers',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['NHC', 'NHC-Niche:Web3', 'NHC-Title:Decentralized Social Graphs'],
    metadata: {
      niche: 'Web3',
      title: 'Decentralized Social Graphs',
      description: 'Why the protocol layer matters more than the interface for the future of social interaction.',
      intro: 'Interoperability is the ultimate feature of the next web.',
      author: 'keithtaylor',
      permlink: 'web3-social-layers'
    },
    original: {
      id: 'h-2',
      uri: 'https://hive.blog/@keithtaylor/web3-social-layers',
      text: 'The graph is the message.',
      user: 'acct:KeithTaylor@hypothes.is',
      tags: ['NHC'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      target: [{ source: 'https://hive.blog', selector: [{ type: 'TextQuoteSelector', exact: 'Social data belongs to the user, not the silo.' }] }]
    }
  },
  {
    id: 'mock-3',
    uri: 'https://hive.blog/@keithtaylor/zettelkasten-methods',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: ['NHC', 'NHC-Niche:Zettelkasten', 'NHC-Title:The Slip-Box in the Cloud'],
    metadata: {
      niche: 'Zettelkasten',
      title: 'The Slip-Box in the Cloud',
      description: 'Implementing Luhmanns methods using modern decentralized tools for permanent link integrity.',
      intro: 'A note is only as valuable as its connections.',
      author: 'keithtaylor',
      permlink: 'zettelkasten-methods'
    },
    original: {
      id: 'h-3',
      uri: 'https://hive.blog/@keithtaylor/zettelkasten-methods',
      text: 'Nodes, not files.',
      user: 'acct:KeithTaylor@hypothes.is',
      tags: ['NHC'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      target: [{ source: 'https://hive.blog', selector: [{ type: 'TextQuoteSelector', exact: 'Connectivity defines intelligence.' }] }]
    }
  }
];