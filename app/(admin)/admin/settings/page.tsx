'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Divider,
  Grid, CircularProgress, Tabs, Tab,
} from '@mui/material';
import { settingsApi } from '../../../../services/api.service';
import { toast } from 'react-hot-toast';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box hidden={value !== index} sx={{ pt: 3 }}>{value === index && children}</Box>
);

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
              <Grid container spacing={2}>
                {[
                  { key: 'site_name', label: 'Store Name' },
                  { key: 'site_tagline', label: 'Tagline' },
                  { key: 'site_email', label: 'Contact Email' },
                  { key: 'site_phone', label: 'Phone Number' },
                  { key: 'currency', label: 'Currency Code (e.g. INR)' },
                  { key: 'currency_symbol', label: 'Currency Symbol (e.g. ₹)' },
                  { key: 'contact_hours', label: 'Business Hours (e.g. Mon–Sat: 10am–7pm)' },
                  { key: 'logo_url', label: 'Logo URL (e.g. /logo.jpg or https://...)' },
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
                  { key: 'standard_shipping_rate', label: 'Standard Shipping Rate (₹)' },
                  { key: 'express_shipping_rate', label: 'Express Shipping Rate (₹)' },
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
                  { key: 'facebook_url', label: 'Facebook URL' },
                  { key: 'twitter_url', label: 'Twitter / X URL' },
                  { key: 'youtube_url', label: 'YouTube URL' },
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
