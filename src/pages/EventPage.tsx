import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Ticket, ShieldCheck, Sparkles } from 'lucide-react';
import { getStoredEvents, type AppEvent } from '../services/eventService';

export default function EventPage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<AppEvent | null>(null);

  useEffect(() => {
    const list = getStoredEvents();
    const feat = list.find((e) => e.featured) || list[0] || null;
    setFeatured(feat);
  }, []);

  if (!featured) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Spotlight Experience
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-white/50">Explore upcoming verified events powered by Avalanche Fuji smart contracts.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm shadow-2xl">
        <div className="relative aspect-[21/9] min-h-[260px] bg-gradient-to-br from-red-950 via-zinc-950 to-black">
          <img
            src={featured.image}
            alt={featured.title}
            onError={(e) => (e.currentTarget.style.display = 'none')}
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e60012]/30 border border-[#e60012]/50 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#ff6666]">
              <Sparkles size={13} /> Featured Spotlight
            </span>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-4xl">{featured.title}</h2>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="leading-relaxed text-xs sm:text-sm text-white/70">{featured.description}</p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-white/60">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#e60012]" />
                {featured.date}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[#e60012]" />
                {featured.location}
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs sm:text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <ShieldCheck size={18} className="shrink-0 text-emerald-400" />
              Deposit Required: {featured.price} — 100% refundable upon entrance check-in.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">How S-PASS Works</h3>
            <ul className="space-y-2.5 text-xs text-white/60">
              {[
                'Connect your Avalanche Core / Web3 wallet',
                'Stake refundable deposit into Fuji smart contract',
                'Receive scannable QR ticket in your passbook',
                'Deposit instantly returned when door scanner checks you in',
                'No-show forfeiture pool distributed to attendees & organizer',
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e60012]/20 text-[11px] font-bold text-[#ff6666]">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(`/event/${featured.id}`)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e60012] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 shadow-[0_4px_20px_rgba(230,0,18,0.4)]"
            >
              <Ticket size={15} />
              View Event & Stake Deposit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

