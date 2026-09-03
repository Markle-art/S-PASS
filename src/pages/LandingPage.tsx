import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Ticket,
  Flame,
  MapPin,
  Clock,
  ShieldCheck,
  Coins,
  Search,
  Sparkles,
  Award,
} from 'lucide-react';
import { getStoredEvents, getProtocolStats, type AppEvent } from '../services/eventService';

const CATEGORY_ORDER = ['Concerts', 'Tech', 'Sports', 'Art', 'Food'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(getProtocolStats());

  useEffect(() => {
    setEvents(getStoredEvents());
    setStats(getProtocolStats());
  }, []);

  /* ── carousel state ── */
  const topPicks = useMemo(() => {
    const featured = events.filter((e) => e.featured);
    return featured.length > 0 ? featured : events.slice(0, 4);
  }, [events]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || topPicks.length === 0) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [isTransitioning, topPicks.length],
  );

  const nextSlide = useCallback(
    () => goToSlide((currentSlide + 1) % (topPicks.length || 1)),
    [currentSlide, goToSlide, topPicks.length],
  );
  const prevSlide = useCallback(
    () => goToSlide((currentSlide - 1 + topPicks.length) % (topPicks.length || 1)),
    [currentSlide, goToSlide, topPicks.length],
  );

  /* auto-play */
  useEffect(() => {
    if (topPicks.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, topPicks.length]);

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── category state ── */
  const [catIndex, setCatIndex] = useState(0);
  const categories = useMemo(() => {
    return CATEGORY_ORDER.map((name) => ({
      name,
      events: events.filter((e) => e.category === name && !e.featured),
    }));
  }, [events]);

  const nextCat = () => setCatIndex((i) => (i + 1) % categories.length);
  const prevCat = () =>
    setCatIndex((i) => (i - 1 + categories.length) % categories.length);

  const currentCategory = categories[catIndex] || { name: 'Events', events: [] };
  const nextCategory = categories[(catIndex + 1) % categories.length] || { name: 'More', events: [] };

  const filteredCategoryEvents = useMemo(() => {
    if (!searchQuery.trim()) return currentCategory.events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
    );
  }, [searchQuery, currentCategory.events, events]);

  const slide = topPicks[currentSlide] || events[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-600 selection:text-white pb-20">
      {/* ═══════════════ TOP PICKS CAROUSEL ═══════════════ */}
      <section className="mx-auto max-w-7xl px-5 pt-6 sm:pt-8">
        {/* label & search bar */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-[#e60012]" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#e60012]">
              Top Featured Events
            </span>
            <div className="hidden sm:block h-px w-24 bg-gradient-to-r from-[#e60012]/50 to-transparent" />
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, cities, categories…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-4 text-xs font-medium text-white placeholder:text-white/30 outline-none focus:border-[#e60012]/60 focus:bg-black/50 transition"
            />
          </div>
        </div>

        {/* carousel container */}
        {slide && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {/* slide */}
            <div
              className={`relative aspect-[16/9] md:aspect-[21/9] w-full bg-gradient-to-br ${slide.gradient} transition-all duration-700 ease-out`}
            >
              {/* slide image */}
              <img
                src={slide.image}
                alt={slide.title}
                loading="eager"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                className="absolute inset-0 h-full w-full object-cover opacity-65"
              />

              {/* dark gradient from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              {/* content overlay - bottom left */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                {/* badges & buttons row */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#e60012] backdrop-blur-md border border-white/10">
                    {slide.category}
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md">
                    100% Refundable on Check-In
                  </span>
                  <button
                    onClick={() => toggleLike(slide.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur-md transition ${
                      liked.has(slide.id)
                        ? 'border-[#e60012] bg-[#e60012]/30 text-[#e60012]'
                        : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40 hover:text-white'
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
                    className="flex items-center gap-1.5 rounded-full bg-[#e60012] px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 shadow-[0_4px_15px_rgba(230,0,18,0.4)]"
                  >
                    <Ticket size={13} />
                    View & Stake {slide.price}
                  </button>
                </div>

                {/* title */}
                <h2 className="text-2xl font-black uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl drop-shadow-md">
                  {slide.title}
                </h2>

                {/* meta */}
                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-medium text-white/70 sm:text-sm">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#e60012]" /> {slide.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#e60012]" /> {slide.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-white/50">
                    Host: <strong className="text-white">{slide.organizer}</strong>
                  </span>
                </div>

                {/* description */}
                <p className="mt-3 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm line-clamp-2 sm:line-clamp-3">
                  {slide.description}
                </p>
              </div>

              {/* arrow controls */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-2.5 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white hover:bg-black/70 sm:left-5"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/50 p-2.5 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white hover:bg-black/70 sm:right-5"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* organizer logo dots */}
            <div className="absolute bottom-4 right-6 hidden items-center gap-2 sm:flex sm:bottom-6 sm:right-10">
              {topPicks.map((pick, i) => (
                <button
                  key={pick.id}
                  onClick={() => goToSlide(i)}
                  className={`group relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    i === currentSlide
                      ? 'scale-110 border-[#e60012] shadow-[0_0_12px_rgba(230,0,18,0.6)]'
                      : 'border-white/20 hover:border-white/50'
                  }`}
                  style={{ backgroundColor: (pick.organizerColor ?? '#e60012') + '22' }}
                  title={pick.organizer}
                >
                  <span
                    className={`text-[10px] font-black ${
                      i === currentSlide ? 'text-white' : 'text-white/40 group-hover:text-white/80'
                    }`}
                  >
                    {pick.organizerInitials}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════ INVESTOR METRICS TICKER ═══════════════ */}
      <section className="mx-auto max-w-7xl px-5 pt-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/40">
              <Coins size={15} className="text-[#e60012]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Value Staked</span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-white">
              {stats.totalValueStakedAvax.toLocaleString()} <span className="text-xs font-bold text-[#e60012]">AVAX</span>
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">100% principal protected</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/40">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Show-Up Rate</span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-emerald-400">
              {stats.attendanceRate}%
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">vs. 50% industry standard</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/40">
              <Sparkles size={15} className="text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider">SPASS Distributed</span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-white">
              {stats.spassRewardsDistributed.toLocaleString()} <span className="text-xs font-bold text-[#ff5555]">SPASS</span>
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">Fuji ERC-20 loyalty token</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-white/40">
              <Award size={15} className="text-[#e60012]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Verified Check-Ins</span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-white">
              {stats.verifiedAttendeesCount}
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">Instant on-chain refunds</p>
          </div>
        </div>
      </section>

      {/* ═══════════════ EVENTS DISCOVERY GRID ═══════════════ */}
      <section className="mx-auto max-w-7xl px-5 pt-12">
        {/* category header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl font-black uppercase tracking-tight sm:text-3xl text-white">
                {searchQuery ? `Search Results (${filteredCategoryEvents.length})` : currentCategory.name}
              </h3>
              {!searchQuery && (
                <span className="text-sm font-bold uppercase text-white/30 transition sm:text-base">
                  Next: {nextCategory.name}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-white/50">
              Browse upcoming experiences on Avalanche. Stake deposit, attend, get full refund + rewards.
            </p>
          </div>

          {!searchQuery && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevCat}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-white/60 transition hover:border-[#e60012]/50 hover:text-[#e60012] hover:bg-[#e60012]/10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextCat}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-white/60 transition hover:border-[#e60012]/50 hover:text-[#e60012] hover:bg-[#e60012]/10"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* grid */}
        {filteredCategoryEvents.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <Ticket size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-sm font-semibold text-white/60">No events found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-bold text-[#e60012] hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCategoryEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => navigate(`/event/${ev.id}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-[#e60012]/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(230,0,18,0.15)]"
              >
                {/* card image */}
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${ev.gradient}`}>
                  <img
                    src={ev.image}
                    alt={ev.title}
                    loading="lazy"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {/* price badge */}
                  <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-extrabold text-[#ff5555] backdrop-blur-md border border-white/10">
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
                    <span className="text-xs font-semibold text-white/70">{ev.organizer}</span>
                  </div>
                </div>

                {/* card body */}
                <div className="p-4">
                  <h4 className="text-sm font-bold uppercase leading-snug tracking-wide text-white group-hover:text-[#e60012] transition">
                    {ev.title}
                  </h4>
                  <div className="mt-2.5 flex items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-[#e60012]" /> {ev.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-[#e60012]" /> {ev.location}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
                    <span>{ev.sold} attending</span>
                    <span className="text-emerald-400 font-semibold">Refundable deposit</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}