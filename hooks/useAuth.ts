'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../store';
import { setCredentials, logout as logoutAction, setLoading } from '../store/slices/authSlice';
import { authApi } from '../services/api.service';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router   = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  // login — no automatic redirect; caller decides what to do on success
  const login = useCallback(async (email: string, password: string, onSuccess?: () => void) => {
    dispatch(setLoading(true));
    try {
      const { data } = await authApi.login(email, password);
      dispatch(setCredentials(data.data));
      toast.success('Welcome back!');
      onSuccess?.();
    } catch (e: any) {
      // An account that was never verified is not a failed login — the
      // customer knows their password, they just never finished signing up.
      // Send them to the code screen instead of a dead end.
      if (e?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        const pending = e.response.data.email || email;
        toast('Verify your email to continue', { icon: '✉️' });
        try { await authApi.resendVerification(pending); } catch {}
        router.push(`/verify-email?email=${encodeURIComponent(pending)}`);
        throw e;
      }
      toast.error(e?.response?.data?.message || 'Login failed');
      throw e; // re-throw so the caller can handle it
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, router]);

  // register — no automatic redirect; caller decides what to do on success
  const register = useCallback(async (formData: object, onSuccess?: () => void) => {
    dispatch(setLoading(true));
    try {
      const { data } = await authApi.register(formData as any);
      const result = data.data as any;

      // Sign-up does not sign anyone in any more: the emailed code does.
      if (result?.requiresVerification) {
        toast.success('Check your email for the verification code');
        router.push(`/verify-email?email=${encodeURIComponent(result.user.email)}`);
        return;
      }

      dispatch(setCredentials(result));
      toast.success('Account created successfully!');
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Registration failed');
      throw e;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, router]);

  /** The code is what signs them in, so this ends with real credentials. */
  const verifyEmail = useCallback(async (email: string, otp: string, onSuccess?: () => void) => {
    dispatch(setLoading(true));
    try {
      const { data } = await authApi.verifyEmail(email, otp);
      dispatch(setCredentials(data.data));
      toast.success('Email verified — welcome!');
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Verification failed');
      throw e;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logoutAction());
    router.push('/');
    toast.success('Logged out');
  }, [dispatch, router]);

  const isAdmin    = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSubAdmin = user?.role === 'SUB_ADMIN';

  return { user, isAuthenticated, isLoading, isAdmin, isSubAdmin, login, register, verifyEmail, logout };
};
