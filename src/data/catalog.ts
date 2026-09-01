export interface CatalogEvent {
  id: number;
  title: string;
  description: string;
  organizer: string;
  organizerInitials: string;
  organizerColor?: string;
  date: string;
  location: string;
  price: string;
  capacity: number;
  sold: number;
  category: string;
  gradient: string;
  image: string;
  featured?: boolean;
}

const img = (id: string, w = 1200, h = 800): string =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;

const base = (
  partial: Partial<CatalogEvent> &
    Pick<CatalogEvent, 'id' | 'title' | 'date' | 'location' | 'gradient' | 'image'>,
): CatalogEvent => ({
  description:
    'Join an immersive, on-chain powered event where your refundable deposit guarantees your spot. Check in, complete sponsor tasks, and earn rewards.',
  organizer: 'StakePass',
  organizerInitials: 'SP',
  organizerColor: '#e60012',
  price: '0.1 AVAX',
  capacity: 100,
  sold: 45,
  category: 'Featured',
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
    organizerColor: '#e60012',
    date: 'Jul 18 - 20',
    location: 'Miami, FL',
    price: '0.1 AVAX',
    gradient: 'from-red-900 via-red-700 to-black',
    image: img('photo-1540575467063-178a50c2df87', 1600, 900),
    category: 'Tech',
    capacity: 300,
    sold: 210,
    featured: true,
  }),
  base({
    id: 2,
    title: 'NEON UNDERGROUND RAVE',
    description:
      'An immersive audio-visual experience in a converted warehouse. Stake your spot, check in, and earn micro-bounties from sponsors throughout the night.',
    organizer: 'BassDAO',
    organizerInitials: 'BD',
    organizerColor: '#ff2d55',
    date: 'Aug 02',
    location: 'Brooklyn, NY',
    price: '0.2 AVAX',
    gradient: 'from-purple-900 via-red-800 to-black',
    image: img('photo-1470229722913-7c0e2dbbafd3', 1600, 900),
    category: 'Concerts',
    capacity: 250,
    sold: 180,
    featured: true,
  }),
  base({
    id: 3,
    title: 'DEGEN DERBY - KART RACING',
    description:
      'High-speed electric kart racing with on-chain leaderboards. Top finishers split the no-show pool. Losers get bragging rights and nothing else.',
    organizer: 'SpeedFi',
    organizerInitials: 'SF',
    organizerColor: '#ff4444',
    date: 'Aug 15',
    location: 'Austin, TX',
    price: '1.0 AVAX',
    gradient: 'from-orange-900 via-red-700 to-black',
    image: img('photo-1503376780353-7e6692767b70', 1600, 900),
    category: 'Sports',
    capacity: 120,
    sold: 76,
    featured: true,
  }),
  base({
    id: 4,
    title: 'SUPREME CODE HACKATHON',
    description:
      '48 hours. Zero sleep. Build the future of event ticketing on Avalanche. $50K in prizes, all distributed on-chain via smart contracts.',
    organizer: 'StakePass',
    organizerInitials: 'SP',
    organizerColor: '#e60012',
    date: 'Sep 05 - 07',
    location: 'San Francisco, CA',
    price: 'Free',
    gradient: 'from-red-800 via-black to-gray-900',
    image: img('photo-1504639725590-34d0984388bd', 1600, 900),
    category: 'Tech',
    capacity: 200,
    sold: 140,
    featured: true,
  }),

  // Concerts
  base({ id: 101, title: 'Midnight Bass Drop', date: 'Jul 22', location: 'LA', organizer: 'BassDAO', organizerInitials: 'BD', price: '0.5 AVAX', gradient: 'from-red-800 to-black', image: img('photo-1493225457124-a3eb161ffa5f'), category: 'Concerts' }),
  base({ id: 102, title: 'Lo-Fi Rooftop Session', date: 'Jul 25', location: 'Chicago', organizer: 'ChillWave', organizerInitials: 'CW', price: '0.2 AVAX', gradient: 'from-rose-900 to-black', image: img('photo-1492684223066-81342ee5ff30'), category: 'Concerts' }),
  base({ id: 103, title: 'Synthwave Nights', date: 'Jul 28', location: 'Portland', organizer: 'RetroFi', organizerInitials: 'RF', price: '0.3 AVAX', gradient: 'from-pink-900 to-black', image: img('photo-1514525253161-7a46d19cd819'), category: 'Concerts' }),
  base({ id: 104, title: 'Acoustic & AVAX', date: 'Aug 01', location: 'Nashville', organizer: 'SoundDAO', organizerInitials: 'SD', price: '0.1 AVAX', gradient: 'from-red-700 to-gray-900', image: img('photo-1511671782779-c97d3d27a1d4'), category: 'Concerts' }),

  // Tech
  base({ id: 201, title: 'Smart Contract Workshop', date: 'Aug 05', location: 'SF', organizer: 'AvaLabs', organizerInitials: 'AL', price: 'Free', gradient: 'from-red-900 to-gray-950', image: img('photo-1519389950473-47ba0277781c'), category: 'Tech' }),
  base({ id: 202, title: 'DeFi Builders Meetup', date: 'Aug 08', location: 'NYC', organizer: 'StakePass', organizerInitials: 'SP', price: '0.1 AVAX', gradient: 'from-red-800 to-black', image: img('photo-1556761175-5973dc0f32e7'), category: 'Tech' }),
  base({ id: 203, title: 'ZK Proofs Deep Dive', date: 'Aug 12', location: 'Denver', organizer: 'CryptoEd', organizerInitials: 'CE', price: '0.4 AVAX', gradient: 'from-orange-900 to-black', image: img('photo-1550751827-4bd374c3f58b'), category: 'Tech' }),
  base({ id: 204, title: 'AI × Web3 Panel', date: 'Aug 15', location: 'Seattle', organizer: 'NexusDAO', organizerInitials: 'ND', price: '0.2 AVAX', gradient: 'from-rose-800 to-black', image: img('photo-1485827404703-89b55fcc595e'), category: 'Tech' }),

  // Sports
  base({ id: 301, title: 'Degen Derby Racing', date: 'Aug 15', location: 'Austin', organizer: 'SpeedFi', organizerInitials: 'SF', price: '1.0 AVAX', gradient: 'from-red-700 to-black', image: img('photo-1503376780353-7e6692767b70'), category: 'Sports' }),
  base({ id: 302, title: '3v3 Basketball Stake', date: 'Aug 18', location: 'LA', organizer: 'CourtDAO', organizerInitials: 'CD', price: '0.3 AVAX', gradient: 'from-red-900 to-gray-900', image: img('photo-1546519638-68e109498ffc'), category: 'Sports' }),
  base({ id: 303, title: 'Surf & Stake Open', date: 'Aug 22', location: 'San Diego', organizer: 'WaveFi', organizerInitials: 'WF', price: '0.5 AVAX', gradient: 'from-rose-800 to-black', image: img('photo-1502680390469-be75c86b636f'), category: 'Sports' }),
  base({ id: 304, title: 'E-Sports LAN Party', date: 'Aug 25', location: 'Dallas', organizer: 'FragDAO', organizerInitials: 'FD', price: '0.2 AVAX', gradient: 'from-red-800 to-gray-950', image: img('photo-1542751110-97427bbecf20'), category: 'Sports' }),

  // Art
  base({ id: 401, title: 'NFT Gallery Opening', date: 'Sep 01', location: 'Miami', organizer: 'ArtBlock', organizerInitials: 'AB', price: 'Free', gradient: 'from-purple-900 to-black', image: img('photo-1531058020387-3be344556be6'), category: 'Art' }),
  base({ id: 402, title: 'Generative Art Live', date: 'Sep 04', location: 'Berlin', organizer: 'GenDAO', organizerInitials: 'GD', price: '0.2 AVAX', gradient: 'from-red-900 to-black', image: img('photo-1550745165-9bc0b252726f'), category: 'Art' }),
  base({ id: 403, title: 'Street Art × Crypto', date: 'Sep 08', location: 'London', organizer: 'WallFi', organizerInitials: 'WF', price: '0.1 AVAX', gradient: 'from-rose-900 to-gray-950', image: img('photo-1519608487953-e999c86e7455'), category: 'Art' }),
  base({ id: 404, title: 'Digital Sculpture Show', date: 'Sep 12', location: 'Tokyo', organizer: 'MeshDAO', organizerInitials: 'MD', price: '0.3 AVAX', gradient: 'from-red-800 to-black', image: img('photo-1557672172-298e090bd0f1'), category: 'Art' }),

  // Food
  base({ id: 501, title: 'Crypto Taco Fest', date: 'Sep 15', location: 'Austin', organizer: 'FoodDAO', organizerInitials: 'FD', price: '0.1 AVAX', gradient: 'from-orange-900 to-black', image: img('photo-1551504734-5ee1c4a1479b'), category: 'Food' }),
  base({ id: 502, title: 'Ramen & Rollup Night', date: 'Sep 18', location: 'NYC', organizer: 'NoodlFi', organizerInitials: 'NF', price: '0.2 AVAX', gradient: 'from-red-800 to-gray-900', image: img('photo-1569718212165-3a8278d5f624'), category: 'Food' }),
  base({ id: 503, title: 'Wine Tasting on Chain', date: 'Sep 22', location: 'Napa', organizer: 'VinoDAO', organizerInitials: 'VD', price: '0.5 AVAX', gradient: 'from-rose-900 to-black', image: img('photo-1510812431401-41d2bd2722f3'), category: 'Food' }),
  base({ id: 504, title: 'BBQ Stake-Off', date: 'Sep 25', location: 'Kansas City', organizer: 'GrillFi', organizerInitials: 'GF', price: '0.3 AVAX', gradient: 'from-red-700 to-black', image: img('photo-1529193591184-b1d58069ecdd'), category: 'Food' }),
];

export function getEventById(id: number | string): CatalogEvent | undefined {
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  return catalog.find((e) => e.id === num);
}