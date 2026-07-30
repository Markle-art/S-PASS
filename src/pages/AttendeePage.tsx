import { useState } from 'react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlus, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
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
  'function registerAndStake(uint256 _eventId) external payable',
  'function checkInAttendee(uint256 _eventId, address _attendee) external',
  'function claimSponsorReward(uint256 _eventId, address _attendee) external',
];

export default function AttendeePage() {
  const [selectedEvent, setSelectedEvent] = useState<StakePassEvent | null>(null);
  const [statusMessage, setStatusMessage] = useState('Select an event and register to get started.');
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

  const registerAndStake = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.registerAndStake(BigInt(selectedEvent.id), {
        value: ethers.parseEther(selectedEvent.deposit),
      });
      await tx.wait();
      setStatusMessage(`Registered for "${selectedEvent.name}". Deposit locked.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const checkIn = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.checkInAttendee(BigInt(selectedEvent.id), address);
      await tx.wait();
      setStatusMessage(`Checked in to "${selectedEvent.name}". Deposit refunded.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Check-in failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Attendee Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-gray-400">Available Events</h2>
        <EventGrid events={defaultEvents} selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-3 text-sm text-brand-700">
          Selected: <span className="font-semibold">{selectedEvent.name}</span> — stake{' '}
          <span className="font-semibold">{selectedEvent.deposit} AVAX</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <UserPlus size={18} />
            <span className="font-semibold">Register & Stake</span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                Event
              </p>
              <p className="mt-1 font-medium text-gray-900">
                {selectedEvent ? selectedEvent.name : 'Select an event above'}
              </p>
              {selectedEvent && (
                <p className="text-xs text-gray-400">
                  Stake: {selectedEvent.deposit} AVAX
                </p>
              )}
            </div>
            <button
              onClick={registerAndStake}
              disabled={isBusy || !selectedEvent}
              className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Processing…' : 'Register & Stake'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-900">
            <QrCode size={18} />
            <span className="font-semibold">Check-In</span>
          </div>
          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <QRCodeSVG
                value={`stakepass://checkin/${selectedEvent?.id ?? 0}`}
                size={160}
                level="M"
              />
            </div>
            <button
              onClick={checkIn}
              disabled={isBusy || !selectedEvent}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle size={16} />
              {selectedEvent
                ? `Check-In & Refund`
                : 'Select an event first'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Status', value: selectedEvent ? 'Ready to stake' : 'No event selected', color: 'text-gray-900' },
          { label: 'Refund', value: 'On check-in', color: 'text-emerald-600' },
          { label: 'Rewards', value: 'No-show pool share', color: 'text-brand-600' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
              {item.label}
            </p>
            <p className={`mt-2 text-lg font-semibold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-500">
        <ArrowRight size={16} className="text-gray-400" />
        Your deposit is only locked until you check in. No-shows forfeit into the reward pool.
      </div>
    </div>
  );
}
