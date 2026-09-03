import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Gift,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Flame,
} from 'lucide-react';
import {
  SPASS_TOKEN_ADDRESS,
  fetchSpassBalance,
} from '../utils/contract';
import { getDemoSpassBalance, addDemoSpass } from '../services/eventService';

interface OutletContextType {
  walletAddress: string;
  refreshBalances?: () => void;
}

export default function RewardsPage() {
  const { walletAddress, refreshBalances } = useOutletContext<OutletContextType>() || {};

  const [onchainBalance, setOnchainBalance] = useState('0');
  const [demoBonus, setDemoBonus] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  const activeAddr = walletAddress || '0x8D0f9E8C7e9421A9fA7a9B83803B462C23622A91';

  const loadBalances = async () => {
    try {
      const bal = await fetchSpassBalance(activeAddr);
      setOnchainBalance(bal);
      const demo = getDemoSpassBalance(activeAddr);
      setDemoBonus(demo);
    } catch (err) {
      console.warn('Balance load error:', err);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [activeAddr]);

  const totalSpass = (parseFloat(onchainBalance) || 0) + demoBonus;

  const copyAddress = () => {
    navigator.clipboard.writeText(SPASS_TOKEN_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimDemoAirdrop = async () => {
    setIsClaiming(true);
    setClaimSuccess(false);

    try {
      // Simulate/trigger token credit
      await new Promise((r) => setTimeout(r, 900));
      addDemoSpass(activeAddr, 50);
      await loadBalances();
      if (refreshBalances) refreshBalances();
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 5000);
    } catch (err) {
      console.warn('Claim error:', err);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            $SPASS Reward Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/50">
            Official Avalanche Fuji ERC-20 loyalty token for verified event attendance.
          </p>
        </div>

        <button
          onClick={handleClaimDemoAirdrop}
          disabled={isClaiming}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e60012] to-red-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_25px_rgba(230,0,18,0.4)] transition hover:opacity-90 disabled:opacity-60"
        >
          <Sparkles size={14} className="text-amber-300 animate-pulse" />
          {isClaiming ? 'Claiming 50 SPASS…' : 'Claim 50 SPASS Investor Demo Reward'}
        </button>
      </div>

      {claimSuccess && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Success! 50 SPASS tokens credited to your wallet balance.</span>
          </div>
          <span className="text-emerald-400/70 font-mono">Token: SPASS</span>
        </div>
      )}

      {/* Main Token Metric Banner */}
      <div className="rounded-3xl border border-[#e60012]/30 bg-gradient-to-br from-zinc-950 via-black to-red-950/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Balance */}
          <div className="md:border-r md:border-white/10 md:pr-6">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#ff6666]">
              Your Reward Balance
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white">
                {totalSpass.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-[#ff4444]">SPASS</span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Live Avalanche Fuji ERC-20 Asset
            </p>
          </div>

          {/* Contract Details */}
          <div className="md:border-r md:border-white/10 md:px-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
              Smart Contract Specs
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-white/60">
                <span>Symbol:</span>
                <strong className="text-white">SPASS</strong>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Network:</span>
                <strong className="text-emerald-400">Avalanche Fuji (43113)</strong>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Standard:</span>
                <strong className="text-white">ERC-20 (OpenZeppelin v5)</strong>
              </div>
            </div>
          </div>

          {/* Address & Explorer */}
          <div className="md:pl-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">
              Contract Address
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono text-white/80">
              <span className="truncate">{SPASS_TOKEN_ADDRESS}</span>
              <button
                onClick={copyAddress}
                className="rounded-lg p-1 text-white/50 hover:text-white hover:bg-white/10 transition"
                title="Copy Address"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
            <a
              href={`https://testnet.snowscan.xyz/token/${SPASS_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#ff6666] hover:underline"
            >
              View on Snowtrace Explorer <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Reward Distribution Streams */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-white/40">
          Attendance Reward Ledger
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Verified Door Check-In',
              amount: '+50 SPASS / event',
              detail: 'Minted on physical venue arrival',
              status: 'Claimed',
              statusColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            },
            {
              label: 'No-Show Pool Dividend',
              amount: '0.05 – 0.5 AVAX',
              detail: 'Forfeited deposits split to attendees',
              status: 'Auto-Distributed',
              statusColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            },
            {
              label: 'Sponsor Micro-Bounty',
              amount: '+25 SPASS / task',
              detail: 'Booth check-ins & partner quests',
              status: 'Active',
              statusColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            },
            {
              label: 'Loyal Attendee Multiplier',
              amount: '1.5x Staking Power',
              detail: 'Unlocks VIP early access tiers',
              status: 'Tier 1 Unlocked',
              statusColor: 'bg-[#e60012]/15 text-[#ff6666] border-[#e60012]/30',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#e60012]/30 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                  {item.label}
                </p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${item.statusColor}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-2 text-xl font-black text-white">{item.amount}</p>
              <p className="mt-1 text-[11px] text-white/40">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Investor Utility Section */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
          <Flame size={16} className="text-[#e60012]" />
          Token Utility & Economic Flywheel
        </h3>
        <div className="grid gap-4 md:grid-cols-3 text-xs text-white/60">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-bold text-white text-sm">1. VIP Ticket Discounts</h4>
            <p className="mt-1 leading-relaxed">
              Holders burn or stake SPASS to unlock discounted deposits and priority registration windows for high-demand festivals.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-bold text-white text-sm">2. Sponsor Micro-Ad Bounties</h4>
            <p className="mt-1 leading-relaxed">
              Brands fund pools in AVAX/SPASS to drive verified physical foot traffic to event booths with provable on-chain engagement.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-black/30 p-4">
            <h4 className="font-bold text-white text-sm">3. Protocol Governance</h4>
            <p className="mt-1 leading-relaxed">
              Active attendees curate community event funding and vote on no-show forfeiture fee split ratios.
            </p>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-xs text-white/50">
        <Gift size={15} className="text-[#e60012]" />
        All SPASS tokens are verifiable on the Avalanche Fuji C-Chain explorer.
      </div>
    </div>
  );
}

