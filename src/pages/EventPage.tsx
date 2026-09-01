import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { getEventById } from '../data/catalog';

const FEATURED_ID = 1;

const featured = getEventById(FEATURED_ID)!;

export default function EventPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Featured Event
        </h1>
        <p className="mt-1 text-sm text-white/50">Explore upcoming events powered by StakePass.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="relative aspect-[21/9] bg-gradient-to-br from-red-900 via-red-700 to-black">
          <img
            src={featured.image}
            alt={featured.title}
            onError={(e) => (e.currentTarget.style.display = 'none')}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#e60012]">
              Featured event
            </p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{featured.title}</h2>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="leading-relaxed text-white/60">{featured.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-white/30" />
                {featured.date} • {featured.location}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-white/30" />
                In-person venue
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
              Deposit: {featured.price} — fully refundable on check-in
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <h3 className="text-base font-bold text-white">How to attend</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/50">
              {[
                'Connect your Avalanche wallet',
                'Book by staking the refundable deposit',
                'Check in with the QR code',
                'Deposit is refunded on check-in',
                'No-shows pool is shared with attendees',
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e60012]/20 text-xs font-bold text-[#ff6666]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(`/event/${FEATURED_ID}`)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e60012] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              <Ticket size={16} />
              View event & book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
