import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, User as UserIcon, Ticket, CalendarCheck, Award, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { placeholderAccounts, type Role } from '../data/users';

const roleMeta: Record<Role, { icon: typeof Ticket; color: string; ring: string }> = {
  attendee: { icon: Ticket, color: 'text-[#e60012]', ring: 'hover:border-[#e60012]/50' },
  organizer: { icon: CalendarCheck, color: 'text-[#ffb800]', ring: 'hover:border-[#ffb800]/50' },
  sponsor: { icon: Award, color: 'text-emerald-400', ring: 'hover:border-emerald-400/50' },
};

export default function LoginPage() {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: string } | null)?.from;

  const redirectAfterLogin = (role: Role) => {
    navigate(from ?? (role === 'organizer' ? '/organizer' : role === 'sponsor' ? '/sponsor' : '/'), {
      replace: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error ?? 'Login failed.');
      return;
    }
    const role = placeholderAccounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase(),
    )?.role;
    redirectAfterLogin(role ?? 'attendee');
  };

  const quickLogin = (role: Role) => {
    loginAs(role);
    redirectAfterLogin(role);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#e60012]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#e60012]/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Stake<span className="text-[#e60012]">Pass</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">Sign in to manage events, tickets and rewards.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-sm text-white outline-none ring-0 transition placeholder:text-white/25 focus:border-[#e60012]/60 focus:ring-2 focus:ring-[#e60012]/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-10 pr-11 text-sm text-white outline-none ring-0 transition placeholder:text-white/25 focus:border-[#e60012]/60 focus:ring-2 focus:ring-[#e60012]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e60012] py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700"
            >
              <LogIn size={16} />
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={13} className="text-[#e60012]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              Quick demo access
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="space-y-2">
            {placeholderAccounts.map((acc) => {
              const meta = roleMeta[acc.role];
              const Icon = meta.icon;
              return (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc.role)}
                  className={`flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left transition ${meta.ring}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-black/40 ${meta.color}`}>
                      <Icon size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{acc.label}</p>
                      <p className="font-mono text-[11px] text-white/40">{acc.email}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-white/30">{acc.password}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-white/30">
          <UserIcon size={12} className="mr-1 inline" />
          On-chain actions still require connecting your Avalanche wallet from the header. This
          login only gates which dashboard you see.
        </p>
      </div>
    </div>
  );
}
