import { useState } from 'react';
import { ethers } from 'ethers';
import { Award, QrCode, Trophy, Coins, ArrowRight } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import { defaultEvents, type StakePassEvent } from '../data/events';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

export default function SponsorPage() {
  const [selectedEvent, setSelectedEvent] = useState<StakePassEvent | null>(null);
  const [sponsorBudget, setSponsorBudget] = useState('0.5');
  const [statusMessage, setStatusMessage] = useState('Select an event, fund bounties, and reward attendees.');
  const [isBusy, setIsBusy] = useState(false);

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
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Sponsor Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/50">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-white/40">
          Active Events
        </h2>
        <EventGrid events={defaultEvents} selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-[#e60012]/30 bg-[#e60012]/10 px-5 py-3 text-sm text-[#ff6666]">
          Sponsoring: <span className="font-bold text-white">{selectedEvent.name}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-white" />
            <span className="font-bold text-white">Fund Bounty Budget</span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                Event
              </p>
              <p className="mt-1 font-semibold text-white">
                {selectedEvent ? selectedEvent.name : 'Select an event above'}
              </p>
              {selectedEvent && (
                <p className="text-xs text-white/40">ID: {selectedEvent.id}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                Budget (AVAX)
              </label>
              <input
                value={sponsorBudget}
                onChange={(e) => setSponsorBudget(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none ring-0 transition focus:border-[#e60012]/60 focus:ring-2 focus:ring-[#e60012]/20"
              />
            </div>
            <button
              onClick={depositFunds}
              disabled={isBusy || !selectedEvent}
              className="w-full rounded-xl bg-[#e60012] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Processing…' : 'Deposit Bounty Budget'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-white" />
            <span className="font-bold text-white">Actions</span>
          </div>
          <div className="mt-5 space-y-3">
            <button
              onClick={markTaskComplete}
              disabled={isBusy || !selectedEvent}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <QrCode size={16} />
              Mark Sponsor Task Complete
            </button>
            <button
              onClick={claimReward}
              disabled={isBusy || !selectedEvent}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e60012]/40 bg-[#e60012]/10 px-4 py-2.5 text-sm font-bold text-[#ff6666] transition hover:bg-[#e60012]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trophy size={16} />
              Claim Sponsor Reward
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-white/50">
        <ArrowRight size={16} className="text-white/30" />
        Sponsors fund micro-bounties in AVAX. Attendees scan sponsor QR codes to complete tasks and claim rewards.
      </div>
    </div>
  );
}
