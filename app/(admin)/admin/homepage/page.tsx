'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Switch, IconButton,
  Chip, Skeleton, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Stack, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { Edit, ExpandMore, ExpandLess, DragIndicator, Add, Delete } from '@mui/icons-material';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent, DragOverlay, DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { homepageApi } from '../../../../services/api.service';
import { toast } from 'react-hot-toast';

const SECTION_LABELS: Record<string, string> = {
  HERO_SLIDER: 'Hero Slider',
  PROMO_STRIP: 'Promo Strip',
  SHOP_LATEST: 'Shop the Latest',
  FEATURED_PRODUCTS: 'Featured Products',
  NEW_ARRIVALS: 'New Arrivals',
  TRENDING_PRODUCTS: 'Trending Products',
  BEST_SELLERS: 'Best Sellers',
  FEATURED_CATEGORIES: 'Shop by Category',
  CATEGORY_SHOWCASE: 'Category Showcase',
  COLLECTION_BANNERS: 'Collection Banners',
  COLLECTION_BANNER: 'Collection Banner',
  COLLECTION_SHOWCASE: 'Collection Showcase',
  PROMOTIONAL_BANNERS: 'Promotional Banners',
  TESTIMONIALS: 'Testimonials',
  NEWSLETTER: 'Newsletter',
  BRAND_LOGOS: 'Brand Logos',
  LOOKBOOK: 'Lookbook',
  BLOG_PREVIEW: 'Blog Preview',
  INSTAGRAM_FEED: 'Instagram Feed',
  CUSTOM_BANNER: 'Custom Banner',
  STORE_LOCATOR: 'Store Locations',
};

// Section types available when adding a new section
const ADDABLE_SECTIONS = [
  { type: 'HERO_SLIDER',          label: 'Hero Slider',           desc: 'Full-width image/video carousel' },
  { type: 'PROMO_STRIP',          label: 'Promo Strip',           desc: 'Trust badges: free shipping, returns, etc.' },
  { type: 'SHOP_LATEST',          label: 'Shop the Latest',       desc: 'Filter chips + product grid with gender tabs' },
  { type: 'FEATURED_CATEGORIES',  label: 'Shop by Category',      desc: 'Bento grid of product categories' },
  { type: 'COLLECTION_BANNERS',   label: 'Collection Banners',    desc: 'Horizontal scroll editorial cards' },
  { type: 'PROMOTIONAL_BANNERS',  label: 'Promotional Banners',   desc: 'Sale / offer banners with CTA' },
  { type: 'FEATURED_PRODUCTS',    label: 'Featured Products',     desc: 'Carousel of featured products' },
  { type: 'NEW_ARRIVALS',         label: 'New Arrivals',          desc: 'Carousel of newest products' },
  { type: 'TRENDING_PRODUCTS',    label: 'Trending Now',          desc: 'Carousel of trending products' },
  { type: 'BEST_SELLERS',         label: 'Best Sellers',          desc: 'Carousel of best-selling products' },
  { type: 'TESTIMONIALS',         label: 'Testimonials',          desc: 'Customer reviews & ratings' },
  { type: 'STORE_LOCATOR',        label: 'Store Locations',       desc: '"Visit Our Stores" section with map links' },
  { type: 'NEWSLETTER',           label: 'Newsletter Signup',     desc: 'Email subscription form' },
];

