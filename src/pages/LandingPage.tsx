import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Ticket,
  Flame,
  MapPin,
  Clock,
} from 'lucide-react';

/* ──────────────────────── MOCK DATA ──────────────────────── */

const topPicks = [
  {
    id: 1,
    title: 'AVALANCHE SUMMIT 2025',
    description:
      'The biggest Web3 gathering on Fuji. Three days of keynotes, hackathons, and on-chain demos that will reshape how you think about decentralized events.',
    organizer: 'AvaLabs',
    organizerInitials: 'AL',
    organizerColor: '#e60012',
    date: 'Jul 18 - 20',
    location: 'Miami, FL',
    gradient: 'from-red-900 via-red-700 to-black',
  },
  {
    id: 2,
    title: 'NEON UNDERGROUND RAVE',
    description:
      'An immersive audio-visual experience in a converted warehouse. Stake your spot, check in, and earn micro-bounties from sponsors throughout the night.',
    organizer: 'BassDAO',
    organizerInitials: 'BD',
    organizerColor: '#ff2d55',
    date: 'Aug 02',
    location: 'Brooklyn, NY',
    gradient: 'from-purple-900 via-red-800 to-black',
  },
  {
    id: 3,
    title: 'DEGEN DERBY - KART RACING',
    description:
      'High-speed electric kart racing with on-chain leaderboards. Top finishers split the no-show pool. Losers get bragging rights and nothing else.',
    organizer: 'SpeedFi',
    organizerInitials: 'SF',
    organizerColor: '#ff4444',
    date: 'Aug 15',
    location: 'Austin, TX',
    gradient: 'from-orange-900 via-red-700 to-black',
  },
  {
    id: 4,
    title: 'SUPREME CODE HACKATHON',
    description:
      '48 hours. Zero sleep. Build the future of event ticketing on Avalanche. $50K in prizes, all distributed on-chain via smart contracts.',
    organizer: 'StakePass',
    organizerInitials: 'SP',
    organizerColor: '#e60012',
    date: 'Sep 05 - 07',
    location: 'San Francisco, CA',
    gradient: 'from-red-800 via-black to-gray-900',
  },
];

