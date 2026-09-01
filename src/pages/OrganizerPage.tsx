import { useState } from 'react';
import { ethers } from 'ethers';
import { Plus, XCircle, Users, Coins } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import { defaultEvents, type StakePassEvent } from '../data/events';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

const dummyAttendees = [
  { address: '0x8D0f...2A91', status: 'Verified' as const },
  { address: '0x1A3c...9F40', status: 'Pending' as const },
  { address: '0x4B77...12C2', status: 'Verified' as const },
];

export default function OrganizerPage() {
  const [events, setEvents] = useState<StakePassEvent[]>(defaultEvents);
  const [selectedEvent, setSelectedEvent] = useState<StakePassEvent | null>(null);
  const [eventName, setEventName] = useState('');
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [statusMessage, setStatusMessage] = useState('Create an event or manage existing ones.');
  const [isBusy, setIsBusy] = useState(false);

  const createEvent = async () => {
    if (!eventName.trim()) {
      setStatusMessage('Please enter an event name.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.createEvent(ethers.parseEther(depositAmount));
      await tx.wait();
      const newId = events.length + 1;
      const newEvent: StakePassEvent = {
        id: newId,
        name: eventName,
        deposit: depositAmount,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        location: 'TBD',
        capacity: 100,
        registered: 0,
        image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&h=500&auto=format&fit=crop',
      };
      setEvents((prev) => [...prev, newEvent]);
      setEventName('');
      setStatusMessage(`"${eventName}" created on-chain. Deposit set to ${depositAmount} AVAX.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Event creation failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const closeEvent = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.closeEventAndDistributePool(BigInt(selectedEvent.id));
      await tx.wait();
      setStatusMessage(`"${selectedEvent.name}" closed. No-show pool distributed.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Event close failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Organizer Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/50">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-white/40">
          Your Events
        </h2>
        <EventGrid events={events} selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-[#e60012]">
            <Plus size={18} />
            <span className="font-bold text-white">Create Event</span>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                Event Name
              </label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Avalanche Summit"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none ring-0 transition placeholder:text-white/25 focus:border-[#e60012]/60 focus:ring-2 focus:ring-[#e60012]/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                Deposit Amount (AVAX)
              </label>
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none ring-0 transition focus:border-[#e60012]/60 focus:ring-2 focus:ring-[#e60012]/20"
              />
            </div>
            <button
              onClick={createEvent}
              disabled={isBusy}
              className="w-full rounded-xl bg-[#e60012] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Processing…' : 'Create Event'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-amber-400">
            <XCircle size={18} />
            <span className="font-bold text-white">Manage Event</span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                Selected Event
              </p>
              <p className="mt-1 font-semibold text-white">
                {selectedEvent ? selectedEvent.name : 'None selected'}
              </p>
              {selectedEvent && (
                <p className="text-xs text-white/40">ID: {selectedEvent.id}</p>
              )}
            </div>
            <button
              onClick={closeEvent}
              disabled={isBusy || !selectedEvent}
              className="w-full rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-300 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close Event & Distribute Pool
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
          <Users size={18} className="text-white/40" />
          <span className="font-semibold text-white">
            {selectedEvent ? `Attendees — ${selectedEvent.name}` : 'Registered Attendees'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-3 font-semibold text-white/40">Wallet</th>
                <th className="px-6 py-3 font-semibold text-white/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {dummyAttendees.map((a) => (
                <tr key={a.address} className="transition hover:bg-white/[0.03]">
                  <td className="px-6 py-3.5 font-mono text-sm text-white/70">{a.address}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        a.status === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-white/50">
        <Coins size={16} className="text-amber-400" />
        No-show pool is automatically built from forfeited deposits and distributed at event close.
      </div>
    </div>
  );
}
