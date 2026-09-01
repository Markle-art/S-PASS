import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ethers } from 'ethers';
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Ticket,
  ChevronLeft,
  ShieldCheck,
  Coins,
  QrCode,
  ArrowRight,
  Flame,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getEventById, catalog } from '../data/catalog';
import { useAuth } from '../context/AuthContext';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

type BookingStatus = 'idle' | 'busy' | 'success' | 'error';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [booking, setBooking] = useState<{ status: BookingStatus; message: string }>({
    status: 'idle',
    message: '',
  });

  const event = getEventById(id ?? '');

  if (!event) {
    return <Navigate to="/" replace />;
  }

  const filled = Math.round((event.sold / event.capacity) * 100);
  const remaining = event.capacity - event.sold;

  const depositAvax = event.price.match(/^([\d.]+)\s*AVAX$/i)?.[1] ?? null;

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/event/${event.id}` } });
      return;
    }

    if (depositAvax === null) {
      setBooking({
        status: 'error',
        message:
          'This event has free entry — no on-chain deposit is required. Just connect your wallet and check in with your QR on the day.',
      });
      return;
    }

    setBooking({ status: 'busy', message: `Staking ${event.price} to secure your spot…` });
    try {
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.registerAndStake(BigInt(event.id), {
        value: ethers.parseEther(depositAvax),
      });
      setBooking({ status: 'busy', message: 'Transaction submitted — waiting for confirmation…' });
      await tx.wait();
      setBooking({
        status: 'success',
        message: `You're in! Your ${event.price} deposit is locked for "${event.title}". Show your QR code on event day to get it refunded.`,
      });
    } catch (error) {
      setBooking({
        status: 'error',
        message: error instanceof Error ? error.message : 'Booking failed.',
      });
    }
  };

  const bookButtonLabel = () => {
    if (booking.status === 'busy') return 'Booking…';
    if (depositAvax === null) return 'Free entry';
    return isAuthenticated ? 'Book & Stake' : 'Sign in to Book';
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 transition hover:text-white"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Hero */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${event.gradient}`}>
        <img
          src={event.image}
          alt={event.title}
          loading="eager"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        <div className="relative p-8 sm:p-12">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 font-bold uppercase tracking-[0.15em] text-white/70">
              <Flame size={12} className="text-[#e60012]" />
              {event.category}
            </span>
            <span className="rounded-full bg-black/50 px-3 py-1.5 font-bold text-[#e60012]">
              {event.price}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight sm:text-5xl">
            {event.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} /> by {event.organizer}
            </span>
          </div>

          <div className="mt-6 max-w-2xl">
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full rounded-full bg-[#e60012] transition-all"
                style={{ width: `${filled}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-white/60">
              <span>{event.sold} registered</span>
              <span>{remaining} left of {event.capacity}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={handleBook}
              disabled={booking.status === 'busy'}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e60012] px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_30px_rgba(230,0,18,0.4)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {booking.status === 'busy' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Ticket size={16} />
              )}
              {bookButtonLabel()}
            </button>
            {booking.status === 'success' && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                <CheckCircle size={15} /> Booked — check in below when you arrive.
              </span>
            )}
          </div>

          {booking.status === 'busy' && (
            <p className="mt-4 inline-flex max-w-md items-start gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70 backdrop-blur-sm">
              <Loader2 size={15} className="mt-0.5 shrink-0 animate-spin text-[#e60012]" />
              {booking.message}
            </p>
          )}
          {booking.status === 'error' && (
            <p className="mt-4 inline-flex max-w-md items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {booking.message}
            </p>
          )}
          {booking.status === 'success' && (
            <p className="mt-4 inline-flex max-w-md items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle size={15} className="mt-0.5 shrink-0" />
              {booking.message}
            </p>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-white">About this event</h2>
            <p className="mt-3 leading-relaxed text-white/60">{event.description}</p>
            <p className="mt-3 leading-relaxed text-white/60">
              Your deposit is fully refundable — it is locked on-chain when you register and
              returned the moment you check in. All funds are handled by the smart contract, so
              there is no middleman and no risk of a rug pull.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-white">Event details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                <Clock size={18} className="text-[#e60012]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Date</p>
                  <p className="text-sm font-semibold text-white">{event.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                <MapPin size={18} className="text-[#e60012]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Venue</p>
                  <p className="text-sm font-semibold text-white">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                <Users size={18} className="text-[#e60012]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Capacity</p>
                  <p className="text-sm font-semibold text-white">{event.capacity} seats</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                <Coins size={18} className="text-[#e60012]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Deposit</p>
                  <p className="text-sm font-semibold text-white">{event.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-base font-bold uppercase tracking-tight text-white">How it works</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              {[
                'Connect your Avalanche wallet',
                'Book by staking the refundable deposit',
                'Check in on the day via QR code',
                'Deposit is instantly refunded',
                'Split the no-show pool as a reward',
              ].map((step, i) => (
                <li key={step} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e60012]/20 text-xs font-bold text-[#ff6666]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#e60012]/30 bg-[#e60012]/10 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#e60012]" />
              <div>
                <h3 className="font-bold text-white">Refundable & secure</h3>
                <p className="mt-1 text-sm text-white/60">
                  Funded by StakePass Core on Avalanche Fuji. No-show deposits are shared with the
                  attendees who actually show up.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkin')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <QrCode size={16} />
              Check in with QR
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/50">
            <ArrowRight size={16} className="mt-0.5 shrink-0 text-white/30" />
            <span>
              Looking for more? Browse all {catalog.length} events on the dashboard.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}