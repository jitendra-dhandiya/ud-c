'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Divider,
  Grid, CircularProgress, Tabs, Tab, Paper, Chip, LinearProgress,
} from '@mui/material';
import {
  CloudUpload, CheckCircle, Image as ImageIcon, Delete,
} from '@mui/icons-material';
import Image from 'next/image';
import { settingsApi } from '../../../../services/api.service';
import api from '../../../../lib/axios';
import { toast } from 'react-hot-toast';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>
);

// ── Logo Uploader ──────────────────────────────────────────────────
interface LogoUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      fd.append('folder', 'GENERAL');
      const { data } = await api.post('/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = data.data?.[0]?.url || '';
      if (url) {
        onChange(url);
        toast.success('Logo uploaded');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  return (
    <Box>
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Store Logo
      </Typography>

      {/* Current logo preview */}
      {value ? (
        <Paper
          elevation={0}
          sx={{
            border: '2px solid #e8e8e8',
            borderRadius: 2,
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
            bgcolor: '#f8f8f8',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            {/* Checkered background to show transparency */}
            <Box sx={{
              width: 180, height: 72, flexShrink: 0,
              backgroundImage: 'linear-gradient(45deg, #d8d8d8 25%, transparent 25%), linear-gradient(-45deg, #d8d8d8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d8d8d8 75%), linear-gradient(-45deg, transparent 75%, #d8d8d8 75%)',
              backgroundSize: '12px 12px',
              backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
              bgcolor: 'white',
              borderRadius: 1,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e0e0e0',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="logo preview"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <CheckCircle sx={{ fontSize: 16, color: '#2e7d32' }} />
                <Typography variant="body2" fontWeight={700} color="#2e7d32">Logo active</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', display: 'block' }} noWrap>
                {value.length > 60 ? `…${value.slice(-55)}` : value}
              </Typography>
            </Box>
          </Box>
          <Button
            size="small"
            startIcon={<Delete sx={{ fontSize: 16 }} />}
            onClick={() => onChange('')}
            sx={{ color: '#d32f2f', fontWeight: 700, flexShrink: 0, '&:hover': { bgcolor: '#fff0f0' } }}
          >
            Remove
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: `2px dashed ${dragOver ? '#1a1a1a' : '#d0d0d0'}`,
            borderRadius: 2,
            p: { xs: 3, md: 4 },
            textAlign: 'center',
            bgcolor: dragOver ? '#f5f5f5' : '#fafafa',
            transition: 'all 0.15s',
            mb: 2,
            cursor: 'pointer',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <Box>
              <CircularProgress size={32} sx={{ color: '#1a1a1a', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">Uploading logo…</Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 1, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { bgcolor: '#1a1a1a' } }} />
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 40, color: '#bbb', mb: 1 }} />
              <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                Drop your logo here or click to upload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PNG, SVG, WebP — transparent background recommended
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 1.5 }}>
                {['PNG with transparency', 'Min 400px wide', 'SVG preferred'].map(t => (
                  <Chip key={t} label={t} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Upload button */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <Button
          variant="outlined"
          startIcon={uploading ? <CircularProgress size={14} /> : <CloudUpload sx={{ fontSize: 16 }} />}
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          sx={{ fontWeight: 700, borderColor: '#1a1a1a', color: '#1a1a1a', '&:hover': { bgcolor: '#1a1a1a', color: 'white' }, borderRadius: 1.5 }}
        >
          {value ? 'Replace Logo' : 'Upload Logo'}
        </Button>
        {value && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ImageIcon sx={{ fontSize: 14 }} />
            Showing checkered bg = transparent area
          </Typography>
        )}
      </Box>

      {/* URL fallback */}
      <TextField
        label="Or paste a logo URL directly"
        size="small"
        fullWidth
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://... or /logo.png"
        sx={{ mt: 2 }}
        InputProps={{ sx: { fontSize: '0.82rem' } }}
      />
    </Box>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(() => {
    settingsApi.getAll().then(({ data }) => {
      const map: Record<string, string> = {};
      (data.data || []).forEach((s: any) => { map[s.key] = s.value ?? ''; });
      setSettings(map);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const save = async (keys: string[]) => {
    setSaving(true);
    try {
      await settingsApi.upsertBulk(keys.map(key => ({ key, value: settings[key] ?? '' })));
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;

  const storeKeys = ['site_name', 'site_tagline', 'site_description', 'site_email', 'site_phone', 'site_address', 'contact_hours', 'logo_url', 'currency', 'currency_symbol'];
  const shippingKeys = ['free_shipping_threshold', 'standard_shipping_rate', 'express_shipping_rate'];
  const socialKeys = ['instagram_url', 'facebook_url', 'twitter_url', 'youtube_url', 'pinterest_url'];
  const homepageKeys = ['announcement_text'];
  const analyticsKeys = ['google_analytics_id', 'facebook_pixel_id'];

  const SaveBtn = ({ keys }: { keys: string[] }) => (
    <Button variant="contained" onClick={() => save(keys)} disabled={saving}
      sx={{ mt: 3, bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
      {saving ? 'Saving...' : 'Save Settings'}
    </Button>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: 3 }}>Settings</Typography>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Store" />
            <Tab label="Shipping" />
            <Tab label="Social" />
            <Tab label="Homepage" />
            <Tab label="Analytics" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Store */}
            <TabPanel value={tab} index={0}>
              <Grid container spacing={3}>

                {/* Logo uploader — full width at top */}
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ border: '1px solid #e8e8e8', borderRadius: 2, p: 3 }}>
                    <LogoUploader
                      value={settings['logo_url'] ?? ''}
                      onChange={url => set('logo_url', url)}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12}><Divider /></Grid>

                {/* Store details */}
                {[
                  { key: 'site_name',    label: 'Store Name' },
                  { key: 'site_tagline', label: 'Tagline' },
                  { key: 'site_email',   label: 'Contact Email' },
                  { key: 'site_phone',   label: 'Phone Number' },
                  { key: 'currency',        label: 'Currency Code (e.g. INR)' },
                  { key: 'currency_symbol', label: 'Currency Symbol (e.g. ₹)' },
                  { key: 'contact_hours',   label: 'Business Hours (e.g. Mon–Sat: 10am–7pm)' },
                ].map(({ key, label }) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField label={label} size="small" fullWidth
                      value={settings[key] ?? ''}
                      onChange={e => set(key, e.target.value)} />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField label="Site Description (shown in footer)" size="small" fullWidth multiline rows={2}
                    value={settings['site_description'] ?? ''} onChange={e => set('site_description', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Store Address" size="small" fullWidth multiline rows={2}
                    value={settings['site_address'] ?? ''} onChange={e => set('site_address', e.target.value)} />
                </Grid>
              </Grid>
              <SaveBtn keys={storeKeys} />
            </TabPanel>

            {/* Shipping */}
            <TabPanel value={tab} index={1}>
              <Grid container spacing={2}>
                {[
                  { key: 'free_shipping_threshold', label: 'Free Shipping Threshold (₹)' },
                  { key: 'standard_shipping_rate',  label: 'Standard Shipping Rate (₹)' },
                  { key: 'express_shipping_rate',   label: 'Express Shipping Rate (₹)' },
                ].map(({ key, label }) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <TextField label={label} type="number" size="small" fullWidth
                      value={settings[key] ?? ''}
                      onChange={e => set(key, e.target.value)} />
                  </Grid>
                ))}
              </Grid>
              <SaveBtn keys={shippingKeys} />
            </TabPanel>

            {/* Social */}
            <TabPanel value={tab} index={2}>
              <Grid container spacing={2}>
                {[
                  { key: 'instagram_url', label: 'Instagram URL' },
                  { key: 'facebook_url',  label: 'Facebook URL' },
                  { key: 'twitter_url',   label: 'Twitter / X URL' },
                  { key: 'youtube_url',   label: 'YouTube URL' },
                  { key: 'pinterest_url', label: 'Pinterest URL' },
                ].map(({ key, label }) => (
                  <Grid item xs={12} key={key}>
                    <TextField label={label} size="small" fullWidth
                      value={settings[key] ?? ''}
                      onChange={e => set(key, e.target.value)} />
                  </Grid>
                ))}
              </Grid>
              <SaveBtn keys={socialKeys} />
            </TabPanel>

            {/* Homepage */}
            <TabPanel value={tab} index={3}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Announcement Bar Text"
                    size="small" fullWidth multiline rows={2}
                    helperText="Shown at the top of every page. Use | to separate messages."
                    value={settings['announcement_text'] ?? ''}
                    onChange={e => set('announcement_text', e.target.value)}
                  />
                </Grid>
              </Grid>
              <SaveBtn keys={homepageKeys} />
            </TabPanel>

            {/* Analytics */}
            <TabPanel value={tab} index={4}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Google Analytics ID" size="small" fullWidth
                    value={settings['google_analytics_id'] ?? ''}
                    onChange={e => set('google_analytics_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Facebook Pixel ID" size="small" fullWidth
                    value={settings['facebook_pixel_id'] ?? ''}
                    onChange={e => set('facebook_pixel_id', e.target.value)} />
                </Grid>
              </Grid>
              <SaveBtn keys={analyticsKeys} />
            </TabPanel>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
