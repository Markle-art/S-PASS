import { CalendarDays, MapPin, Sparkles } from 'lucide-react';

const event = {
  title: 'Avalanche Summit',
  description: 'A fast-paced conference for founders, builders, and product teams shipping on Avalanche.',
  location: 'San Francisco • 24 July 2026',
  reward: '250 SPASS',
};

export default function EventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Featured Event</h1>
        <p className="mt-1 text-sm text-gray-500">Explore upcoming events powered by StakePass.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-600">
                Featured event
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">{event.title}</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open for registration
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <p className="leading-relaxed text-gray-600">{event.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-gray-400" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                In-person venue
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              Reward token: {event.reward} — StakePass reward points
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-base font-semibold text-gray-900">How to attend</h3>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              {[
                'Connect your Avalanche wallet',
                'Register for the event',
                'Stake the refundable deposit',
                'Check in with the QR code',
                'Receive rewards after the event',
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700">
              <Sparkles size={16} />
              Register now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
