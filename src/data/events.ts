export interface StakePassEvent {
  id: number;
  name: string;
  deposit: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
}

export const defaultEvents: StakePassEvent[] = [
  {
    id: 1,
    name: 'Avalanche Summit',
    deposit: '0.1',
    date: '24 Jul 2026',
    location: 'San Francisco',
    capacity: 100,
    registered: 45,
  },
  {
    id: 2,
    name: 'DeFi Hackathon',
    deposit: '0.05',
    date: '15 Aug 2026',
    location: 'Online',
    capacity: 200,
    registered: 78,
  },
  {
    id: 3,
    name: 'NFT Gallery Night',
    deposit: '0.2',
    date: '5 Sep 2026',
    location: 'New York',
    capacity: 50,
    registered: 32,
  },
];
