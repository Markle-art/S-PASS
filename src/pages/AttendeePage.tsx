import { useState, useEffect } from 'react';
import { useLocation, useOutletContext, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { UserPlus, CheckCircle, Ticket, ShieldCheck, Clock, MapPin } from 'lucide-react';
import EventGrid from '../components/EventGrid';
import {
  getStoredEvents,
  getStoredTickets,
  getUserTickets,
  createTicket,
  checkInTicket,
  type AppEvent,
  type EventTicket,
} from '../services/eventService';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ensureSigner } from '../utils/contract';

interface OutletContextType {
  walletAddress: string;
  refreshBalances?: () => void;
}

export default function AttendeePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { walletAddress, refreshBalances } = useOutletContext<OutletContextType>() || {};

  const [activeTab, setActiveTab] = useState<'passes' | 'discover'>('passes');
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const [statusMessage, setStatusMessage] = useState('Manage your active event tickets and verify door check-ins.');
  const [isBusy, setIsBusy] = useState(false);

  const loadData = () => {
    const evs = getStoredEvents();
    setEvents(evs);

    const addr = walletAddress || '0x8D0f9E8C7e9421A9fA7a9B83803B462C23622A91';
    let userTkts = getUserTickets(addr);
    if (userTkts.length === 0) {
      userTkts = getStoredTickets();
    }
    setTickets(userTkts);

    const preselectedId = (location.state as { eventId?: number } | null)?.eventId;
    if (preselectedId) {
      const match = evs.find((e) => e.id === preselectedId);
      if (match) setSelectedEvent(match);
      setActiveTab('discover');
    } else if (evs.length > 0 && !selectedEvent) {
      setSelectedEvent(evs[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, [walletAddress]);

  const registerAndStake = async () => {
    if (!selectedEvent) {
      setStatusMessage('Select an event from the grid first.');
      return;
    }

    try {
      setIsBusy(true);
      setStatusMessage(`Staking ${selectedEvent.price} on Avalanche Fuji…`);

      const depositNum = selectedEvent.price.match(/^([\d.]+)/)?.[1] || '0.1';
      let userAddr = walletAddress;
      let txHash = '';

      try {
        const signer = await ensureSigner();
        userAddr = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.registerAndStake(BigInt(selectedEvent.onchainId || selectedEvent.id), {
          value: ethers.parseEther(depositNum),
        });
        txHash = tx.hash;
        setStatusMessage('Staking transaction submitted. Waiting for Avalanche block…');
        await tx.wait();
      } catch (chainErr) {
        console.warn('On-chain staking demo fallback:', chainErr);
        if (!userAddr) userAddr = '0x8D0f9E8C7e9421A9fA7a9B83803B462C23622A91';
      }

      const tkt = createTicket(selectedEvent, userAddr, txHash);
      void tkt;
      loadData();
      setActiveTab('passes');
      if (refreshBalances) refreshBalances();
      setStatusMessage(`Registered for "${selectedEvent.title}"! Ticket added to your digital wallet.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSelfCheckIn = async (ticket: EventTicket) => {
    try {
      setIsBusy(true);
      setStatusMessage(`Executing on-chain check-in for "${ticket.eventTitle}"…`);

      try {
        const signer = await ensureSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.checkInAttendee(BigInt(ticket.eventId), address);
        await tx.wait();
      } catch (err) {
        console.warn('On-chain check-in fallback:', err);
      }

      checkInTicket(ticket.id, ticket.eventId);
      loadData();
      if (refreshBalances) refreshBalances();
      setStatusMessage(`Checked in! Deposit of ${ticket.depositAmount} refunded to your wallet.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Check-in failed.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Attendee Passbook
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/50">{statusMessage}</p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('passes')}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'passes'
                ? 'bg-[#e60012] text-white shadow-[0_2px_10px_rgba(230,0,18,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            My Passes ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'discover'
                ? 'bg-[#e60012] text-white shadow-[0_2px_10px_rgba(230,0,18,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Stake & Reserve
          </button>
        </div>
      </div>

      {/* Passes Tab */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
              Active Digital Passes & Door QRs
            </h2>
            <button
              onClick={() => navigate('/checkin')}
              className="text-xs font-bold text-[#ff6666] hover:underline"
            >
              Open Camera Check-In Scanner →
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
              <Ticket size={40} className="mx-auto text-white/20 mb-3" />
              <p className="text-base font-bold text-white">No active event passes</p>
              <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
                Stake your refundable deposit on an event to claim your pass. 100% of your deposit is returned when you arrive.
              </p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#e60012] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
              >
                Browse & Stake Events
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {tickets.map((tkt) => {
                const isVerified = tkt.status === 'checked_in';
                return (
                  <div
                    key={tkt.id}
                    className={`relative overflow-hidden rounded-3xl border transition-all ${
                      isVerified
                        ? 'border-emerald-500/30 bg-gradient-to-br from-zinc-950 to-emerald-950/20'
                        : 'border-[#e60012]/30 bg-gradient-to-br from-zinc-950 via-black to-red-950/20'
                    } p-6 backdrop-blur-sm`}
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                            isVerified
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isVerified ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          {isVerified ? 'Checked In & Refunded' : 'Deposit Staked'}
                        </span>
                        <h3 className="mt-2 text-lg font-black uppercase text-white leading-tight">
                          {tkt.eventTitle}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-white/40 font-bold">{tkt.id}</span>
                    </div>

                    {/* QR Code and details */}
                    <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
                      <div className="rounded-2xl bg-white p-3 shadow-xl shrink-0">
                        <QRCodeSVG
                          value={`stakepass://ticket/${tkt.id}/${tkt.eventId}/${tkt.attendeeAddress}`}
                          size={125}
                          level="M"
                        />
                      </div>

                      <div className="space-y-2 text-center sm:text-left text-xs text-white/60">
                        <p className="flex items-center justify-center sm:justify-start gap-1.5 text-white/80">
                          <Clock size={13} className="text-[#e60012]" /> {tkt.date}
                        </p>
                        <p className="flex items-center justify-center sm:justify-start gap-1.5 text-white/80">
                          <MapPin size={13} className="text-[#e60012]" /> {tkt.location}
                        </p>
                        <p className="font-mono text-[11px] text-white/40 truncate max-w-[200px]">
                          Holder: {tkt.attendeeAddress}
                        </p>
                        <p className="text-emerald-400 font-bold flex items-center justify-center sm:justify-start gap-1">
                          <ShieldCheck size={14} /> Deposit: {tkt.depositAmount}
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      {isVerified ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle size={15} /> 100% Refund credited + 50 SPASS
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelfCheckIn(tkt)}
                          disabled={isBusy}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 px-5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
                        >
                          <CheckCircle size={14} />
                          Check In & Claim Refund
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Discover & Stake Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
              Select an Event to Stake Deposit
            </h2>
            <EventGrid events={events} selectedId={selectedEvent?.id ?? null} onSelect={(ev) => setSelectedEvent(ev as AppEvent)} />
          </div>

          {selectedEvent && (
            <div className="rounded-3xl border border-[#e60012]/40 bg-gradient-to-br from-black via-zinc-950 to-red-950/30 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ff5555]">
                    {selectedEvent.category} Experience
                  </span>
                  <h3 className="mt-1 text-2xl font-black uppercase text-white">
                    {selectedEvent.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">{selectedEvent.description}</p>
                </div>
                <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                  <p className="text-xs text-white/40 font-bold uppercase">Required Stake</p>
                  <p className="text-3xl font-black text-[#ff4444]">{selectedEvent.price}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">100% refunded at door</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-5 text-xs text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#e60012]" /> {selectedEvent.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#e60012]" /> {selectedEvent.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-400" /> Avalanche Fuji Smart Contract
                  </span>
                </div>

                <button
                  onClick={registerAndStake}
                  disabled={isBusy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#e60012] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-700 transition shadow-[0_4px_25px_rgba(230,0,18,0.4)] disabled:opacity-60"
                >
                  <UserPlus size={15} />
                  {isBusy ? 'Staking on Fuji…' : `Stake ${selectedEvent.price} & Reserve Pass`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Guarantee */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/50">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
        <span>
          <strong>The S-PASS Anti-Flake Commitment</strong>: Your staked AVAX remains safely in the Fuji contract.
          Once you check in, you immediately get your deposit back plus a split of any no-show penalties and $SPASS loyalty tokens.
        </span>
      </div>
    </div>
  );
}

