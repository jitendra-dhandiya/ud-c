'use client';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Alert, Snackbar, Tooltip, Avatar, Stack, CircularProgress,
  Grid, InputAdornment,
} from '@mui/material';
import {
  Add, Edit, Delete, DragIndicator, Instagram, OpenInNew,
  VideoLibrary, Image as ImageIcon, Link as LinkIcon, CheckCircle, Cancel,
} from '@mui/icons-material';
import api from '../../../../lib/axios';
// Shared with the storefront embed so both accept exactly the same URLs.
import { extractShortcode, buildInstagramEmbedUrl } from '../../../../utils/instagram';

interface Reel {
  id: string;
  title?: string;
  caption?: string;
  reelUrl: string;
  videoUrl?: string;
  thumbnail?: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY: Partial<Reel> = {
  title: '',
  caption: '',
  reelUrl: '',
  videoUrl: '',
  thumbnail: '',
  isActive: true,
  sortOrder: 0,
};

export default function InstagramReelsAdminPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editReel, setEditReel] = useState<Partial<Reel>>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ msg: string; sev: 'success' | 'error' } | null>(null);
  // Uploaded files take precedence over the URL fields on submit.
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/instagram-reels/admin');
      setReels(data.data || []);
    } catch {
      setSnack({ msg: 'Failed to load reels', sev: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditReel({ ...EMPTY, sortOrder: reels.length });
    setEditingId(null);
    setVideoFile(null);
    setThumbFile(null);
    setDialogOpen(true);
  };

  const openEdit = (r: Reel) => {
    setEditReel({ ...r });
    setEditingId(r.id);
    setVideoFile(null);
    setThumbFile(null);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editReel.reelUrl?.trim()) {
      setSnack({ msg: 'Instagram Reel URL is required', sev: 'error' });
      return;
    }
    setSaving(true);
    try {
      // Multipart only when a file is attached; otherwise keep the plain JSON
      // path so nothing about the existing URL-only flow changes.
      const hasFiles = !!(videoFile || thumbFile);
      let payload: any = editReel;
      let config: any = undefined;

      if (hasFiles) {
        const fd = new FormData();
        fd.append('reelUrl', editReel.reelUrl || '');
        fd.append('title', editReel.title || '');
        fd.append('caption', editReel.caption || '');
        fd.append('isActive', String(editReel.isActive !== false));
        fd.append('sortOrder', String(editReel.sortOrder ?? 0));
        if (!videoFile && editReel.videoUrl) fd.append('videoUrl', editReel.videoUrl);
        if (!thumbFile && editReel.thumbnail) fd.append('thumbnail', editReel.thumbnail);
        if (videoFile) fd.append('video', videoFile);
        if (thumbFile) fd.append('thumbnail', thumbFile);
        payload = fd;
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      }

      if (editingId) {
        await api.put(`/instagram-reels/${editingId}`, payload, config);
        setSnack({ msg: 'Reel updated', sev: 'success' });
      } else {
        await api.post('/instagram-reels', payload, config);
        setSnack({ msg: 'Reel added', sev: 'success' });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      // The generic message used to hide the real cause (bad URL, file too
      // large, wrong type), which made failures impossible to act on.
      setSnack({ msg: e?.response?.data?.message || 'Failed to save reel', sev: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/instagram-reels/${deleteId}`);
      setSnack({ msg: 'Reel deleted', sev: 'success' });
      setDeleteId(null);
      load();
    } catch {
      setSnack({ msg: 'Failed to delete', sev: 'error' });
    }
  };

  const toggleActive = async (reel: Reel) => {
    try {
      await api.put(`/instagram-reels/${reel.id}`, { isActive: !reel.isActive });
      setReels(prev => prev.map(r => r.id === reel.id ? { ...r, isActive: !r.isActive } : r));
    } catch {
      setSnack({ msg: 'Failed to update status', sev: 'error' });
    }
  };


  const field = (key: keyof Reel) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditReel(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            borderRadius: '10px', p: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Instagram sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>Instagram Reels</Typography>
            <Typography variant="caption" color="text.secondary">
              Manage auto-playing reels shown on the homepage
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, borderRadius: 2, fontWeight: 700 }}
        >
          Add Reel
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Reels', value: reels.length, color: '#1a1a1a' },
          { label: 'Active', value: reels.filter(r => r.isActive).length, color: '#2e7d32' },
          { label: 'With Video', value: reels.filter(r => r.videoUrl).length, color: '#1565c0' },
          { label: 'Embed Only', value: reels.filter(r => !r.videoUrl).length, color: '#e65100' },
        ].map(stat => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Card sx={{ p: 2, borderRadius: 2, borderLeft: `4px solid ${stat.color}` }}>
              <Typography variant="h4" fontWeight={900} sx={{ color: stat.color }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Info banner */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Upload a video or a poster image.</strong> Instagram's embed now shows a login wall to anyone not signed in to Instagram in that browser, so a reel with only a URL renders as an empty box for most visitors. A <strong>video</strong> autoplays silently; a <strong>poster image</strong> shows the frame and links to the reel. Add this section to your homepage via <strong>Homepage Builder → Add Section → Instagram Reels</strong>.
      </Alert>

      {/* Table */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : reels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Instagram sx={{ fontSize: 56, color: '#ddd', mb: 2 }} />
            <Typography color="text.secondary" fontWeight={600}>No reels yet</Typography>
            <Typography variant="caption" color="text.secondary">Click "Add Reel" to get started</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Preview</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Title / Caption</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Mode</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reels.map((reel, i) => {
                const sc = extractShortcode(reel.reelUrl);
                return (
                  <TableRow key={reel.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DragIndicator sx={{ color: '#ccc', fontSize: 18, cursor: 'grab' }} />
                        <Typography variant="caption" color="text.secondary">{i + 1}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{
                        width: 52, height: 88,
                        borderRadius: '8px', overflow: 'hidden',
                        bgcolor: '#111', position: 'relative',
                        flexShrink: 0,
                      }}>
                        {reel.thumbnail ? (
                          <Box
                            component="img"
                            src={reel.thumbnail}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : sc ? (
                          <Box sx={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Instagram sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }} />
                          </Box>
                        ) : null}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
                        {reel.title || <span style={{ color: '#aaa', fontStyle: 'italic', fontWeight: 400 }}>No title</span>}
                      </Typography>
                      {reel.caption && (
                        <Typography variant="caption" color="text.secondary" sx={{
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {reel.caption}
                        </Typography>
                      )}
                      <Box
                        component="a"
                        href={reel.reelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, color: '#c9a84c', fontSize: '0.65rem', mt: 0.5, textDecoration: 'none' }}
                      >
                        View reel <OpenInNew sx={{ fontSize: 10 }} />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={reel.videoUrl ? <VideoLibrary sx={{ fontSize: '14px !important' }} /> : <Instagram sx={{ fontSize: '14px !important' }} />}
                        label={reel.videoUrl ? 'Auto-play Video' : 'Instagram Embed'}
                        size="small"
                        sx={{
                          bgcolor: reel.videoUrl ? 'rgba(21,101,192,0.1)' : 'rgba(220,39,67,0.08)',
                          color: reel.videoUrl ? '#1565c0' : '#dc2743',
                          fontWeight: 700, fontSize: '0.65rem',
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Switch
                        size="small"
                        checked={reel.isActive}
                        onChange={() => toggleActive(reel)}
                        sx={{ '& .MuiSwitch-track': { bgcolor: reel.isActive ? '#2e7d32' : undefined } }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(reel)} sx={{ color: '#1565c0' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(reel.id)} sx={{ color: '#d32f2f' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            borderRadius: '8px', p: 0.75,
            display: 'flex',
          }}>
            <Instagram sx={{ color: 'white', fontSize: 18 }} />
          </Box>
          {editingId ? 'Edit Reel' : 'Add Instagram Reel'}
        </DialogTitle>

        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Instagram Reel URL */}
          <TextField
            label="Instagram Reel URL *"
            placeholder="https://www.instagram.com/reel/ABC123/"
            value={editReel.reelUrl || ''}
            onChange={field('reelUrl')}
            fullWidth size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><LinkIcon sx={{ fontSize: 16, color: '#dc2743' }} /></InputAdornment>,
            }}
            // Tell the admin immediately when a URL will not embed, instead of
            // letting them save a reel that silently renders nothing.
            error={!!editReel.reelUrl?.trim() && !extractShortcode(editReel.reelUrl)}
            helperText={
              editReel.reelUrl?.trim() && !extractShortcode(editReel.reelUrl)
                ? 'That does not look like an Instagram reel or post link. Use Share → Copy link on the reel.'
                : 'Paste the reel link (Share → Copy link). /reel/, /reels/ and share links all work.'
            }
          />

          {/* Title */}
          <TextField
            label="Title (optional)"
            placeholder="e.g. Summer Collection 2025"
            value={editReel.title || ''}
            onChange={field('title')}
            fullWidth size="small"
          />

          {/* Caption */}
          <TextField
            label="Caption (optional)"
            placeholder="Short description shown on hover"
            value={editReel.caption || ''}
            onChange={field('caption')}
            fullWidth size="small"
            multiline rows={2}
          />

          {/* Direct Video URL */}
          <Box>
            <TextField
              label="Direct Video URL (for Auto-play)"
              placeholder="https://cdn.example.com/video.mp4"
              value={editReel.videoUrl || ''}
              onChange={field('videoUrl')}
              fullWidth size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><VideoLibrary sx={{ fontSize: 16, color: '#1565c0' }} /></InputAdornment>,
              }}
              helperText="Or upload a file below. Autoplays silently on the homepage."
            />
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<VideoLibrary />}
              sx={{ mt: 1, borderColor: '#ccc', color: 'text.primary' }}
            >
              {videoFile ? `${videoFile.name.slice(0, 28)} (${(videoFile.size / 1048576).toFixed(1)} MB)` : 'Upload video file'}
              <input
                hidden
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </Button>
            {videoFile && (
              <Button size="small" onClick={() => setVideoFile(null)} sx={{ mt: 1, ml: 1, color: '#d32f2f' }}>
                Remove
              </Button>
            )}
          </Box>

          {/* Thumbnail */}
          <TextField
            label="Thumbnail Image URL (optional)"
            placeholder="https://cdn.example.com/thumb.jpg"
            value={editReel.thumbnail || ''}
            onChange={field('thumbnail')}
            fullWidth size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><ImageIcon sx={{ fontSize: 16, color: '#555' }} /></InputAdornment>,
            }}
            helperText="Shown while the video loads, and instead of the Instagram embed when no video is set. Minimum 720px wide, vertical 9:16 — a screenshot of the reel at full size works well."
          />
          <Box sx={{ mt: -1 }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<ImageIcon />}
              sx={{ borderColor: '#ccc', color: 'text.primary' }}
            >
              {thumbFile ? `${thumbFile.name.slice(0, 28)}` : 'Upload poster image'}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setThumbFile(f);
                  if (!f) return;
                  // Read the dimensions locally so an undersized poster is
                  // caught instantly rather than after a failed upload.
                  const img = new window.Image();
                  img.onload = () => {
                    if (img.width < 720) {
                      setSnack({
                        msg: `Poster is only ${img.width}x${img.height}px. It needs to be at least 720px wide or it will look blurry.`,
                        sev: 'error',
                      });
                      setThumbFile(null);
                    } else if (img.height / img.width < 1.2) {
                      setSnack({
                        msg: `Poster is ${img.width}x${img.height}px. Reels are vertical (9:16) — a landscape image will be cropped heavily.`,
                        sev: 'error',
                      });
                    }
                    URL.revokeObjectURL(img.src);
                  };
                  img.src = URL.createObjectURL(f);
                }}
              />
            </Button>
            {thumbFile && (
              <Button size="small" onClick={() => setThumbFile(null)} sx={{ ml: 1, color: '#d32f2f' }}>
                Remove
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Sort Order"
              type="number"
              value={editReel.sortOrder ?? 0}
              onChange={(e) => setEditReel(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
              size="small" sx={{ width: 120 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editReel.isActive !== false}
                  onChange={(e) => setEditReel(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label={<Typography variant="body2" fontWeight={600}>Active</Typography>}
            />
          </Box>

          {/* Live preview */}
          {editReel.reelUrl && extractShortcode(editReel.reelUrl) && !editReel.videoUrl && (
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 1, color: '#555' }}>
                EMBED PREVIEW
              </Typography>
              <Box sx={{ borderRadius: '12px', overflow: 'hidden', width: 160, height: 285, border: '1px solid #eee' }}>
                <iframe
                  src={buildInstagramEmbedUrl(editReel.reelUrl) || ''}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  scrolling="no"
                  loading="lazy"
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderColor: '#ddd', color: '#555' }}>
            Cancel
          </Button>
          <Button
            onClick={save}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, fontWeight: 700, minWidth: 100 }}
          >
            {saving ? <CircularProgress size={18} sx={{ color: 'white' }} /> : editingId ? 'Save Changes' : 'Add Reel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Delete Reel?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This reel will be removed from the homepage permanently.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderColor: '#ddd', color: '#555' }}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack?.sev} onClose={() => setSnack(null)} sx={{ borderRadius: 2 }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
