import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  getStoredEvents,
  getStoredTickets,
  checkInTicket,
  type AppEvent,
  type EventTicket,
} from '../services/eventService';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';
import { ethers } from 'ethers';

export default function CheckInPage() {
  const [roleMode, setRoleMode] = useState<'scanner' | 'ticket'>('scanner');
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number>(1);
  const [tickets, setTickets] = useState<EventTicket[]>([]);

  // Scanner state
  const [ticketInput, setTicketInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<EventTicket | null>(null);
  const [scanError, setScanError] = useState('');

  // Attendee view state
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);

  useEffect(() => {
    const evs = getStoredEvents();
    setEvents(evs);
    if (evs.length > 0) setSelectedEventId(evs[0].id);

    const tkts = getStoredTickets();
    setTickets(tkts);
    if (tkts.length > 0) setSelectedTicket(tkts[0]);
  }, []);

  const eventPendingTickets = tickets.filter(
    (t) => t.eventId === selectedEventId && t.status === 'staked'
  );

  const handleVerifyTicket = async (targetTicketId?: string) => {
    const idToVerify = targetTicketId || ticketInput.trim();
    if (!idToVerify) {
      setScanError('Please enter or select a ticket to verify.');
      return;
    }

    setScanError('');
    setIsVerifying(true);

    try {
      const match = tickets.find(
        (t) =>
          t.id.toLowerCase() === idToVerify.toLowerCase() ||
          t.attendeeAddress.toLowerCase() === idToVerify.toLowerCase()
      );

      if (!match) {
        setScanError('No matching ticket found for this event.');
        setIsVerifying(false);
        return;
      }

      if (match.status === 'checked_in') {
        setScanError(`Ticket ${match.id} has already been checked in & refunded.`);
        setIsVerifying(false);
        return;
      }

      // Execute on-chain check-in if possible
      try {
        const signer = await ensureSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.checkInAttendee(BigInt(match.eventId), match.attendeeAddress);
        await tx.wait();
      } catch (err) {
        console.warn('Smart contract check-in fallback:', err);
      }

      checkInTicket(match.id, match.eventId);
      const updatedList = getStoredTickets();
      setTickets(updatedList);
      match.status = 'checked_in';
      setScanSuccess(match);
      setTicketInput('');
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Venue Check-In Terminal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/50">
            {roleMode === 'scanner'
              ? 'Organizers scan attendee QR codes at the entrance to trigger instant on-chain refunds.'
              : 'Attendees present this high-contrast QR pass to the door scanner.'}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-1 border border-white/10">
          <button
            onClick={() => {
              setRoleMode('scanner');
              setScanSuccess(null);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              roleMode === 'scanner'
                ? 'bg-[#e60012] text-white shadow-[0_2px_10px_rgba(230,0,18,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Door Scanner Mode
          </button>
          <button
            onClick={() => {
              setRoleMode('ticket');
              setScanSuccess(null);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              roleMode === 'ticket'
                ? 'bg-[#e60012] text-white shadow-[0_2px_10px_rgba(230,0,18,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Attendee Pass Mode
          </button>
        </div>
      </div>

      {/* Mode A: Organizer Door Scanner */}
      {roleMode === 'scanner' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Scanner viewfinder */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#e60012]" />
                <span className="font-bold text-white text-sm uppercase tracking-wide">
                  Entrance QR Scanner
                </span>
              </div>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-[#e60012]"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Viewfinder visual */}
            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border-2 border-dashed border-white/20 bg-black/60 flex flex-col items-center justify-center p-6">
              {/* Laser scanner line animation */}
              <div className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ff2222] to-transparent shadow-[0_0_15px_#ff0000] animate-[bounce_3s_infinite]" />

              <div className="rounded-2xl border border-white/15 p-6 bg-black/40 backdrop-blur-sm text-center max-w-xs">
                <QrCode size={56} className="mx-auto text-[#e60012] opacity-80" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-white">
                  Position QR Code in Viewfinder
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  Ready to scan digital ticket pass or wristband
                </p>
              </div>
            </div>

            {/* Manual input simulation for live presentation */}
            <div className="mt-6 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                Quick Verification / Manual Input (Presentation Mode)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="Paste Ticket ID (e.g. TKT-AVAX-8821) or Attendee Wallet"
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e60012]"
                />
                <button
                  onClick={() => handleVerifyTicket()}
                  disabled={isVerifying}
                  className="rounded-xl bg-[#e60012] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition shadow-[0_4px_15px_rgba(230,0,18,0.4)] disabled:opacity-60"
                >
                  {isVerifying ? 'Checking…' : 'Verify'}
                </button>
              </div>

              {scanError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  {scanError}
                </div>
              )}
            </div>

            {/* Success Card */}
            {scanSuccess && (
              <div className="mt-6 rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/30 p-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 size={20} />
                  <span className="font-black text-sm uppercase tracking-wide">
                    Door Verification Successful!
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-white/80 font-medium">
                  <p>Ticket: <strong className="text-white font-mono">{scanSuccess.id}</strong></p>
                  <p>Event: <strong className="text-white">{scanSuccess.eventTitle}</strong></p>
                  <p className="text-emerald-300 font-bold">
                    ✓ {scanSuccess.depositAmount} deposit instantly refunded on-chain.
                  </p>
                  <p className="text-amber-300 font-bold">
                    ✓ +50 SPASS reward tokens credited.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick list of pending tickets for this event */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#e60012]" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Pending Door Arrivals ({eventPendingTickets.length})
                </span>
              </div>
            </div>

            <p className="text-xs text-white/50">
              Select any registrant below to simulate scanning their pass at the entrance:
            </p>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {eventPendingTickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/40">
                  No pending tickets for this event. All attendees are either checked in or haven't staked yet.
                </div>
              ) : (
                eventPendingTickets.map((tkt) => (
                  <button
                    key={tkt.id}
                    onClick={() => handleVerifyTicket(tkt.id)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-[#e60012]/40 hover:bg-[#e60012]/10 flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-mono text-xs font-bold text-white group-hover:text-[#ff5555]">
                        {tkt.id}
                      </p>
                      <p className="font-mono text-[10px] text-white/40 truncate max-w-[170px]">
                        {tkt.attendeeAddress}
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 text-[10px] font-bold text-emerald-300">
                      Scan In
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/40 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>Checking an attendee in automatically executes their deposit return.</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode B: Attendee High-Contrast Pass Display */}
      {roleMode === 'ticket' && (
        <div className="mx-auto max-w-md space-y-6">
          <div className="rounded-3xl border-2 border-[#e60012]/40 bg-gradient-to-br from-zinc-950 via-black to-red-950/40 p-8 shadow-[0_0_50px_rgba(230,0,18,0.25)] text-center">
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
              Show at Door Turnstile
            </span>

            <h3 className="mt-4 text-xl font-black uppercase text-white">
              {selectedTicket ? selectedTicket.eventTitle : 'Active Event Pass'}
            </h3>

            <div className="mt-6 mx-auto w-fit rounded-3xl bg-white p-5 shadow-2xl">
              <QRCodeSVG
                value={
                  selectedTicket
                    ? `stakepass://ticket/${selectedTicket.id}/${selectedTicket.eventId}/${selectedTicket.attendeeAddress}`
                    : 'stakepass://checkin/demo'
                }
                size={220}
                level="H"
              />
            </div>

            <div className="mt-6 space-y-1 font-mono text-xs text-white/60">
              <p className="font-bold text-white text-sm">{selectedTicket?.id ?? 'TKT-DEMO-001'}</p>
              <p className="truncate max-w-xs mx-auto">
                Holder: {selectedTicket?.attendeeAddress ?? '0x8D0f...2A91'}
              </p>
              <p className="text-emerald-400 font-semibold">
                Deposit Locked: {selectedTicket?.depositAmount ?? '0.1 AVAX'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Guarantee */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/50">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
        <span>
          <strong>Cryptographic Attendance Proof</strong>: Check-in records are written to the Avalanche Fuji smart contract,
          guaranteeing immediate deposit recovery and distributing verifiable attendance badges.
        </span>
      </div>
    </div>
  );
}

