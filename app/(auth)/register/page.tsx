'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Box, Container, Typography, TextField, Button, Divider, CircularProgress, Grid, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../hooks/useAuth';
import { motion } from 'framer-motion';

const schema = Yup.object({
  firstName: Yup.string().min(2).required('First name is required'),
  lastName: Yup.string().min(2).required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Password is required'),
});

export default function RegisterPage() {
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { firstName: '', lastName: '', email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await register(values);
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
            {/* Back to home */}
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Join the Unique Dressup community
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      name="firstName" label="First Name" fullWidth size="small"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.firstName && !!formik.errors.firstName}
                      helperText={formik.touched.firstName && formik.errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      name="lastName" label="Last Name" fullWidth size="small"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.lastName && !!formik.errors.lastName}
                      helperText={formik.touched.lastName && formik.errors.lastName}
                    />
                  </Grid>
                </Grid>
                <TextField
                  name="email" label="Email" fullWidth size="small"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && !!formik.errors.email}
                  helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                  name="password" label="Password" type="password" fullWidth size="small"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && !!formik.errors.password}
                  helperText={formik.touched.password && formik.errors.password}
                />
                <Button
                  type="submit" fullWidth variant="contained" disabled={submitting}
                  sx={{ bgcolor: '#1a1a1a', py: 1.5, '&:hover': { bgcolor: '#333' } }}
                >
                  {submitting
                    ? <CircularProgress size={20} sx={{ color: 'white' }} />
                    : 'Create Account'
                  }
                </Button>
              </Box>
            </form>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              By creating an account, you agree to our{' '}
              <Link href="/terms" style={{ color: '#1a1a1a' }}>Terms</Link> &{' '}
              <Link href="/privacy-policy" style={{ color: '#1a1a1a' }}>Privacy Policy</Link>
            </Typography>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">or</Typography>
            </Divider>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#1a1a1a', fontWeight: 700 }}>Sign in</Link>
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
