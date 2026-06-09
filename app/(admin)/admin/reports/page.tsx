'use client';
import { Box, Typography, Chip } from '@mui/material';
import { BarChart } from '@mui/icons-material';

export default function ReportsPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <BarChart sx={{ fontSize: 40, color: '#bbb' }} />
      </Box>

      <Chip
        label="Under Construction"
        size="small"
        sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, letterSpacing: '0.04em' }}
      />

      <Typography
        variant="h4"
        sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: '#1a1a1a' }}
      >
        Lead Generation Analysis
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440 }}>
        Advanced reporting and lead generation analytics are coming soon.
        You&apos;ll be able to track customer acquisition, conversion funnels,
        and campaign performance — all in one place.
      </Typography>
    </Box>
  );
}
