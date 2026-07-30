import { Gift, ArrowRight } from 'lucide-react';

const rewards = [
  { label: 'Verified check-in', amount: '250 SPASS', status: 'Claimed', statusColor: 'text-emerald-700 bg-emerald-50' },
  { label: 'Organizer bonus', amount: '50 SPASS', status: 'Pending', statusColor: 'text-amber-700 bg-amber-50' },
  { label: 'No-show pool share', amount: '~0.3 AVAX', status: 'Available', statusColor: 'text-gray-700 bg-gray-100' },
  { label: 'Sponsor bounty', amount: '10 SPASS', status: 'Pending', statusColor: 'text-amber-700 bg-amber-50' },
];

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Rewards</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your token activity and claim available rewards.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {rewards.map((reward) => (
          <div
            key={reward.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
                  {reward.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{reward.amount}</p>
              </div>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-medium ${reward.statusColor}`}
              >
                {reward.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-500">
        <Gift size={16} className="text-gray-400" />
        Rewards are distributed after the event closes. Pending items can be claimed once eligible.
      </div>
    </div>
  );
}
