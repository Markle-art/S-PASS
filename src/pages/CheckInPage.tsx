import { QRCodeSVG } from 'qrcode.react';
import { QrCode, ShieldCheck, ArrowRight } from 'lucide-react';

export default function CheckInPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Check-In</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organizers present the QR code. Attendees scan to verify and reclaim deposits.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-gray-900" />
            <span className="font-semibold text-gray-900">Scan or Verify Attendance</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Organizers can present a unique QR code for event check-in. The attendee wallet
            address is verified on-chain after the scan, and the deposit is instantly refunded.
          </p>
          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-400">
              Current check-in code
            </p>
            <p className="mt-1.5 font-mono text-lg font-medium text-gray-900">
              AVA-2026-001
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-6">
            <QRCodeSVG
              value="stakepass://checkin/ava-2026-001"
              size={200}
              level="M"
            />
          </div>
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Verified attendees will be eligible for rewards after the event ends.
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-500">
        <ArrowRight size={16} className="text-gray-400" />
        After scanning, the contract checks the attendee in and refunds the staked deposit on-chain.
      </div>
    </div>
  );
}
