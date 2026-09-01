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
        <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 border-l border-white/10 bg-[#0a0a0a] shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <span className="text-lg font-black uppercase tracking-tight text-white">
            Stake<span className="text-[#e60012]">Pass</span>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
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
                      ? 'border-l-4 border-[#e60012] bg-[#e60012]/10 text-[#e60012]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="my-6 border-t border-white/10" />

          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
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
                      ? 'border-l-4 border-[#e60012] bg-[#e60012]/10 text-[#e60012]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
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