const categories = [
  {
    name: 'Concerts',
    events: [
      { id: 101, title: 'Midnight Bass Drop', date: 'Jul 22', location: 'LA', organizer: 'BassDAO', organizerInitials: 'BD', price: '0.5 AVAX', gradient: 'from-red-800 to-black' },
      { id: 102, title: 'Lo-Fi Rooftop Session', date: 'Jul 25', location: 'Chicago', organizer: 'ChillWave', organizerInitials: 'CW', price: '0.2 AVAX', gradient: 'from-rose-900 to-black' },
      { id: 103, title: 'Synthwave Nights', date: 'Jul 28', location: 'Portland', organizer: 'RetroFi', organizerInitials: 'RF', price: '0.3 AVAX', gradient: 'from-pink-900 to-black' },
      { id: 104, title: 'Acoustic & AVAX', date: 'Aug 01', location: 'Nashville', organizer: 'SoundDAO', organizerInitials: 'SD', price: '0.1 AVAX', gradient: 'from-red-700 to-gray-900' },
    ],
  },
  {
    name: 'Tech',
    events: [
      { id: 201, title: 'Smart Contract Workshop', date: 'Aug 05', location: 'SF', organizer: 'AvaLabs', organizerInitials: 'AL', price: 'Free', gradient: 'from-red-900 to-gray-950' },
      { id: 202, title: 'DeFi Builders Meetup', date: 'Aug 08', location: 'NYC', organizer: 'StakePass', organizerInitials: 'SP', price: '0.1 AVAX', gradient: 'from-red-800 to-black' },
      { id: 203, title: 'ZK Proofs Deep Dive', date: 'Aug 12', location: 'Denver', organizer: 'CryptoEd', organizerInitials: 'CE', price: '0.4 AVAX', gradient: 'from-orange-900 to-black' },
      { id: 204, title: 'AI × Web3 Panel', date: 'Aug 15', location: 'Seattle', organizer: 'NexusDAO', organizerInitials: 'ND', price: '0.2 AVAX', gradient: 'from-rose-800 to-black' },
    ],
  },
  {
    name: 'Sports',
    events: [
      { id: 301, title: 'Degen Derby Racing', date: 'Aug 15', location: 'Austin', organizer: 'SpeedFi', organizerInitials: 'SF', price: '1.0 AVAX', gradient: 'from-red-700 to-black' },
      { id: 302, title: '3v3 Basketball Stake', date: 'Aug 18', location: 'LA', organizer: 'CourtDAO', organizerInitials: 'CD', price: '0.3 AVAX', gradient: 'from-red-900 to-gray-900' },
      { id: 303, title: 'Surf & Stake Open', date: 'Aug 22', location: 'San Diego', organizer: 'WaveFi', organizerInitials: 'WF', price: '0.5 AVAX', gradient: 'from-rose-800 to-black' },
      { id: 304, title: 'E-Sports LAN Party', date: 'Aug 25', location: 'Dallas', organizer: 'FragDAO', organizerInitials: 'FD', price: '0.2 AVAX', gradient: 'from-red-800 to-gray-950' },
    ],
  },
  {
    name: 'Art',
    events: [
      { id: 401, title: 'NFT Gallery Opening', date: 'Sep 01', location: 'Miami', organizer: 'ArtBlock', organizerInitials: 'AB', price: 'Free', gradient: 'from-purple-900 to-black' },
      { id: 402, title: 'Generative Art Live', date: 'Sep 04', location: 'Berlin', organizer: 'GenDAO', organizerInitials: 'GD', price: '0.2 AVAX', gradient: 'from-red-900 to-black' },
      { id: 403, title: 'Street Art × Crypto', date: 'Sep 08', location: 'London', organizer: 'WallFi', organizerInitials: 'WF', price: '0.1 AVAX', gradient: 'from-rose-900 to-gray-950' },
      { id: 404, title: 'Digital Sculpture Show', date: 'Sep 12', location: 'Tokyo', organizer: 'MeshDAO', organizerInitials: 'MD', price: '0.3 AVAX', gradient: 'from-red-800 to-black' },
    ],
  },
  {
    name: 'Food',
    events: [
      { id: 501, title: 'Crypto Taco Fest', date: 'Sep 15', location: 'Austin', organizer: 'FoodDAO', organizerInitials: 'FD', price: '0.1 AVAX', gradient: 'from-orange-900 to-black' },
      { id: 502, title: 'Ramen & Rollup Night', date: 'Sep 18', location: 'NYC', organizer: 'NoodlFi', organizerInitials: 'NF', price: '0.2 AVAX', gradient: 'from-red-800 to-gray-900' },
      { id: 503, title: 'Wine Tasting on Chain', date: 'Sep 22', location: 'Napa', organizer: 'VinoDAO', organizerInitials: 'VD', price: '0.5 AVAX', gradient: 'from-rose-900 to-black' },
      { id: 504, title: 'BBQ Stake-Off', date: 'Sep 25', location: 'Kansas City', organizer: 'GrillFi', organizerInitials: 'GF', price: '0.3 AVAX', gradient: 'from-red-700 to-black' },
    ],
  },
];

