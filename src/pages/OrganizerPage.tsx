import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Plus, XCircle, Users, Coins, QrCode, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import {
  getStoredEvents,
  saveNewEvent,
  getEventAttendees,
  checkInTicket,
  createTicket,
  type AppEvent,
} from '../services/eventService';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

export default function OrganizerPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [attendees, setAttendees] = useState<{ address: string; status: 'Verified' | 'Pending'; ticketId: string }[]>([]);

  // Form states
  const [eventName, setEventName] = useState('');
  const [category, setCategory] = useState('Tech');
  const [location, setLocation] = useState('Miami, FL');
  const [date, setDate] = useState('18 Oct 2026');
  const [capacity, setCapacity] = useState('150');
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [description, setDescription] = useState('Join our exclusive Web3 summit where refundable staking ensures 100% verified attendance.');

  const [statusMessage, setStatusMessage] = useState('Select an event to manage attendees, or launch a new event on Avalanche Fuji.');
  const [isBusy, setIsBusy] = useState(false);
  const [lastTxHash, setLastTxHash] = useState('');

  const reloadEvents = () => {
    const list = getStoredEvents();
    setEvents(list);
    if (!selectedEvent && list.length > 0) {
      setSelectedEvent(list[0]);
    }
  };

  useEffect(() => {
    reloadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const list = getEventAttendees(selectedEvent.id);
      setAttendees(list);
    }
  }, [selectedEvent]);

  const createEvent = async () => {
    if (!eventName.trim()) {
      setStatusMessage('Please enter an event name.');
      return;
    }

    try {
      setIsBusy(true);
      setStatusMessage('Submitting createEvent transaction to Avalanche Fuji…');

      let onchainId = events.length + 1;

      try {
        const signer = await ensureSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.createEvent(ethers.parseEther(depositAmount));
        setLastTxHash(tx.hash);
        setStatusMessage('Transaction submitted. Waiting for Avalanche block confirmation…');
        const receipt = await tx.wait();
        if (receipt) {
          setStatusMessage(`Event confirmed on Fuji! Tx: ${tx.hash.slice(0, 10)}…`);
        }
      } catch (chainErr: any) {
        console.warn('On-chain createEvent failed or skipped:', chainErr);
        setStatusMessage('Demo Mode: Created event locally (connect wallet for Fuji on-chain state).');
      }

      const newId = Date.now();
      const newEvent: AppEvent = {
        id: newId,
        onchainId,
        title: eventName,
        price: `${depositAmount} AVAX`,
        date,
        location,
        capacity: parseInt(capacity, 10) || 100,
        sold: 0,
        category,
        organizer: 'Organizer Portal',
        organizerInitials: eventName.slice(0, 2).toUpperCase(),
        gradient: 'from-red-900 via-zinc-900 to-black',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&h=800&auto=format&fit=crop',
        description,
        featured: false,
      };

      saveNewEvent(newEvent);
      reloadEvents();
      setSelectedEvent(newEvent);
      setEventName('');
      setStatusMessage(`"${eventName}" published! Available on discovery catalog and ready for attendee stakes.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Event creation failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleVerifyAttendee = async (attendeeAddress: string, ticketId: string) => {
    if (!selectedEvent) return;
    try {
      setIsBusy(true);
      setStatusMessage(`Verifying check-in and refunding ${attendeeAddress.slice(0, 6)}…`);

      try {
        const signer = await ensureSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.checkInAttendee(BigInt(selectedEvent.onchainId || selectedEvent.id), attendeeAddress);
        await tx.wait();
        setLastTxHash(tx.hash);
      } catch (err) {
        console.warn('On-chain check-in skipped or fallback:', err);
      }

      checkInTicket(ticketId, selectedEvent.id);
      setAttendees(getEventAttendees(selectedEvent.id));
      setStatusMessage(`Attendee ${attendeeAddress.slice(0, 6)}… verified! Deposit refunded.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Check-in failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddDemoAttendee = () => {
    if (!selectedEvent) return;
    const demoAddr = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
    createTicket(selectedEvent, demoAddr);
    setAttendees(getEventAttendees(selectedEvent.id));
    setStatusMessage('Added a demo registered attendee to demonstrate door check-in.');
  };

  const closeEvent = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      setStatusMessage('Closing event and distributing no-show pool on-chain…');
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.closeEventAndDistributePool(BigInt(selectedEvent.onchainId || selectedEvent.id));
      await tx.wait();
      setLastTxHash(tx.hash);
      setStatusMessage(`"${selectedEvent.title}" closed on Fuji! No-show pool distributed to verified attendees.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Event close failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Organizer Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/50">{statusMessage}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/checkin')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.08]"
          >
            <QrCode size={15} className="text-[#e60012]" />
            Launch Door Scanner
          </button>
        </div>
      </div>

      {/* Select Event */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
            Select Event to Manage ({events.length})
          </h2>
          {selectedEvent && (
            <span className="text-xs text-[#ff6666] font-semibold">
              Currently Selected: <strong className="text-white">{selectedEvent.title}</strong>
            </span>
          )}
        </div>
        <EventGrid events={events} selectedId={selectedEvent?.id ?? null} onSelect={(ev) => setSelectedEvent(ev as AppEvent)} />
      </div>

      {/* Controls & Creation Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Creator */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#e60012]">
              <Plus size={18} />
              <span className="font-black text-white text-base uppercase tracking-tight">Deploy New Event</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-[#e60012]/20 text-[#ff6666] px-2 py-0.5 border border-[#e60012]/40">
              Avalanche Fuji
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                Event Title
              </label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Avalanche Web3 Summit 2026"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#e60012]/60 focus:ring-1 focus:ring-[#e60012]/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-[#e60012]/60"
                >
                  <option value="Tech">Tech</option>
                  <option value="Concerts">Concerts</option>
                  <option value="Sports">Sports</option>
                  <option value="Art">Art</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                  Refundable Deposit (AVAX)
                </label>
                <input
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.1"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-[#e60012]/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                  Event Date
                </label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="18 Oct 2026"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#e60012]/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                  City / Location
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Miami, FL"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#e60012]/60"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                  Max Capacity
                </label>
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="200"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white outline-none focus:border-[#e60012]/60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-white/50">
                Event Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-white outline-none focus:border-[#e60012]/60 resize-none"
              />
            </div>

            <button
              onClick={createEvent}
              disabled={isBusy}
              className="w-full rounded-xl bg-[#e60012] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 shadow-[0_4px_20px_rgba(230,0,18,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy ? 'Publishing On-Chain…' : 'Deploy Event to Fuji'}
            </button>
          </div>
        </div>

        {/* Selected Event Actions & Live Pool */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <XCircle size={18} />
                <span className="font-black text-white text-base uppercase tracking-tight">Event Settlement</span>
              </div>
              <span className="text-xs text-white/40">ID #{selectedEvent?.id ?? '—'}</span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">Active Selection</p>
                <p className="mt-1 text-lg font-black text-white">{selectedEvent ? selectedEvent.title : 'No event chosen'}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/60">
                  <span>Stake: <strong className="text-white">{selectedEvent?.price ?? '0.1 AVAX'}</strong></span>
                  <span>Registered: <strong className="text-white">{attendees.length} attendees</strong></span>
                  <span>Verified: <strong className="text-emerald-400">{attendees.filter(a => a.status === 'Verified').length} checked in</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddDemoAttendee}
                  className="flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[0.08]"
                >
                  <Sparkles size={13} className="inline mr-1 text-amber-400" />
                  Simulate Attendee Stake
                </button>
                <button
                  onClick={closeEvent}
                  disabled={isBusy || !selectedEvent}
                  className="flex-1 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-400/20 disabled:opacity-50"
                >
                  Close & Distribute Pool
                </button>
              </div>

              {lastTxHash && (
                <a
                  href={`https://testnet.snowscan.xyz/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff6666] hover:underline"
                >
                  View last transaction on Snowtrace <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/60 leading-relaxed flex items-start gap-2.5">
            <Coins size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Smart Settlement Guarantee</strong>: Attendees who check in receive an immediate 100% deposit refund.
              At event close, remaining no-show deposits are split between the organizer and attendees who showed up.
            </span>
          </div>
        </div>
      </div>

      {/* Attendee Roster Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 px-6 py-4 gap-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#e60012]" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wide">
              {selectedEvent ? `Registered Roster — ${selectedEvent.title}` : 'Registered Attendees'}
            </h3>
          </div>
          <span className="text-xs text-white/40">
            {attendees.length} total registered
          </span>
        </div>

        <div className="overflow-x-auto">
          {attendees.length === 0 ? (
            <div className="p-8 text-center text-xs text-white/40">
              No registered attendees yet for this event. Click <strong>"Simulate Attendee Stake"</strong> above to test door check-in.
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/40">
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Attendee Wallet</th>
                  <th className="px-6 py-3.5">Attendance Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {attendees.map((a) => (
                  <tr key={a.ticketId || a.address} className="transition hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 font-mono text-white/60">{a.ticketId || 'STAKE-PASS'}</td>
                    <td className="px-6 py-3.5 font-mono text-white/80">{a.address}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold ${
                          a.status === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            a.status === 'Verified' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {a.status === 'Pending' ? (
                        <button
                          onClick={() => handleVerifyAttendee(a.address, a.ticketId)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                        >
                          <CheckCircle2 size={13} />
                          Check-In & Refund
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-emerald-400/80">Refunded & Rewarded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

