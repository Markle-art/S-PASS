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
            className={`group relative rounded-2xl border-2 p-5 text-left shadow-sm transition-all hover:shadow-md ${
              isSelected
                ? 'border-brand-500 bg-brand-50 shadow-brand-100'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {isSelected && (
              <span className="absolute right-3 top-3 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                Selected
              </span>
            )}
            <h3
              className={`text-base font-semibold ${
                isSelected ? 'text-brand-700' : 'text-gray-900'
              }`}
            >
              {event.name}
            </h3>
            <div className="mt-3 space-y-1.5 text-sm text-gray-500">
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
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    filled >= 90
                      ? 'bg-brand-500'
                      : filled >= 60
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                  }`}
                  style={{ width: `${filled}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-400">
                Stake: <span className="text-gray-700">{event.deposit} AVAX</span>
              </span>
              <span className="text-gray-400">
                {event.capacity - event.registered} left
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