/* ──────────────────────── COMPONENT ──────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();

  /* ── carousel state ── */
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning],
  );

  const nextSlide = useCallback(
    () => goToSlide((currentSlide + 1) % topPicks.length),
    [currentSlide, goToSlide],
  );
  const prevSlide = useCallback(
    () => goToSlide((currentSlide - 1 + topPicks.length) % topPicks.length),
    [currentSlide, goToSlide],
  );

  /* auto-play */
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── category state ── */
  const [catIndex, setCatIndex] = useState(0);
  const nextCat = () => setCatIndex((i) => (i + 1) % categories.length);
  const prevCat = () =>
    setCatIndex((i) => (i - 1 + categories.length) % categories.length);

  const currentCategory = categories[catIndex];
  const nextCategory = categories[(catIndex + 1) % categories.length];

  /* ──────────────────────── RENDER ──────────────────────── */

  const slide = topPicks[currentSlide];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-montserrat-thin selection:bg-red-600 selection:text-white">
      {/* ═══════════════ TOP PICKS CAROUSEL ═══════════════ */}
      <section className="mx-auto max-w-7xl px-5 pt-8">
        {/* label */}
        <div className="mb-3 flex items-center gap-2">
          <Flame size={14} className="text-[#e60012]" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#e60012] font-montserrat-thin">
            Top Picks
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-[#e60012]/30 to-transparent" />
        </div>

        {/* carousel container */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* slide */}
          <div
            className={`relative aspect-[21/9] w-full bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-out`}
          >
            {/* grain overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-40" />

            {/* dark gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* content overlay - bottom left */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              {/* buttons row */}
              <div className="mb-4 flex items-center gap-2">
                <button
                  onClick={() => toggleLike(slide.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide backdrop-blur-md transition ${
                    liked.has(slide.id)
                      ? 'border-[#e60012] bg-[#e60012]/20 text-[#e60012]'
                      : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <Heart
                    size={13}
                    fill={liked.has(slide.id) ? '#e60012' : 'none'}
                  />
                  Save
                </button>
                <button
                  onClick={() => navigate(`/event/${slide.id}`)}
                  className="flex items-center gap-1.5 rounded-full bg-[#e60012] px-5 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-red-700"
                >
                  <Ticket size={13} />
                  View & Book
                </button>
              </div>

              {/* title */}
              <h2 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {slide.title}
              </h2>

              {/* meta */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/50 sm:text-sm">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {slide.date}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {slide.location}
                </span>
              </div>

              {/* description */}
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
                {slide.description}
              </p>
            </div>

            {/* arrow controls */}
            <button
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-white/60 backdrop-blur-sm transition hover:border-white/30 hover:text-white sm:left-5 sm:p-3"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-white/60 backdrop-blur-sm transition hover:border-white/30 hover:text-white sm:right-5 sm:p-3"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* ── organizer logo dots ── */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 sm:bottom-6 sm:right-10">
            {topPicks.map((pick, i) => (
              <button
                key={pick.id}
                onClick={() => goToSlide(i)}
                className={`group relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 sm:h-10 sm:w-10 ${
                  i === currentSlide
                    ? 'scale-110 border-[#e60012] shadow-[0_0_12px_rgba(230,0,18,0.5)]'
                    : 'border-white/20 hover:border-white/50'
                }`}
                style={{ backgroundColor: pick.organizerColor + '22' }}
                title={pick.organizer}
              >
                <span
                  className={`text-[10px] font-black sm:text-xs ${
                    i === currentSlide ? 'text-white' : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  {pick.organizerInitials}
                </span>
                {/* tooltip */}
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {pick.organizer}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ EVENTS GRID ═══════════════ */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-20">
        {/* category header */}
        <div className="mb-6 flex items-end justify-between">
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
              {currentCategory.name}
            </h3>
            {/* next category preview */}
            <span className="text-sm font-semibold uppercase text-white/20 transition sm:text-base">
              {nextCategory.name}
            </span>
          </div>

          {/* arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevCat}
              className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-[#e60012]/50 hover:text-[#e60012]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextCat}
              className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-[#e60012]/50 hover:text-[#e60012]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentCategory.events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => navigate(`/event/${ev.id}`)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] transition hover:border-[#e60012]/30 hover:bg-white/[0.04]"
            >
              {/* card image */}
              <div
                className={`relative aspect-[4/3] bg-gradient-to-br ${ev.gradient}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                {/* price badge */}
                <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-[#e60012] backdrop-blur-sm">
                  {ev.price}
                </span>
                {/* organizer chip */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-[9px] font-black"
                    style={{ backgroundColor: '#e6001233' }}
                  >
                    {ev.organizerInitials}
                  </div>
                  <span className="text-xs text-white/50">{ev.organizer}</span>
                </div>
              </div>

              {/* card body */}
              <div className="p-4">
                <h4 className="text-sm font-bold uppercase leading-snug tracking-wide group-hover:text-[#e60012] transition">
                  {ev.title}
                </h4>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> {ev.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} /> {ev.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}