import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Award, QrCode, Trophy, Coins, ArrowRight } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import { getStoredEvents, type AppEvent } from '../services/eventService';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

export default function SponsorPage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [sponsorBudget, setSponsorBudget] = useState('0.5');
  const [taskName, setTaskName] = useState('Visit Booth & Scan QR');
  const [statusMessage, setStatusMessage] = useState('Select an event, fund micro-bounties in AVAX, and incentivize attendee foot traffic.');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const list = getStoredEvents();
    setEvents(list);
    if (list.length > 0) setSelectedEvent(list[0]);
  }, []);

  const depositFunds = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }
    try {
      setIsBusy(true);
      setStatusMessage(`Funding bounty with ${sponsorBudget} AVAX on Avalanche Fuji…`);
      const signer = await ensureSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.sponsorDeposit(BigInt(selectedEvent.onchainId || selectedEvent.id), {
        value: ethers.parseEther(sponsorBudget),
      });
      await tx.wait();
      setStatusMessage(`Bounty funded with ${sponsorBudget} AVAX for "${selectedEvent.title}".`);
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
      await contract.markSponsorTaskCompleted(BigInt(selectedEvent.onchainId || selectedEvent.id), address);
      setStatusMessage(`Task "${taskName}" marked complete for ${address.slice(0, 6)}…!`);
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
      const tx = await contract.claimSponsorReward(BigInt(selectedEvent.onchainId || selectedEvent.id), address);
      await tx.wait();
      setStatusMessage('Sponsor micro-reward claimed successfully from smart contract.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Reward claim failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Sponsor Portal & Micro-Bounties
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-white/50">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          Select Event to Sponsor
        </h2>
        <EventGrid events={events} selectedId={selectedEvent?.id ?? null} onSelect={(ev) => setSelectedEvent(ev as AppEvent)} />
      </div>

      {selectedEvent && (
        <div className="rounded-2xl border border-[#e60012]/30 bg-[#e60012]/10 px-5 py-3 text-xs sm:text-sm text-[#ff6666]">
          Active Sponsorship Target: <strong className="text-white">{selectedEvent.title}</strong> — {selectedEvent.location}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-[#e60012]" />
            <span className="font-bold text-white text-base uppercase tracking-tight">Fund Bounty Budget</span>
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Target Event</p>
              <p className="mt-1 font-black text-white">{selectedEvent ? selectedEvent.title : 'Select an event above'}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                Bounty Pool Budget (AVAX)
              </label>
              <input
                value={sponsorBudget}
                onChange={(e) => setSponsorBudget(e.target.value)}
                placeholder="0.5"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none focus:border-[#e60012]"
              />
            </div>
            <button
              onClick={depositFunds}
              disabled={isBusy || !selectedEvent}
              className="w-full rounded-xl bg-[#e60012] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-700 shadow-[0_4px_15px_rgba(230,0,18,0.35)] disabled:opacity-60"
            >
              {isBusy ? 'Submitting to Fuji…' : 'Deposit Sponsor Budget (AVAX)'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            <span className="font-bold text-white text-base uppercase tracking-tight">Quest & Verification</span>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                Quest / Micro-Task
              </label>
              <select
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#e60012]"
              >
                <option value="Visit Booth & Scan QR">Visit Sponsor Booth & Scan QR</option>
                <option value="Try Live Product Demo">Complete 2-Minute Product Demo</option>
                <option value="Follow & Claim Swag">Join Discord / Follow on X for Swag</option>
              </select>
            </div>
            <div className="space-y-2.5 pt-2">
              <button
                onClick={markTaskComplete}
                disabled={isBusy || !selectedEvent}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/[0.08] disabled:opacity-60"
              >
                <QrCode size={15} />
                Mark Attendee Task Complete
              </button>
              <button
                onClick={claimReward}
                disabled={isBusy || !selectedEvent}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e60012]/40 bg-[#e60012]/15 px-4 py-2.5 text-xs font-bold text-[#ff6666] transition hover:bg-[#e60012]/25 disabled:opacity-60"
              >
                <Trophy size={15} />
                Claim Sponsor Micro-Reward (0.01 AVAX)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-xs text-white/50">
        <ArrowRight size={15} className="text-white/30" />
        Sponsors only pay for verified physical engagement recorded on-chain, eliminating wasted marketing budgets.
      </div>
    </div>
  );
}

