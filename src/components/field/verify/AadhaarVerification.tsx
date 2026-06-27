'use client';

import { useEffect, useRef, useState } from 'react';
import { Input, Button } from '@/components/ui';
import { requestAadhaarOtp, confirmAadhaarOtp } from '@/app/verifier/(secure)/artisans/[id]/verify/aadhaar-actions';
import { VerifyCheckRow } from '@/components/field/verify/VerifyFormBits';
import { cn } from '@/lib/cn';
import { ShieldCheck } from 'lucide-react';

function formatAadhaarInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export default function AadhaarVerification({
  artisanId,
  initialVerified,
  initialMasked,
  onVerified,
}: {
  artisanId: string;
  initialVerified?: boolean;
  initialMasked?: string | null;
  onVerified: (masked: string) => void;
}) {
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verified, setVerified] = useState(initialVerified ?? false);
  const [masked, setMasked] = useState(initialMasked ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  const digits = aadhaar.replace(/\D/g, '');
  const canSend = digits.length === 12 && !verified;

  async function handleSendOtp() {
    setError(null);
    setBusy(true);
    const res = await requestAadhaarOtp(artisanId, digits);
    setBusy(false);
    if (!res.ok) {
      setError('error' in res ? res.error : 'Could not send OTP.');
      return;
    }
    setOtpSent(true);
    setDevCode(res.devCode ?? null);
    setOtp('');
  }

  async function handleVerify(code: string) {
    if (verified || verifyingRef.current || code.length !== 6) return;
    verifyingRef.current = true;
    setError(null);
    setBusy(true);
    const res = await confirmAadhaarOtp(artisanId, digits, code);
    setBusy(false);
    verifyingRef.current = false;
    if (!res.ok) {
      setError(res.error ?? 'OTP verification failed.');
      setOtp('');
      return;
    }
    setVerified(true);
    setMasked(res.masked ?? '');
    onVerified(res.masked ?? '');
  }

  // Auto-validate when 6-digit OTP is entered
  useEffect(() => {
    if (otp.length === 6 && otpSent && !verified) {
      void handleVerify(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to otp length / sent state
  }, [otp, otpSent, verified]);

  if (verified) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-india-200 bg-india-50/80 px-3.5 py-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-india-700" />
          <div>
            <p className="text-sm font-semibold text-india-900">Aadhaar verified</p>
            <p className="text-xs text-india-700">{masked || 'Identity confirmed via OTP'}</p>
          </div>
        </div>
        <VerifyCheckRow checked label="Mobile number verified (Aadhaar-linked)" disabled />
        <VerifyCheckRow checked label="ID document checked" disabled />
        <VerifyCheckRow checked label="Duplicate check done" disabled />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-field-muted">Aadhaar number · आधार</p>
        <Input
          data-testid="aadhaar-number"
          inputMode="numeric"
          placeholder="XXXX XXXX XXXX"
          value={aadhaar}
          onChange={(e) => setAadhaar(formatAadhaarInput(e.target.value))}
          disabled={otpSent && busy}
          className="font-mono tracking-wider"
        />
      </div>

      {!otpSent ? (
        <Button
          type="button"
          variant="secondary"
          block
          loading={busy}
          disabled={!canSend}
          data-testid="aadhaar-send-otp"
          onClick={() => void handleSendOtp()}
        >
          Send OTP to linked mobile
        </Button>
      ) : (
        <div className="space-y-2">
          {devCode ? (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800" data-testid="aadhaar-dev-code">
              Demo OTP: <strong>{devCode}</strong> (auto-validates when entered)
            </p>
          ) : null}
          <div>
            <p className="mb-1.5 text-xs font-medium text-field-muted">Enter 6-digit OTP</p>
            <Input
              data-testid="aadhaar-otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={cn('text-center text-lg font-semibold tracking-[0.4em]', busy && 'opacity-60')}
              disabled={busy}
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="button"
            className="text-xs font-medium text-field-accent hover:underline"
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setDevCode(null);
              setError(null);
            }}
          >
            Change Aadhaar number
          </button>
        </div>
      )}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2 border-t border-field-border/60 pt-3">
        <VerifyCheckRow checked={false} label="Mobile number verified" disabled />
        <VerifyCheckRow checked={false} label="ID document checked" disabled />
        <VerifyCheckRow checked={false} label="Duplicate check done" disabled />
      </div>
    </div>
  );
}
