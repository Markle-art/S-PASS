import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Check-In
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Organizers present the QR code. Attendees scan to verify and reclaim deposits.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-white" />
            <span className="font-bold text-white">Scan or Verify Attendance</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Organizers can present a unique QR code for event check-in. The attendee wallet
            address is verified on-chain after the scan, and the deposit is instantly refunded.
          </p>
          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40">
              Current check-in code
            </p>
            <p className="mt-1.5 font-mono text-lg font-semibold text-white">
              AVA-2026-001
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white p-6">
            <QRCodeSVG
              value="stakepass://checkin/ava-2026-001"
              size={200}
              level="M"
            />
          </div>
          <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Verified attendees will be eligible for rewards after the event ends.
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-white/50">
        <ArrowRight size={16} className="text-white/30" />
        After scanning, the contract checks the attendee in and refunds the staked deposit on-chain.
      </div>
    </div>
  );
}
