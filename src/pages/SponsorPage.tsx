import { useState } from 'react';
import { ethers } from 'ethers';
import { Award, QrCode, Trophy, Coins, ArrowRight } from 'lucide-react';
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
  '0x7015c225586d4a95ebc585Ba947d7F0236A5D9d1';

const CONTRACT_ABI = [
  'function sponsorDeposit(uint256 _eventId) external payable',
  'function markSponsorTaskCompleted(uint256 _eventId, address _attendee) external',
  'function claimSponsorReward(uint256 _eventId, address _attendee) external',
];

export default function SponsorPage() {
  const [selectedEvent, setSelectedEvent] = useState<StakePassEvent | null>(null);
  const [sponsorBudget, setSponsorBudget] = useState('0.5');
  const [statusMessage, setStatusMessage] = useState('Select an event, fund bounties, and reward attendees.');
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

  const depositFunds = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.sponsorDeposit(BigInt(selectedEvent.id), {
        value: ethers.parseEther(sponsorBudget),
      });
      await tx.wait();
      setStatusMessage(`Bounty funded with ${sponsorBudget} AVAX for "${selectedEvent.name}".`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Deposit failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const markTaskComplete = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      await contract.markSponsorTaskCompleted(BigInt(selectedEvent.id), address);
      setStatusMessage(`Task marked complete for "${selectedEvent.name}".`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Task marking failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const claimReward = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      const signer = await ensureSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.claimSponsorReward(BigInt(selectedEvent.id), address);
      await tx.wait();
      setStatusMessage('Micro-reward claimed successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Reward claim failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sponsor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-gray-400">Active Events</h2>
        <EventGrid events={defaultEvents} selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-5 py-3 text-sm text-brand-700">
          Sponsoring: <span className="font-semibold">{selectedEvent.name}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-gray-900" />
            <span className="font-semibold text-gray-900">Fund Bounty Budget</span>
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
                <p className="text-xs text-gray-400">ID: {selectedEvent.id}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                  Budget (AVAX)
                </label>
                <input
                  value={sponsorBudget}
                  onChange={(e) => setSponsorBudget(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none ring-0 transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <button
                onClick={depositFunds}
                disabled={isBusy || !selectedEvent}
                className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? 'Processing…' : 'Deposit Bounty Budget'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-gray-900" />
              <span className="font-semibold text-gray-900">Actions</span>
            </div>
            <div className="mt-5 space-y-3">
              <button
                onClick={markTaskComplete}
                disabled={isBusy || !selectedEvent}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <QrCode size={16} />
                Mark Sponsor Task Complete
              </button>
              <button
                onClick={claimReward}
                disabled={isBusy || !selectedEvent}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trophy size={16} />
                Claim Sponsor Reward
              </button>
            </div>
          </div>
        </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-500">
        <ArrowRight size={16} className="text-gray-400" />
        Sponsors fund micro-bounties in AVAX. Attendees scan sponsor QR codes to complete tasks and claim rewards.
      </div>
    </div>
  );
}
