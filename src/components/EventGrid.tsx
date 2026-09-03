import { MapPin, CalendarDays, Users } from 'lucide-react';

export interface GridEventItem {
  id: number;
  name?: string;
  title?: string;
  deposit?: string;
  price?: string;
  date: string;
  location: string;
  capacity?: number;
  registered?: number;
  sold?: number;
  image: string;
}

interface Props<T extends GridEventItem> {
  events: T[];
  selectedId: number | null;
  onSelect: (event: T) => void;
}

export default function EventGrid<T extends GridEventItem>({ events, selectedId, onSelect }: Props<T>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const title = event.name || event.title || `Event #${event.id}`;
        const depositStr = event.deposit ? `${event.deposit} AVAX` : event.price || '0.1 AVAX';
        const registeredCount = event.registered ?? event.sold ?? 0;
        const totalCapacity = event.capacity ?? 100;
        const isSelected = selectedId === event.id;
        const filled = Math.min(100, Math.round((registeredCount / totalCapacity) * 100));

        return (
          <button
            key={event.id}
            onClick={() => onSelect(event)}
            className={`group relative overflow-hidden rounded-2xl border text-left transition-all hover:-translate-y-0.5 ${
              isSelected
                ? 'border-[#e60012]/80 bg-[#e60012]/10 shadow-[0_0_25px_rgba(230,0,18,0.25)]'
                : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
            }`}
          >
            <div className="relative h-32 overflow-hidden bg-gradient-to-br from-red-900 via-red-700 to-black">
              <img
                src={event.image}
                alt={title}
                loading="lazy"
                onError={(e) => (e.currentTarget.style.display = 'none')}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {isSelected && (
                <span className="absolute right-3 top-3 rounded-full bg-[#e60012] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  Active Selection
                </span>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-tight text-white line-clamp-1 group-hover:text-[#e60012] transition">
                {title}
              </h3>
              <div className="mt-3 space-y-1.5 text-xs text-white/50">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-[#e60012]" />
                  {event.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e60012]" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-[#e60012]" />
                  {registeredCount} / {totalCapacity} spots filled
                </div>
              </div>

              <div className="mt-3.5">
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
                  Required Stake: <span className="text-[#ff5555] font-bold">{depositStr}</span>
                </span>
                <span className="text-white/40 font-medium">
                  {Math.max(0, totalCapacity - registeredCount)} left
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

