'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Stack, TextField, MenuItem,
  Switch, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert, Skeleton, FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Link as LinkIcon, OpenInNew } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { navMenuApi } from '../../../../services/api.service';

/**
 * The quick links across the top of the Shop mega menu.
 *
 * These are filters, not categories, which is why they never lived in the
 * category table and used to be a constant in the storefront bundle. Until a
 * link is created here the storefront renders its own four defaults, so the
 * menu is never empty — "Import the default links" copies those in to make
 * them editable.
 */

interface MenuLink {
  id: string;
  label: string;
  url: string;
  gender: string;
  sortOrder: number;
  isActive: boolean;
}

const GENDERS = [
  { value: 'ALL', label: 'All Genders', color: '#607d8b' },
  { value: 'WOMEN', label: 'Women only', color: '#e91e8c' },
  { value: 'MEN', label: 'Men only', color: '#1565c0' },
];

const genderColor = (g?: string) => GENDERS.find(x => x.value === (g || 'ALL'))?.color || '#607d8b';

/** Common destinations, so the admin rarely has to know the query syntax. */
const URL_PRESETS = [
  { label: 'All products', url: '/shop' },
  { label: 'New arrivals', url: '/shop?isNewArrival=true' },
  { label: 'Best sellers', url: '/shop?sort=best-sellers' },
  { label: 'On sale', url: '/shop?discount=true' },
  { label: 'Featured', url: '/shop?isFeatured=true' },
  { label: 'Collections', url: '/collections' },
  { label: 'All categories', url: '/categories' },
];

const EMPTY = { label: '', url: '', gender: 'ALL', sortOrder: 0, isActive: true };

