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
      toast.error(e?.response?.data?.message || 'Login failed');
      throw e; // re-throw so the caller can handle it
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // register — no automatic redirect; caller decides what to do on success
  const register = useCallback(async (formData: object, onSuccess?: () => void) => {
    dispatch(setLoading(true));
    try {
      const { data } = await authApi.register(formData as any);
      dispatch(setCredentials(data.data));
      toast.success('Account created successfully!');
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Registration failed');
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

  return { user, isAuthenticated, isLoading, isAdmin, isSubAdmin, login, register, logout };
};
