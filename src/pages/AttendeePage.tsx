import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlus, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import { defaultEvents, type StakePassEvent } from '../data/events';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

export default function AttendeePage() {
  const location = useLocation();
  const preselectedId = (location.state as { eventId?: number } | null)?.eventId;
  const [selectedEvent, setSelectedEvent] = useState<StakePassEvent | null>(
    () => defaultEvents.find((e) => e.id === preselectedId) ?? null,
  );
  const [statusMessage, setStatusMessage] = useState('Select an event and register to get started.');
  const [isBusy, setIsBusy] = useState(false);

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
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Attendee Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/50">{statusMessage}</p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-white/40">
          Available Events
        </h2>
        <EventGrid events={defaultEvents} selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </div>

      {selectedEvent && (
        <div className="rounded-xl border border-[#e60012]/30 bg-[#e60012]/10 px-5 py-3 text-sm text-[#ff6666]">
          Selected: <span className="font-bold text-white">{selectedEvent.name}</span> — stake{' '}
          <span className="font-bold text-white">{selectedEvent.deposit} AVAX</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-white">
            <UserPlus size={18} />
            <span className="font-bold">Register & Stake</span>
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
                <p className="text-xs text-white/40">
                  Stake: {selectedEvent.deposit} AVAX
                </p>
              )}
            </div>
            <button
              onClick={registerAndStake}
              disabled={isBusy || !selectedEvent}
              className="w-full rounded-xl bg-[#e60012] px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? 'Processing…' : 'Register & Stake'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-white">
            <QrCode size={18} />
            <span className="font-bold">Check-In</span>
          </div>
          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="rounded-xl border border-white/10 bg-white p-4">
              <QRCodeSVG
                value={`stakepass://checkin/${selectedEvent?.id ?? 0}`}
                size={160}
                level="M"
              />
            </div>
            <button
              onClick={checkIn}
              disabled={isBusy || !selectedEvent}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e60012]/40 bg-[#e60012]/10 px-4 py-2.5 text-sm font-bold text-[#ff6666] transition hover:bg-[#e60012]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
          { label: 'Status', value: selectedEvent ? 'Ready to stake' : 'No event selected', color: 'text-white' },
          { label: 'Refund', value: 'On check-in', color: 'text-emerald-400' },
          { label: 'Rewards', value: 'No-show pool share', color: 'text-[#e60012]' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
              {item.label}
            </p>
            <p className={`mt-2 text-lg font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-white/50">
        <ArrowRight size={16} className="text-white/30" />
        Your deposit is only locked until you check in. No-shows forfeit into the reward pool.
      </div>
    </div>
  );
}
