'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Container, Typography, TextField, Button, CircularProgress, Alert,
} from '@mui/material';
import { ArrowBack, MarkEmailRead } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { authApi } from '../../../services/api.service';
import { useAppSelector } from '../../../store';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN_S = 60;

function VerifyEmailInner() {
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);

  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isAuth) router.replace('/'); }, [isAuth, router]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // A code was just sent by whatever sent us here, so the countdown starts
  // running immediately rather than inviting an instant second request.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = useCallback(async (code: string) => {
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    try {
      await verifyEmail(email, code, () => router.push('/'));
    } catch {
      setOtp('');
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }, [email, submitting, verifyEmail, router]);

  const resend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success('A new code is on its way');
      setCooldown(RESEND_COOLDOWN_S);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not send a new code');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="warning">
          We don&apos;t know which account to verify.{' '}
          <Link href="/login" style={{ fontWeight: 700 }}>Sign in</Link> and we&apos;ll send a new code.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Button component={Link} href="/login" startIcon={<ArrowBack />} sx={{ mb: 3, color: 'text.secondary' }}>
          Back to sign in
        </Button>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <MarkEmailRead sx={{ fontSize: 44, color: 'secondary.main', mb: 1.5 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Check your email</Typography>
          <Typography variant="body2" color="text.secondary">
            We sent a 6-digit code to<br />
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{email}</Box>
          </Typography>
        </Box>

        <TextField
          inputRef={inputRef}
          fullWidth
          label="Verification code"
          value={otp}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(next);
            // Six digits is unambiguous — no reason to make them press a button.
            if (next.length === 6) submit(next);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(otp); }}
          placeholder="000000"
          inputProps={{
            inputMode: 'numeric',
            autoComplete: 'one-time-code',
            style: { letterSpacing: 14, fontSize: 26, fontWeight: 700, textAlign: 'center', fontFamily: 'monospace' },
          }}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth size="large" variant="contained"
          onClick={() => submit(otp)}
          disabled={otp.length !== 6 || submitting}
          sx={{ py: 1.5, mb: 3, bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Verify & continue'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Didn&apos;t get it? Check your spam folder.
          </Typography>
          <Button
            onClick={resend}
            disabled={cooldown > 0 || resending}
            sx={{ mt: 0.5, fontWeight: 700, textTransform: 'none' }}
          >
            {resending ? 'Sending…' : cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}

export default function VerifyEmailPage() {
  // useSearchParams needs a Suspense boundary or the whole route opts out of
  // static rendering and the build warns.
  return (
    <Suspense fallback={<Container sx={{ py: 10 }}><CircularProgress /></Container>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
