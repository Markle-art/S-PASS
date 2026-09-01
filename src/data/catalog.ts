export interface CatalogEvent {
  id: number;
  title: string;
  description: string;
  organizer: string;
  organizerInitials: string;
  date: string;
  location: string;
  price: string;
  capacity: number;
  sold: number;
  category: string;
  gradient: string;
}

const base = (partial: Partial<CatalogEvent> & Pick<CatalogEvent, 'id' | 'title' | 'date' | 'location'>): CatalogEvent => ({
  description:
    'Join an immersive, on-chain powered event where your refundable deposit guarantees your spot. Check in, complete sponsor tasks, and earn rewards.',
  organizer: 'StakePass',
  organizerInitials: 'SP',
  price: '0.1 AVAX',
  capacity: 100,
  sold: 45,
  category: 'Featured',
  gradient: 'from-red-900 via-red-700 to-black',
  ...partial,
});

export const catalog: CatalogEvent[] = [
  // Featured / top picks
  base({
    id: 1,
    title: 'AVALANCHE SUMMIT 2025',
    description:
      'The biggest Web3 gathering on Fuji. Three days of keynotes, hackathons, and on-chain demos that will reshape how you think about decentralized events.',
    organizer: 'AvaLabs',
    organizerInitials: 'AL',
    date: 'Jul 18 - 20',
    location: 'Miami, FL',
    price: '0.1 AVAX',
    gradient: 'from-red-900 via-red-700 to-black',
    category: 'Tech',
    capacity: 300,
    sold: 210,
  }),
  base({
    id: 2,
    title: 'NEON UNDERGROUND RAVE',
    description:
      'An immersive audio-visual experience in a converted warehouse. Stake your spot, check in, and earn micro-bounties from sponsors throughout the night.',
    organizer: 'BassDAO',
    organizerInitials: 'BD',
    date: 'Aug 02',
    location: 'Brooklyn, NY',
    price: '0.2 AVAX',
    gradient: 'from-purple-900 via-red-800 to-black',
    category: 'Concerts',
    capacity: 250,
    sold: 180,
  }),
  base({
    id: 3,
    title: 'DEGEN DERBY - KART RACING',
    description:
      'High-speed electric kart racing with on-chain leaderboards. Top finishers split the no-show pool. Losers get bragging rights and nothing else.',
    organizer: 'SpeedFi',
    organizerInitials: 'SF',
    date: 'Aug 15',
    location: 'Austin, TX',
    price: '1.0 AVAX',
    gradient: 'from-orange-900 via-red-700 to-black',
    category: 'Sports',
    capacity: 120,
    sold: 76,
  }),
  base({
    id: 4,
    title: 'SUPREME CODE HACKATHON',
    description:
      '48 hours. Zero sleep. Build the future of event ticketing on Avalanche. $50K in prizes, all distributed on-chain via smart contracts.',
    organizer: 'StakePass',
    organizerInitials: 'SP',
    date: 'Sep 05 - 07',
    location: 'San Francisco, CA',
    price: 'Free',
    gradient: 'from-red-800 via-black to-gray-900',
    category: 'Tech',
    capacity: 200,
    sold: 140,
  }),

  // Concerts
  base({ id: 101, title: 'Midnight Bass Drop', date: 'Jul 22', location: 'LA', organizer: 'BassDAO', organizerInitials: 'BD', price: '0.5 AVAX', gradient: 'from-red-800 to-black', category: 'Concerts' }),
  base({ id: 102, title: 'Lo-Fi Rooftop Session', date: 'Jul 25', location: 'Chicago', organizer: 'ChillWave', organizerInitials: 'CW', price: '0.2 AVAX', gradient: 'from-rose-900 to-black', category: 'Concerts' }),
  base({ id: 103, title: 'Synthwave Nights', date: 'Jul 28', location: 'Portland', organizer: 'RetroFi', organizerInitials: 'RF', price: '0.3 AVAX', gradient: 'from-pink-900 to-black', category: 'Concerts' }),
  base({ id: 104, title: 'Acoustic & AVAX', date: 'Aug 01', location: 'Nashville', organizer: 'SoundDAO', organizerInitials: 'SD', price: '0.1 AVAX', gradient: 'from-red-700 to-gray-900', category: 'Concerts' }),

  // Tech
  base({ id: 201, title: 'Smart Contract Workshop', date: 'Aug 05', location: 'SF', organizer: 'AvaLabs', organizerInitials: 'AL', price: 'Free', gradient: 'from-red-900 to-gray-950', category: 'Tech' }),
  base({ id: 202, title: 'DeFi Builders Meetup', date: 'Aug 08', location: 'NYC', organizer: 'StakePass', organizerInitials: 'SP', price: '0.1 AVAX', gradient: 'from-red-800 to-black', category: 'Tech' }),
  base({ id: 203, title: 'ZK Proofs Deep Dive', date: 'Aug 12', location: 'Denver', organizer: 'CryptoEd', organizerInitials: 'CE', price: '0.4 AVAX', gradient: 'from-orange-900 to-black', category: 'Tech' }),
  base({ id: 204, title: 'AI × Web3 Panel', date: 'Aug 15', location: 'Seattle', organizer: 'NexusDAO', organizerInitials: 'ND', price: '0.2 AVAX', gradient: 'from-rose-800 to-black', category: 'Tech' }),

  // Sports
  base({ id: 301, title: 'Degen Derby Racing', date: 'Aug 15', location: 'Austin', organizer: 'SpeedFi', organizerInitials: 'SF', price: '1.0 AVAX', gradient: 'from-red-700 to-black', category: 'Sports' }),
  base({ id: 302, title: '3v3 Basketball Stake', date: 'Aug 18', location: 'LA', organizer: 'CourtDAO', organizerInitials: 'CD', price: '0.3 AVAX', gradient: 'from-red-900 to-gray-900', category: 'Sports' }),
  base({ id: 303, title: 'Surf & Stake Open', date: 'Aug 22', location: 'San Diego', organizer: 'WaveFi', organizerInitials: 'WF', price: '0.5 AVAX', gradient: 'from-rose-800 to-black', category: 'Sports' }),
  base({ id: 304, title: 'E-Sports LAN Party', date: 'Aug 25', location: 'Dallas', organizer: 'FragDAO', organizerInitials: 'FD', price: '0.2 AVAX', gradient: 'from-red-800 to-gray-950', category: 'Sports' }),

  // Art
  base({ id: 401, title: 'NFT Gallery Opening', date: 'Sep 01', location: 'Miami', organizer: 'ArtBlock', organizerInitials: 'AB', price: 'Free', gradient: 'from-purple-900 to-black', category: 'Art' }),
  base({ id: 402, title: 'Generative Art Live', date: 'Sep 04', location: 'Berlin', organizer: 'GenDAO', organizerInitials: 'GD', price: '0.2 AVAX', gradient: 'from-red-900 to-black', category: 'Art' }),
  base({ id: 403, title: 'Street Art × Crypto', date: 'Sep 08', location: 'London', organizer: 'WallFi', organizerInitials: 'WF', price: '0.1 AVAX', gradient: 'from-rose-900 to-gray-950', category: 'Art' }),
  base({ id: 404, title: 'Digital Sculpture Show', date: 'Sep 12', location: 'Tokyo', organizer: 'MeshDAO', organizerInitials: 'MD', price: '0.3 AVAX', gradient: 'from-red-800 to-black', category: 'Art' }),

  // Food
  base({ id: 501, title: 'Crypto Taco Fest', date: 'Sep 15', location: 'Austin', organizer: 'FoodDAO', organizerInitials: 'FD', price: '0.1 AVAX', gradient: 'from-orange-900 to-black', category: 'Food' }),
  base({ id: 502, title: 'Ramen & Rollup Night', date: 'Sep 18', location: 'NYC', organizer: 'NoodlFi', organizerInitials: 'NF', price: '0.2 AVAX', gradient: 'from-red-800 to-gray-900', category: 'Food' }),
  base({ id: 503, title: 'Wine Tasting on Chain', date: 'Sep 22', location: 'Napa', organizer: 'VinoDAO', organizerInitials: 'VD', price: '0.5 AVAX', gradient: 'from-rose-900 to-black', category: 'Food' }),
  base({ id: 504, title: 'BBQ Stake-Off', date: 'Sep 25', location: 'Kansas City', organizer: 'GrillFi', organizerInitials: 'GF', price: '0.3 AVAX', gradient: 'from-red-700 to-black', category: 'Food' }),
];

export function getEventById(id: number | string): CatalogEvent | undefined {
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  return catalog.find((e) => e.id === num);
}
