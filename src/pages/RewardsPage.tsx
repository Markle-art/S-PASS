import { Gift } from 'lucide-react';

const rewards = [
  { label: 'Verified check-in', amount: '250 SPASS', status: 'Claimed', statusColor: 'bg-emerald-500/10 text-emerald-400' },
  { label: 'Organizer bonus', amount: '50 SPASS', status: 'Pending', statusColor: 'bg-amber-500/10 text-amber-400' },
  { label: 'No-show pool share', amount: '~0.3 AVAX', status: 'Available', statusColor: 'bg-white/10 text-white/70' },
  { label: 'Sponsor bounty', amount: '10 SPASS', status: 'Pending', statusColor: 'bg-amber-500/10 text-amber-400' },
];

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Rewards
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Track your token activity and claim available rewards.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map((reward) => (
          <div
            key={reward.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
                  {reward.label}
                </p>
                <p className="mt-2 text-2xl font-black text-white">{reward.amount}</p>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${reward.statusColor}`}>
                {reward.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-white/50">
        <Gift size={16} className="text-white/30" />
        Rewards are distributed after the event closes. Pending items can be claimed once eligible.
      </div>
    </div>
  );
}
