import { useState } from 'react';
import { ethers } from 'ethers';
import { Plus, XCircle, Users, Coins } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import { defaultEvents, type StakePassEvent } from '../data/events';
import { switchToFuji, FUJI_CHAIN_ID } from '../utils/network';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env?.VITE_STAKEPASS_CORE_ADDRESS ||
  '0x77426B5099501C023106E0a83FF75fe6F2aFE94D';

const CONTRACT_ABI = [
  'function createEvent(uint256 _depositAmount) external returns (uint256)',
  'function checkInAttendee(uint256 _eventId, address _attendee) external',
  'function closeEventAndDistributePool(uint256 _eventId) external',
  'function getEvent(uint256 _eventId) external view returns ((uint256 id, address organizer, uint256 depositAmount, uint256 totalStaked, uint256 noShowPool, bool isActive, uint256 checkedInCount, uint256 sponsorBudget, bool closed))',
];

const dummyAttendees = [
  { address: '0x8D0f...2A91', status: 'Verified' },
  { address: '0x1A3c...9F40', status: 'Pending' },
  { address: '0x4B77...12C2', status: 'Verified' },
];

export default function OrganizerPage() {
  const [events, setEvents] = useState<StakePassEvent[]>(defaultEvents);
  const [selectedEvent, setSelectedEvent] = useState<StakePassEvent | null>(null);
  const [eventName, setEventName] = useState('');
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [statusMessage, setStatusMessage] = useState('Create an event or manage existing ones.');
  const [isBusy, setIsBusy] = useState(false);

  const ensureSigner = async () => {
    if (!window.ethereum) throw new Error('No wallet detected.');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== FUJI_CHAIN_ID) {
      const switched = await switchToFuji();
      if (!switched) throw new Error('Please switch to Avalanche Fuji (Chain ID 43113) in your wallet.');
    }
    return await provider.getSigner();
  };

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
      // const receipt = await tx.wait();
      const newId = events.length + 1;
      const newEvent: StakePassEvent = {
        id: newId,
        name: eventName,
        deposit: depositAmount,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        location: 'TBD',
        capacity: 100,
        registered: 0,
      };
      setEvents((prev) => [...prev, newEvent]);
      setEventName('');
      setStatusMessage(`"${eventName}" created. Deposit set to ${depositAmount} AVAX.`);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Organizer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-gray-400">Your Events</h2>
        <EventGrid events={events} selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-brand-600">
            <Plus size={18} />
            <span className="font-semibold text-gray-900">Create Event</span>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Event Name
              </label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. Avalanche Summit"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none ring-0 transition placeholder:text-gray-300 focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Deposit Amount (AVAX)
              </label>
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none ring-0 transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              onClick={createEvent}
              disabled={isBusy}
              className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Processing…' : 'Create Event'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <XCircle size={18} />
            <span className="font-semibold text-gray-900">Manage Event</span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">Selected Event</p>
              <p className="mt-1 font-medium text-gray-900">
                {selectedEvent ? selectedEvent.name : 'None selected'}
              </p>
              {selectedEvent && (
                <p className="text-xs text-gray-400">ID: {selectedEvent.id}</p>
              )}
            </div>
            <button
              onClick={closeEvent}
              disabled={isBusy || !selectedEvent}
              className="w-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Close Event & Distribute Pool
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
          <Users size={18} className="text-gray-400" />
          <span className="font-semibold text-gray-900">
            {selectedEvent ? `Attendees — ${selectedEvent.name}` : 'Registered Attendees'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 font-medium text-gray-500">Wallet</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dummyAttendees.map((a) => (
                <tr key={a.address} className="transition hover:bg-gray-50">
                  <td className="px-6 py-3.5 font-mono text-sm text-gray-700">{a.address}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                        a.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          a.status === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'
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

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-500">
        <Coins size={16} className="text-amber-500" />
        No-show pool is automatically built from forfeited deposits and distributed at event close.
      </div>
    </div>
  );
}
