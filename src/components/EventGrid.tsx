import { MapPin, CalendarDays, Users } from 'lucide-react';
import type { StakePassEvent } from '../data/events';

interface Props {
  events: StakePassEvent[];
  selectedId: number | null;
  onSelect: (event: StakePassEvent) => void;
}

export default function EventGrid({ events, selectedId, onSelect }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const isSelected = selectedId === event.id;
        const filled = Math.round((event.registered / event.capacity) * 100);
        return (
          <button
            key={event.id}
            onClick={() => onSelect(event)}
            className={`group relative overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 ${
              isSelected
                ? 'border-[#e60012]/60 bg-[#e60012]/10 shadow-[0_0_20px_rgba(230,0,18,0.15)]'
                : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]'
            }`}
          >
            <div className="relative h-28 overflow-hidden bg-gradient-to-br from-red-900 via-red-700 to-black">
              <img
                src={event.image}
                alt={event.name}
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              {isSelected && (
                <span className="absolute right-3 top-3 rounded-full bg-[#e60012] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Selected
                </span>
              )}
            </div>
            <div className="p-5">
              <h3
                className={`text-base font-bold ${
                  isSelected ? 'text-white' : 'text-white'
                }`}
              >
              {event.name}
            </h3>
            <div className="mt-3 space-y-1.5 text-sm text-white/50">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {event.date}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} />
                {event.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={13} />
                {event.registered}/{event.capacity}
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    filled >= 90
                      ? 'bg-[#e60012]'
                      : filled >= 60
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                  }`}
                  style={{ width: `${filled}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-white/40">
                Stake: <span className="text-[#e60012]">{event.deposit} AVAX</span>
              </span>
              <span className="text-white/40">
                {event.capacity - event.registered} left
              </span>
            </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