// ── Sortable card ─────────────────────────────────────────────
function SortableSectionCard({
  section, index, total, onToggle, onMoveUp, onMoveDown, onEdit, onDelete, isDragging,
}: {
  section: any;
  index: number;
  total: number;
  onToggle: (s: any) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
  onEdit: (s: any) => void;
  onDelete: (s: any) => void;
  isDragging?: boolean;
}) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSelf,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSelf ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card elevation={isSelf ? 4 : 0} sx={{
        border: '1px solid',
        borderColor: section.isActive ? 'success.main' : 'divider',
        borderRadius: 2,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
        userSelect: 'none',
      }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>

          {/* Drag handle */}
          <Box
            {...attributes}
            {...listeners}
            sx={{
              display: 'flex', alignItems: 'center', cursor: 'grab',
              color: 'text.disabled', px: 0.5,
              '&:active': { cursor: 'grabbing' },
              '&:hover': { color: 'text.secondary' },
              touchAction: 'none',
            }}
          >
            <DragIndicator fontSize="small" />
          </Box>

          {/* Arrow buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <IconButton size="small" onClick={() => onMoveUp(index)} disabled={index === 0}
              sx={{ p: 0.25 }}>
              <ExpandLess sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton size="small" onClick={() => onMoveDown(index)} disabled={index === total - 1}
              sx={{ p: 0.25 }}>
              <ExpandMore sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Label */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" fontWeight={700}
                sx={{ color: section.isActive ? 'text.primary' : 'text.disabled' }}>
                {section.title || SECTION_LABELS[section.type] || section.type}
              </Typography>
              <Chip label={section.type} size="small"
                sx={{ fontSize: '0.6rem', height: 18 }} />
              {!section.isActive && (
                <Chip label="Hidden" size="small"
                  sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#f5f5f5', color: 'text.disabled' }} />
              )}
            </Box>
            {section.subtitle && (
              <Typography variant="caption" color="text.secondary">{section.subtitle}</Typography>
            )}
          </Box>

          {/* Position + controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <Typography variant="caption" color="text.disabled" sx={{ minWidth: 20, textAlign: 'right' }}>
              #{index + 1}
            </Typography>
            <IconButton size="small" onClick={() => onEdit(section)}>
              <Edit sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(section)}
              sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.50' } }}>
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
            <Switch
              size="small"
              color="success"
              checked={section.isActive}
              onChange={() => onToggle(section)}
            />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Ghost card shown under the cursor while dragging ──────────
function DragGhostCard({ section }: { section: any }) {
  return (
    <Card elevation={6} sx={{
      border: '1px solid', borderColor: 'success.main',
      borderRadius: 2, bgcolor: 'white', opacity: 0.95,
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DragIndicator fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" fontWeight={700}>
          {section.title || SECTION_LABELS[section.type] || section.type}
        </Typography>
        <Chip label={section.type} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState<any>(null);
  const [configStr, setConfigStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Add section dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchSections = useCallback(() => {
    setLoading(true);
    homepageApi.getAllAdmin()
      .then(({ data }) => {
        setSections(((data as any).data || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  // ── Drag handlers ──────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s, sortOrder: i + 1,
    }));
    setSections(reordered);

    try {
      await homepageApi.reorder(reordered.map(s => ({ id: s.id, sortOrder: s.sortOrder })));
      toast.success('Order saved');
    } catch {
      fetchSections();
      toast.error('Reorder failed');
    }
  };

  // ── Arrow move handlers ────────────────────────────────────
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = arrayMove(sections, index, index - 1).map((s, i) => ({
      ...s, sortOrder: i + 1,
    }));
    setSections(reordered);
    try {
      await homepageApi.reorder(reordered.map(s => ({ id: s.id, sortOrder: s.sortOrder })));
      toast.success('Order saved');
    } catch {
      fetchSections();
      toast.error('Reorder failed');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === sections.length - 1) return;
    const reordered = arrayMove(sections, index, index + 1).map((s, i) => ({
      ...s, sortOrder: i + 1,
    }));
    setSections(reordered);
    try {
      await homepageApi.reorder(reordered.map(s => ({ id: s.id, sortOrder: s.sortOrder })));
      toast.success('Order saved');
    } catch {
      fetchSections();
      toast.error('Reorder failed');
    }
  };

  // ── Toggle ─────────────────────────────────────────────────
  const handleToggle = async (section: any) => {
    const next = !section.isActive;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, isActive: next } : s));
    try {
      await homepageApi.updateSection(section.id, { isActive: next });
      toast.success(
        next
          ? `"${SECTION_LABELS[section.type] || section.type}" enabled`
          : `"${SECTION_LABELS[section.type] || section.type}" hidden`,
      );
    } catch {
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, isActive: !next } : s));
      toast.error('Update failed');
    }
  };

  // ── Add section ────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newType) return;
    setAdding(true);
    try {
      const label = SECTION_LABELS[newType] || newType;
      await homepageApi.createSection({
        type: newType,
        title: newTitle || label,
        subtitle: newSubtitle || undefined,
        isActive: true,
        sortOrder: sections.length + 1,
        config: {},
      });
      toast.success(`"${label}" section added`);
      setAddOpen(false);
      setNewType('');
      setNewTitle('');
      setNewSubtitle('');
      fetchSections();
    } catch {
      toast.error('Failed to add section');
    } finally {
      setAdding(false);
    }
  };

  // ── Delete section ──────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await homepageApi.deleteSection(deleteTarget.id);
      toast.success(`"${SECTION_LABELS[deleteTarget.type] || deleteTarget.type}" removed`);
      setDeleteTarget(null);
      fetchSections();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── Edit / save config ─────────────────────────────────────
  const openEdit = (section: any) => {
    setEditSection(section);
    setConfigStr(section.config ? JSON.stringify(section.config, null, 2) : '{}');
  };

  const saveConfig = async () => {
    if (!editSection) return;
    setSaving(true);
    try {
      const config = JSON.parse(configStr);
      await homepageApi.updateSection(editSection.id, {
        title: editSection.title,
        subtitle: editSection.subtitle,
        config,
      });
      toast.success('Section updated');
      fetchSections();
      setEditSection(null);
    } catch (e: any) {
      toast.error(e.message?.includes('JSON') ? 'Invalid JSON config' : (e.message || 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const activeSection = activeId ? sections.find(s => s.id === activeId) : null;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
            Homepage Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag cards to reorder sections, or use the arrow buttons. Toggle the switch to show / hide each section.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddOpen(true)}
          sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' }, borderRadius: 1.5, fontWeight: 700, fontSize: '0.8rem' }}
        >
          Add Section
        </Button>
      </Box>

      {loading ? (
        <Stack spacing={1.5}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} height={72} sx={{ borderRadius: 2 }} />)}
        </Stack>
      ) : sections.length === 0 ? (
        <Typography color="text.secondary">No sections found.</Typography>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <Stack spacing={1.5}>
              {sections.map((section, index) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  total={sections.length}
                  onToggle={handleToggle}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onEdit={openEdit}
                  onDelete={(s) => setDeleteTarget(s)}
                />
              ))}
            </Stack>
          </SortableContext>

          {/* Ghost card rendered under the pointer while dragging */}
          <DragOverlay>
            {activeSection ? <DragGhostCard section={activeSection} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Add Section dialog ──────────────────────────────── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Section</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Section Type</InputLabel>
            <Select
              label="Section Type"
              value={newType}
              onChange={(e) => {
                setNewType(e.target.value);
                setNewTitle(SECTION_LABELS[e.target.value] || '');
              }}
            >
              {ADDABLE_SECTIONS.map((s) => (
                <MenuItem key={s.type} value={s.type}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{s.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Section Title (optional)" size="small" fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            helperText="Leave blank to use the default label"
          />
          <TextField
            label="Subtitle (optional)" size="small" fullWidth
            value={newSubtitle}
            onChange={(e) => setNewSubtitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={!newType || adding}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}
          >
            {adding ? 'Adding...' : 'Add Section'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm dialog ────────────────────────────── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Remove Section?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove the <strong>"{deleteTarget ? (SECTION_LABELS[deleteTarget.type] || deleteTarget.type) : ''}"</strong> section from the homepage.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit section dialog */}
      <Dialog open={!!editSection} onClose={() => setEditSection(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit: {editSection ? (SECTION_LABELS[editSection.type] || editSection.type) : ''}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Section Title" size="small" fullWidth
            value={editSection?.title || ''}
            onChange={e => setEditSection((s: any) => ({ ...s, title: e.target.value }))}
          />
          <TextField
            label="Subtitle" size="small" fullWidth
            value={editSection?.subtitle || ''}
            onChange={e => setEditSection((s: any) => ({ ...s, subtitle: e.target.value }))}
          />
          <TextField
            label="Config (JSON)" multiline rows={8} size="small" fullWidth
            value={configStr}
            onChange={e => setConfigStr(e.target.value)}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
            helperText="Customize section behavior with JSON config"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditSection(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveConfig} disabled={saving}
            sx={{ bgcolor: '#1a1a1a', '&:hover': { bgcolor: '#333' } }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
