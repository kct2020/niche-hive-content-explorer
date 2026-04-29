import type { User, NHCRecord } from './types';
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Keith Taylor' },
  { id: 'u2', name: 'Niche Explorer' }
];
export const MOCK_NHC_RECORDS: NHCRecord[] = [
  {
    id: 'mock-uuid-gardening-001',
    uri: 'https://hive.blog/@keithtaylor/digital-gardening-in-the-hive',
    created: '2024-03-01T12:00:00Z',
    updated: '2024-03-01T12:00:00Z',
    tags: ['NHC', 'NHC-Niche:Knowledge', 'NHC-Title:Digital Gardening Systems'],
    metadata: {
      niche: 'Knowledge',
      title: 'Digital Gardening Systems',
      description: 'An exploration of how personal knowledge management systems can be mirrored on decentralized ledgers for permanent availability.',
      intro: 'Digital gardening is a philosophy of growth and connectivity over static file storage.',
      author: 'keithtaylor',
      permlink: 'digital-gardening-in-the-hive'
    },
    original: {
      id: 'h-1',
      uri: 'https://hive.blog/@keithtaylor/digital-gardening-in-the-hive',
      text: 'Cultivating ideas in public.',
      user: 'acct:KeithTaylor@hypothes.is',
      tags: ['NHC'],
      created: '2024-03-01T12:00:00Z',
      updated: '2024-03-01T12:00:00Z',
      target: [{ 
        source: 'https://hive.blog', 
        selector: [{ 
          type: 'TextQuoteSelector', 
          exact: 'Digital gardening is a philosophy of intimacy and gradual development.' 
        }] 
      }]
    }
  },
  {
    id: 'mock-uuid-web3-002',
    uri: 'https://hive.blog/@keithtaylor/web3-social-layers',
    created: '2024-03-05T15:30:00Z',
    updated: '2024-03-05T15:30:00Z',
    tags: ['NHC', 'NHC-Niche:Web3', 'NHC-Title:Decentralized Social Graphs'],
    metadata: {
      niche: 'Web3',
      title: 'Decentralized Social Graphs',
      description: 'Why the protocol layer matters more than the interface for the future of social interaction and data sovereignty.',
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
      created: '2024-03-05T15:30:00Z',
      updated: '2024-03-05T15:30:00Z',
      target: [{ 
        source: 'https://hive.blog', 
        selector: [{ 
          type: 'TextQuoteSelector', 
          exact: 'Social data belongs to the user, not the corporate silo.' 
        }] 
      }]
    }
  },
  {
    id: 'mock-uuid-logic-003',
    uri: 'https://hive.blog/@keithtaylor/zettelkasten-methods',
    created: '2024-03-10T09:45:00Z',
    updated: '2024-03-10T09:45:00Z',
    tags: ['NHC', 'NHC-Niche:Logic', 'NHC-Title:Slip-Box Permanent Connectivity'],
    metadata: {
      niche: 'Logic',
      title: 'Slip-Box Permanent Connectivity',
      description: 'Implementing Niklas Luhmann’s Zettelkasten methods using modern decentralized tools for link integrity.',
      intro: 'A note is only as valuable as the network it participates in.',
      author: 'keithtaylor',
      permlink: 'zettelkasten-methods'
    },
    original: {
      id: 'h-3',
      uri: 'https://hive.blog/@keithtaylor/zettelkasten-methods',
      text: 'Nodes, not files.',
      user: 'acct:KeithTaylor@hypothes.is',
      tags: ['NHC'],
      created: '2024-03-10T09:45:00Z',
      updated: '2024-03-10T09:45:00Z',
      target: [{ 
        source: 'https://hive.blog', 
        selector: [{ 
          type: 'TextQuoteSelector', 
          exact: 'Connectivity between ideas defines artificial and organic intelligence.' 
        }] 
      }]
    }
  },
  {
    id: 'mock-uuid-privacy-004',
    uri: 'https://hive.blog/@keithtaylor/the-privacy-of-public-ledgers',
    created: '2024-03-15T11:20:00Z',
    updated: '2024-03-15T11:20:00Z',
    tags: ['NHC', 'NHC-Niche:Privacy', 'NHC-Title:The Privacy of Public Ledgers'],
    metadata: {
      niche: 'Privacy',
      title: 'The Privacy of Public Ledgers',
      description: 'Navigating the paradox of pseudonymous identities on immutable public record systems.',
      intro: 'Transparency and anonymity are two sides of the same sovereign coin.',
      author: 'keithtaylor',
      permlink: 'the-privacy-of-public-ledgers'
    },
    original: {
      id: 'h-4',
      uri: 'https://hive.blog/@keithtaylor/the-privacy-of-public-ledgers',
      text: 'Hidden in plain sight.',
      user: 'acct:KeithTaylor@hypothes.is',
      tags: ['NHC'],
      created: '2024-03-15T11:20:00Z',
      updated: '2024-03-15T11:20:00Z',
      target: [{ 
        source: 'https://hive.blog', 
        selector: [{ 
          type: 'TextQuoteSelector', 
          exact: 'Immutable records do not require real-world identity to be valid.' 
        }] 
      }]
    }
  }
];