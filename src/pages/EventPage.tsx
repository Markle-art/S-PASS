import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const event = {
  title: 'Avalanche Summit',
  description: 'A fast-paced conference for founders, builders, and product teams shipping on Avalanche.',
  location: 'San Francisco • 24 July 2026',
  reward: '250 SPASS',
};

export default function EventPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Featured Event
        </h1>
        <p className="mt-1 text-sm text-white/50">Explore upcoming events powered by StakePass.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#e60012]">
                Featured event
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">{event.title}</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Open for registration
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="leading-relaxed text-white/60">{event.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-white/30" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-white/30" />
                In-person venue
              </div>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
              Reward token: {event.reward} — StakePass reward points
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-6">
            <h3 className="text-base font-bold text-white">How to attend</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/50">
              {[
                'Connect your Avalanche wallet',
                'Register for the event',
                'Stake the refundable deposit',
                'Check in with the QR code',
                'Receive rewards after the event',
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
              onClick={() => navigate(isAuthenticated ? '/attendee' : '/login')}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e60012] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              <Ticket size={16} />
              Register now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