export default function MenuLinksPage() {
  const [links, setLinks] = useState<MenuLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [orderEdits, setOrderEdits] = useState<Record<string, string>>({});
  const [savingOrder, setSavingOrder] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await navMenuApi.getAll('quick_links');
      setLinks((data as any).data || []);
    } catch {
      toast.error('Failed to load menu links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    // Leave a gap after the last one so a link can be slotted in between later.
    const nextOrder = links.length ? Math.max(...links.map(l => l.sortOrder)) + 10 : 0;
    setForm({ ...EMPTY, sortOrder: nextOrder });
    setEditingId(null);
    setDialog(true);
  };

  const openEdit = (link: MenuLink) => {
    setForm({
      label: link.label, url: link.url, gender: link.gender || 'ALL',
      sortOrder: link.sortOrder, isActive: link.isActive,
    });
    setEditingId(link.id);
    setDialog(true);
  };

  const save = async () => {
    if (!form.label.trim()) { toast.error('Give the link a label'); return; }
    if (!form.url.trim().startsWith('/')) {
      toast.error('The link must be a path on this site, starting with /');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await navMenuApi.update(editingId, form);
        toast.success('Link updated');
      } else {
        await navMenuApi.create(form);
        toast.success('Link added');
      }
      setDialog(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save the link');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (link: MenuLink) => {
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, isActive: !l.isActive } : l));
    try {
      await navMenuApi.update(link.id, { isActive: !link.isActive });
    } catch {
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, isActive: link.isActive } : l));
      toast.error('Failed to update the link');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await navMenuApi.delete(deleteId);
      toast.success('Link deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Failed to delete the link');
    }
  };

  const importDefaults = async () => {
    try {
      await navMenuApi.importDefaults('quick_links');
      toast.success('Default links imported — edit them freely now');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to import');
    }
  };

  const dirtyOrders = Object.entries(orderEdits).filter(([id, value]) => {
    const link = links.find(l => l.id === id);
    if (!link) return false;
    const n = Number(value);
    return value.trim() !== '' && Number.isFinite(n) && n !== link.sortOrder;
  });

  const saveOrder = async () => {
    if (!dirtyOrders.length) return;
    setSavingOrder(true);
    try {
      await navMenuApi.updatePositions(
        dirtyOrders.map(([id, value]) => ({ id, sortOrder: Math.trunc(Number(value)) }))
      );
      toast.success('Order saved');
      setOrderEdits({});
      load();
    } catch {
      toast.error('Failed to save the order');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Menu Links</Typography>
          <Typography variant="caption" color="text.secondary">
            The quick links across the top of the Shop mega menu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, borderRadius: 2, fontWeight: 700 }}
        >
          Add Link
        </Button>
      </Box>

      {!loading && links.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} action={
          <Button size="small" onClick={importDefaults} sx={{ fontWeight: 700 }}>
            Import the default links
          </Button>
        }>
          <strong>The menu is currently using the built-in links</strong> — Shop All, New Arrivals,
          Best Sellers and On Sale. Import them to edit, reorder or replace them, or add your own
          from scratch. Either way the menu is never left empty.
        </Alert>
      )}

      {dirtyOrders.length > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5,
          border: '1px solid #c9a84c', borderRadius: 2, bgcolor: '#fffdf5',
        }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#7a6320', flex: 1 }}>
            {dirtyOrders.length} unsaved {dirtyOrders.length === 1 ? 'position' : 'positions'} — lower numbers show first.
          </Typography>
          <Button size="small" onClick={() => setOrderEdits({})} sx={{ color: '#7a6320' }}>Discard</Button>
          <Button
            size="small" variant="contained" onClick={saveOrder} disabled={savingOrder}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, fontWeight: 700 }}
          >
            {savingOrder ? 'Saving…' : `Save order (${dirtyOrders.length})`}
          </Button>
        </Box>
      )}

      {loading ? (
        <Stack spacing={1.5}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} height={72} sx={{ borderRadius: 2 }} />)}
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {links.map(link => (
            <Card key={link.id} elevation={0} sx={{
              border: '1px solid', borderColor: 'divider', borderRadius: 2,
              opacity: link.isActive ? 1 : 0.6,
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Tooltip title="Position — lower shows first" arrow>
                  <TextField
                    size="small"
                    type="number"
                    value={orderEdits[link.id] ?? String(link.sortOrder)}
                    onChange={e => setOrderEdits(prev => ({ ...prev, [link.id]: e.target.value }))}
                    inputProps={{ style: { textAlign: 'center', padding: '4px 6px', fontSize: '0.75rem', fontWeight: 700 } }}
                    sx={{ width: 62, '& .MuiOutlinedInput-root': { height: 28 } }}
                  />
                </Tooltip>

                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" fontWeight={700}>{link.label}</Typography>
                    <Chip
                      label={GENDERS.find(g => g.value === (link.gender || 'ALL'))?.value || 'ALL'}
                      size="small"
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: genderColor(link.gender), color: '#fff' }}
                    />
                    {!link.isActive && <Chip label="Hidden" size="small" sx={{ height: 18, fontSize: '0.6rem' }} />}
                  </Box>
                  <Box
                    component="a"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, fontSize: '0.72rem', color: '#888', textDecoration: 'none', '&:hover': { color: '#1a1a1a' } }}
                  >
                    {link.url} <OpenInNew sx={{ fontSize: 11 }} />
                  </Box>
                </Box>

                <Tooltip title={link.isActive ? 'Visible in the menu' : 'Hidden from the menu'} arrow>
                  <Switch size="small" color="success" checked={link.isActive} onChange={() => toggleActive(link)} />
                </Tooltip>
                <IconButton size="small" onClick={() => openEdit(link)}><Edit sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" color="error" onClick={() => setDeleteId(link.id)}><Delete sx={{ fontSize: 16 }} /></IconButton>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Add / edit */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingId ? 'Edit Link' : 'Add Link'}</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Label *" size="small" fullWidth autoFocus
            placeholder="e.g. Under ₹999"
            value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            helperText="What the shopper reads in the menu."
          />

          <Box>
            <TextField
              label="Link *" size="small" fullWidth
              placeholder="/shop?discount=true"
              value={form.url}
              onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
              InputProps={{ startAdornment: <LinkIcon sx={{ fontSize: 16, color: '#aaa', mr: 1 }} /> }}
              helperText="A path on this site, starting with / — external links are not allowed here."
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {URL_PRESETS.map(p => (
                <Chip
                  key={p.url}
                  label={p.label}
                  size="small"
                  variant="outlined"
                  onClick={() => setForm(prev => ({ ...prev, url: p.url, label: prev.label || p.label }))}
                  sx={{ fontSize: '0.68rem', cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>

          <TextField
            select label="Show To" size="small" fullWidth
            value={form.gender}
            onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
            helperText="All Genders shows the link under both storefronts."
          >
            {GENDERS.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Position" type="number" size="small" sx={{ width: 120 }}
              value={form.sortOrder}
              onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
              helperText="Lower first"
            />
            <FormControlLabel
              control={<Switch checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />}
              label={<Typography variant="body2" fontWeight={600}>Visible</Typography>}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderColor: '#ddd', color: '#555' }}>Cancel</Button>
          <Button
            onClick={save} variant="contained" disabled={saving}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, fontWeight: 700, minWidth: 110 }}
          >
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Link'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Delete this link?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            It will be removed from the Shop menu. If you delete every link, the menu falls back to
            the built-in defaults.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderColor: '#ddd', color: '#555' }}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
