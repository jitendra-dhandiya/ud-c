'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Divider, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../hooks/useAuth';
import { useAppSelector } from '../../../store';
import { motion } from 'framer-motion';

const schema = Yup.object({
  email:    Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router     = useRouter();
  const isAuth     = useAppSelector((s) => s.auth.isAuthenticated);
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd]       = useState(false);

  // If already logged in, bounce to home
  useEffect(() => {
    if (isAuth) router.replace('/');
  }, [isAuth, router]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      setSubmitting(true);
      try {
        await login(email, password, () => router.push('/'));
      } catch {
        // error already toasted in useAuth
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#fafafa' }}>
      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ bgcolor: 'white', p: 5, borderRadius: 2, boxShadow: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <IconButton component={Link} href="/" size="small" sx={{ color: '#666' }}>
                <ArrowBack fontSize="small" />
              </IconButton>
              <Typography variant="caption" color="text.secondary">Back to home</Typography>
            </Box>

            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography variant="h4" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, letterSpacing: '0.1em', mb: 0.5 }}>
                Unique Dressup
              </Typography>
            </Link>
            <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: 0.5 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Sign in to your account
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="email" label="Email" fullWidth size="small" type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.email && !!formik.errors.email}
                  helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                  name="password" label="Password" fullWidth size="small"
                  type={showPwd ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange} onBlur={formik.handleBlur}
                  error={formik.touched.password && !!formik.errors.password}
                  helperText={formik.touched.password && formik.errors.password}
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
                  sx={{ bgcolor: '#1a1a1a', py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#333' } }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Sign In'}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Link href="/forgot-password" style={{ color: '#888', fontSize: '0.8rem' }}>
                Forgot password?
              </Link>
            </Box>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">or</Typography>
            </Divider>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#1a1a1a', fontWeight: 700 }}>Create one</Link>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
