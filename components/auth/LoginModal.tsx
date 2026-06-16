'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, Box, Typography, TextField, Button,
  Divider, CircularProgress, IconButton, Tab, Tabs, Link as MuiLink,
  InputAdornment,
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../store';
import { openLoginModal, closeLoginModal } from '../../store/slices/uiSlice';
import { setCredentials, setLoading } from '../../store/slices/authSlice';
import { authApi } from '../../services/api.service';
import toast from 'react-hot-toast';

// ── Validation schemas ────────────────────────────────────────────
const loginSchema = Yup.object({
  email:    Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const registerSchema = Yup.object({
  firstName: Yup.string().required('Required'),
  lastName:  Yup.string().required('Required'),
  email:     Yup.string().email('Invalid email').required('Required'),
  phone:     Yup.string().optional(),
  password:  Yup.string().min(6, 'Min 6 characters').required('Required'),
});

// ── LoginModal ────────────────────────────────────────────────────
export default function LoginModal() {
  const dispatch     = useAppDispatch();
  const open         = useAppSelector((s) => s.ui.loginModalOpen);
  const isAuth       = useAppSelector((s) => s.auth.isAuthenticated);

  const [tab, setTab]               = useState<0 | 1>(0); // 0=login, 1=register
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Close if user becomes authenticated (e.g. after login)
  useEffect(() => {
    if (isAuth && open) dispatch(closeLoginModal());
  }, [isAuth, open, dispatch]);

  // Listen for axios 401 → show modal
  useEffect(() => {
    const handler = () => { if (!isAuth) dispatch(openLoginModal()); };
    window.addEventListener('auth:required', handler);
    return () => window.removeEventListener('auth:required', handler);
  }, [isAuth, dispatch]);

  const handleClose = useCallback(() => {
    dispatch(closeLoginModal());
    // Reset state after close animation
    setTimeout(() => {
      setTab(0);
      setForgotMode(false);
      setForgotSent(false);
      setForgotEmail('');
      setShowPwd(false);
    }, 250);
  }, [dispatch]);

  // ── Login form ──────────────────────────────────────────────────
  const loginForm = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async ({ email, password }) => {
      setSubmitting(true);
      dispatch(setLoading(true));
      try {
        const { data } = await authApi.login(email, password);
        dispatch(setCredentials(data.data));
        toast.success('Welcome back!');
        // Modal closes via the isAuth useEffect above
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Login failed');
      } finally {
        setSubmitting(false);
        dispatch(setLoading(false));
      }
    },
  });

  // ── Register form ───────────────────────────────────────────────
  const registerForm = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', password: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      dispatch(setLoading(true));
      try {
        const { data } = await authApi.register(values as any);
        dispatch(setCredentials(data.data));
        toast.success('Account created! Welcome aboard.');
        // Modal closes via the isAuth useEffect above
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Registration failed');
      } finally {
        setSubmitting(false);
        dispatch(setLoading(false));
      }
    },
  });

  // ── Forgot password ─────────────────────────────────────────────
  const handleForgot = async () => {
    if (!forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Enter a valid email address');
      return;
    }
    setForgotSending(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Could not send reset email');
    } finally {
      setForgotSending(false);
    }
  };

  const tf = (form: typeof loginForm | typeof registerForm, name: string, extra?: object) => ({
    name,
    size: 'small' as const,
    fullWidth: true,
    value: (form.values as any)[name],
    onChange: form.handleChange,
    onBlur:   form.handleBlur,
    error:    (form.touched as any)[name] && !!(form.errors as any)[name],
    helperText: (form.touched as any)[name] && (form.errors as any)[name],
    ...extra,
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header strip */}
        <Box sx={{ px: 4, pt: 4, pb: 0, position: 'relative' }}>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ position: 'absolute', top: 12, right: 12, color: '#888' }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Typography
            variant="h5"
            sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, letterSpacing: '0.04em', mb: 0.5 }}
          >
            {forgotMode ? 'Reset Password' : tab === 0 ? 'Welcome Back' : 'Create Account'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {forgotMode
              ? "Enter your email and we'll send a reset link"
              : tab === 0
              ? 'Sign in to continue shopping'
              : 'Join us for a better experience'}
          </Typography>
        </Box>

        {/* Tabs — only when not in forgot mode */}
        {!forgotMode && (
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setShowPwd(false); }}
            variant="fullWidth"
            sx={{
              px: 4,
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' },
              '& .MuiTabs-indicator': { bgcolor: '#1a1a1a', height: 2 },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Register" />
          </Tabs>
        )}

        <Divider />

        <Box sx={{ px: 4, py: 3 }}>

          {/* ── Forgot password ─────────────────────────── */}
          {forgotMode && (
            <Box>
              {forgotSent ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="success.main" fontWeight={600} sx={{ mb: 1 }}>
                    Reset link sent!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Check your inbox at <strong>{forgotEmail}</strong>
                  </Typography>
                  <Button
                    fullWidth variant="outlined"
                    onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                    sx={{ borderColor: '#ddd', color: 'text.primary' }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    size="small" fullWidth label="Email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    type="email"
                    onKeyDown={(e) => e.key === 'Enter' && handleForgot()}
                  />
                  <Button
                    fullWidth variant="contained" onClick={handleForgot} disabled={forgotSending}
                    sx={{ bgcolor: '#1a1a1a', py: 1.25, fontWeight: 700, '&:hover': { bgcolor: '#333' } }}
                  >
                    {forgotSending ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Send Reset Link'}
                  </Button>
                  <Button
                    fullWidth variant="text"
                    onClick={() => setForgotMode(false)}
                    sx={{ color: '#666', fontSize: '0.8rem' }}
                  >
                    ← Back to Sign In
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* ── Login form ──────────────────────────────── */}
          {!forgotMode && tab === 0 && (
            <form onSubmit={loginForm.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField {...tf(loginForm, 'email', { label: 'Email', type: 'email', autoComplete: 'email' })} />
                <TextField
                  {...tf(loginForm, 'password', { label: 'Password', type: showPwd ? 'text' : 'password', autoComplete: 'current-password' })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                          {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1 }}>
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={() => setForgotMode(true)}
                    underline="hover"
                    sx={{ fontSize: '0.78rem', color: '#888', cursor: 'pointer', border: 'none', bgcolor: 'transparent' }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                <Button
                  type="submit" fullWidth variant="contained" disabled={submitting}
                  sx={{ bgcolor: '#1a1a1a', py: 1.4, fontWeight: 700, letterSpacing: '0.06em', '&:hover': { bgcolor: '#333' } }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Sign In'}
                </Button>

                <Divider sx={{ my: 0.5 }}>
                  <Typography variant="caption" color="text.disabled">or</Typography>
                </Divider>

                <Typography variant="body2" align="center">
                  Don't have an account?{' '}
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={() => setTab(1)}
                    sx={{ fontWeight: 700, color: '#1a1a1a', cursor: 'pointer', border: 'none', bgcolor: 'transparent', fontSize: 'inherit' }}
                  >
                    Create one
                  </MuiLink>
                </Typography>
              </Box>
            </form>
          )}

          {/* ── Register form ────────────────────────────── */}
          {!forgotMode && tab === 1 && (
            <form onSubmit={registerForm.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField {...tf(registerForm, 'firstName', { label: 'First Name', autoComplete: 'given-name' })} />
                  <TextField {...tf(registerForm, 'lastName',  { label: 'Last Name',  autoComplete: 'family-name' })} />
                </Box>
                <TextField {...tf(registerForm, 'email',    { label: 'Email',        type: 'email',    autoComplete: 'email' })} />
                <TextField {...tf(registerForm, 'phone',    { label: 'Phone (opt.)', type: 'tel',      autoComplete: 'tel'   })} />
                <TextField
                  {...tf(registerForm, 'password', { label: 'Password', type: showPwd ? 'text' : 'password', autoComplete: 'new-password' })}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                          {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit" fullWidth variant="contained" disabled={submitting}
                  sx={{ bgcolor: '#1a1a1a', py: 1.4, fontWeight: 700, letterSpacing: '0.06em', '&:hover': { bgcolor: '#333' } }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Create Account'}
                </Button>

                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={() => setTab(0)}
                    sx={{ fontWeight: 700, color: '#1a1a1a', cursor: 'pointer', border: 'none', bgcolor: 'transparent', fontSize: 'inherit' }}
                  >
                    Sign in
                  </MuiLink>
                </Typography>

                <Typography variant="caption" color="text.disabled" align="center" sx={{ mt: -0.5 }}>
                  By registering you agree to our{' '}
                  <Link href="/privacy-policy" style={{ color: '#888' }} onClick={handleClose}>
                    Privacy Policy
                  </Link>
                </Typography>
              </Box>
            </form>
          )}

        </Box>
      </DialogContent>
    </Dialog>
  );
}
