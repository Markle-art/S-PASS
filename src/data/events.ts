export interface StakePassEvent {
  id: number;
  name: string;
  deposit: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  image: string;
}

const img = (id: string, w = 800, h = 500): string =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;

export const defaultEvents: StakePassEvent[] = [
  {
    id: 1,
    name: 'Avalanche Summit',
    deposit: '0.1',
    date: '24 Jul 2026',
    location: 'San Francisco',
    capacity: 100,
    registered: 45,
    image: img('photo-1540575467063-178a50c2df87'),
  },
  {
    id: 2,
    name: 'DeFi Hackathon',
    deposit: '0.05',
    date: '15 Aug 2026',
    location: 'Online',
    capacity: 200,
    registered: 78,
    image: img('photo-1556761175-5973dc0f32e7'),
  },
  {
    id: 3,
    name: 'NFT Gallery Night',
    deposit: '0.2',
    date: '5 Sep 2026',
    location: 'New York',
    capacity: 50,
    registered: 32,
    image: img('photo-1531058020387-3be344556be6'),
  },
];
