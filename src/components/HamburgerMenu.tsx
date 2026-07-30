import { useNavigate, useLocation } from 'react-router-dom';
import { X, CalendarCheck, UserCheck, Award, Ticket, QrCode, Gift } from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: typeof CalendarCheck;
}

const mainItems: MenuItem[] = [
  { label: 'Organizer', path: '/organizer', icon: CalendarCheck },
  { label: 'Attendee', path: '/attendee', icon: UserCheck },
  { label: 'Sponsor', path: '/sponsor', icon: Award },
];

const secondaryItems: MenuItem[] = [
  { label: 'Events', path: '/event', icon: Ticket },
  { label: 'Check-In', path: '/checkin', icon: QrCode },
  { label: 'Rewards', path: '/rewards', icon: Gift },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            Stake<span className="text-brand-600">Pass</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Select role
          </p>
          <div className="space-y-1">
            {mainItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? 'border-l-4 border-brand-500 bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="my-6 border-t border-gray-100" />

          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            More
          </p>
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    active
                      ? 'border-l-4 border-brand-500 bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
