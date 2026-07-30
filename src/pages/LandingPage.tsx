import { useNavigate } from 'react-router-dom';
import { CalendarCheck, UserCheck, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const roles = [
  {
    key: 'organizer',
    label: 'Organizer',
    description: 'Create events, set stake amounts, manage attendees, and distribute the no-show pool.',
    icon: CalendarCheck,
    path: '/organizer',
    color: 'text-brand-600 bg-brand-50 border-brand-200',
  },
  {
    key: 'attendee',
    label: 'Attendee',
    description: 'Register for events, stake deposits, check in via QR, and get instant refunds.',
    icon: UserCheck,
    path: '/attendee',
    color: 'text-gray-900 bg-gray-100 border-gray-300',
  },
  {
    key: 'sponsor',
    label: 'Sponsor',
    description: 'Fund micro-bounties, set engagement tasks, and reward attendees on-chain.',
    icon: Award,
    path: '/sponsor',
    color: 'text-gray-900 bg-gray-100 border-gray-300',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { walletAddress } = useOutletContext<{ walletAddress: string }>();

  return (
    <div className="space-y-12">
      <section className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-500 shadow-sm">
          <ShieldCheck size={15} className="text-brand-500" />
          Refundable attendance deposits on Avalanche Fuji
        </div>
        <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-gray-900">
          Turn every event into a
          <br />
          transparent{' '}
          <span className="text-brand-600">on-chain trust loop</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          StakePass locks a refundable deposit, instantly returns it on check-in,
          routes forfeits to the no-show pool, and pays sponsor tasks in micro-bounties.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {walletAddress
              ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
              : 'No wallet connected'}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Choose your role
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => navigate(role.path)}
              className={`group rounded-2xl border p-6 text-left shadow-sm transition hover:shadow-md ${role.color}`}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <role.icon size={22} className="text-gray-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{role.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {role.description}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-600 opacity-0 transition group-hover:opacity-100">
                Open dashboard <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">
          How it works
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['1', 'Organizer creates event', 'Sets a refundable AVAX deposit amount'],
            ['2', 'Attendee stakes deposit', 'Locks funds to secure a slot'],
            ['3', 'QR check-in on arrival', 'Scans to instantly reclaim deposit'],
            ['4', 'No-show pool distributed', 'Checked-in attendees split forfeits'],
            ['5', 'Sponsor bounties paid', 'Micro-rewards for completed tasks'],
          ].map(([num, title, desc]) => (
            <div key={num} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-600">
                {num}
              </span>
              <p className="mt-3 text-sm font-medium text-gray-900">{title}</p>
              <p className="mt-1 text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
