'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Box, IconButton, Badge, Typography,
  Drawer, List, ListItem, ListItemText, InputBase, Container,
  Divider, Avatar, Menu, MenuItem,
  useMediaQuery, useTheme, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import {
  Search, ShoppingBag, FavoriteBorder, PersonOutline,
  Menu as MenuIcon, Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../store';
import { toggleCart } from '../../store/slices/cartSlice';
import { useAuth } from '../../hooks/useAuth';
import { productApi } from '../../services/api.service';

const NAV_LINKS = [
  { label: 'New In', href: '/shop?isNewArrival=true' },
  { label: 'Shop', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Sale', href: '/shop?discount=true' },
  { label: 'Blog', href: '/blog' },
];

interface NavbarProps {
  settings?: Record<string, string>;
}

export default function Navbar({ settings = {} }: NavbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { itemCount } = useAppSelector((s) => s.cart);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const { data } = await productApi.search({ q: searchQuery.trim(), limit: 6 });
        setSearchResults((data as any).data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <>
      {/* Announcement Bar */}
      <Box
        sx={{
          bgcolor: '#1a1a1a',
          py: 0.75,
          textAlign: 'center',
          color: 'white',
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          fontWeight: 500,
        }}
      >
        {settings.announcement_text || 'FREE SHIPPING ON ORDERS ABOVE ₹999'}
      </Box>

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'all 0.3s ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: { xs: 60, md: 72 }, gap: 1 }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ ml: -1 }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box sx={{ flexGrow: { xs: 1, md: 0 }, display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mr: { md: 4 } }}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                {settings.logo_url ? (
                  <Image
                    src={settings.logo_url}
                    alt={settings.site_name || 'Unique Dressup'}
                    width={200}
                    height={64}
                    style={{
                      objectFit: 'contain',
                      height: isMobile ? 38 : 56,
                      width: 'auto',
                      maxWidth: isMobile ? 110 : 180,
                    }}
                    priority
                  />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'var(--font-playfair)',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: '#1a1a1a',
                      fontSize: { xs: '1.1rem', md: '1.5rem' },
                    }}
                  >
                    {settings.site_name || 'Unique Dressup'}
                  </Typography>
                )}
              </Link>
            </Box>

            {/* Desktop nav links */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
                {NAV_LINKS.map((link) => (
                  <Button
                    key={link.href}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      px: 1.5,
                      '&:hover': { color: 'secondary.main', bgcolor: 'transparent' },
                      transition: 'color 0.2s',
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton onClick={() => setSearchOpen(true)} size="small">
                <Search fontSize="small" />
              </IconButton>

              {isAuthenticated ? (
                <>
                  <IconButton component={Link} href="/account/wishlist" size="small">
                    <FavoriteBorder fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    size="small"
                  >
                    <Avatar
                      src={user?.avatar}
                      sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#1a1a1a' }}
                    >
                      {user?.firstName?.charAt(0)}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { mt: 1, minWidth: 180, boxShadow: 3 } }}
                  >
                    <MenuItem component={Link} href="/account/orders" onClick={() => setAnchorEl(null)}>
                      My Orders
                    </MenuItem>
                    <MenuItem component={Link} href="/account/profile" onClick={() => setAnchorEl(null)}>
                      Profile
                    </MenuItem>
                    <MenuItem component={Link} href="/account/addresses" onClick={() => setAnchorEl(null)}>
                      Addresses
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem component={Link} href="/admin/dashboard" onClick={() => setAnchorEl(null)}>
                        Admin Panel
                      </MenuItem>
                    )}
                    <Divider />
                    <MenuItem onClick={() => { setAnchorEl(null); setLogoutConfirm(true); }} sx={{ color: 'error.main' }}>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <IconButton component={Link} href="/login" size="small">
                  <PersonOutline fontSize="small" />
                </IconButton>
              )}

              <IconButton onClick={() => dispatch(toggleCart())} size="small" sx={{ position: 'relative' }}>
                <Badge
                  badgeContent={itemCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#1a1a1a',
                      color: 'white',
                      minWidth: 18,
                      height: 18,
                      fontSize: '0.65rem',
                    },
                  }}
                >
                  <ShoppingBag fontSize="small" />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1400,
              background: 'rgba(0,0,0,0.85)', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
              paddingTop: '15vh',
            }}
            onClick={(e) => e.target === e.currentTarget && closeSearch()}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ width: '100%', maxWidth: 640, padding: '0 24px' }}
            >
              <Typography sx={{ color: 'white', textAlign: 'center', mb: 3, fontFamily: 'var(--font-playfair)', fontSize: '1.5rem' }}>
                Search for anything
              </Typography>
              <form onSubmit={handleSearch}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', bgcolor: 'white',
                  borderRadius: searchResults.length > 0 || searchLoading ? '8px 8px 0 0' : 1,
                  overflow: 'hidden', px: 2, py: 1,
                }}>
                  <Search sx={{ color: '#666', mr: 1 }} />
                  <InputBase
                    autoFocus
                    placeholder="T-shirts, dresses, jeans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, fontSize: '1rem' }}
                  />
                  {searchLoading ? (
                    <CircularProgress size={16} sx={{ color: '#666', mr: 0.5 }} />
                  ) : searchQuery ? (
                    <IconButton size="small" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                      <Close fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>
              </form>

              {/* Search suggestions */}
              {(searchResults.length > 0 || (searchLoading && searchQuery.length >= 2)) && (
                <Box sx={{ bgcolor: 'white', borderRadius: '0 0 8px 8px', overflow: 'hidden', boxShadow: 4 }}>
                  {searchResults.map((p: any) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={closeSearch}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
                        '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background 0.15s',
                        borderTop: '1px solid #f0f0f0',
                        cursor: 'pointer',
                      }}>
                        {p.images?.[0]?.url ? (
                          <Box
                            component="img"
                            src={p.images[0].url}
                            alt={p.name}
                            sx={{ width: 40, height: 48, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }}
                          />
                        ) : (
                          <Box sx={{ width: 40, height: 48, bgcolor: '#f0f0f0', borderRadius: 0.5, flexShrink: 0 }} />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', lineHeight: 1.3 }} noWrap>
                            {p.name}
                          </Typography>
                          {p.category && (
                            <Typography variant="caption" sx={{ color: '#999' }}>{p.category.name}</Typography>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', flexShrink: 0 }}>
                          ₹{p.salePrice || p.basePrice}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                  {searchQuery.trim().length >= 2 && (
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={closeSearch}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <Box sx={{
                        px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderTop: '1px solid #f0f0f0', bgcolor: '#fafafa',
                        '&:hover': { bgcolor: '#f0f0f0' }, cursor: 'pointer',
                      }}>
                        <Search sx={{ fontSize: 14, mr: 0.75, color: '#666' }} />
                        <Typography variant="caption" sx={{ color: '#444', fontWeight: 500 }}>
                          View all results for &quot;{searchQuery}&quot;
                        </Typography>
                      </Box>
                    </Link>
                  )}
                </Box>
              )}
            </motion.div>
            <IconButton
              onClick={closeSearch}
              sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
            >
              <Close />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.site_name || 'Unique Dressup'}
                width={160}
                height={56}
                style={{ objectFit: 'contain', height: 56, width: 'auto' }}
              />
            ) : (
              <Typography variant="h6" sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700 }}>
                {settings.site_name || 'Unique Dressup'}
              </Typography>
            )}
            <IconButton onClick={() => setMobileOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.href} component={Link} href={link.href} onClick={() => setMobileOpen(false)}
                sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem', letterSpacing: '0.04em' }}
                />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {isAuthenticated ? (
              <>
                <ListItem component={Link} href="/account/orders" onClick={() => setMobileOpen(false)}
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <ListItemText primary="My Orders" />
                </ListItem>
                <ListItem component={Link} href="/account/profile" onClick={() => setMobileOpen(false)}
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <ListItemText primary="Profile" />
                </ListItem>
                <ListItem onClick={() => { setMobileOpen(false); setLogoutConfirm(true); }}
                  sx={{ '&:hover': { bgcolor: '#fff5f5' }, cursor: 'pointer' }}>
                  <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error.main', fontWeight: 500, fontSize: '0.9rem' }} />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem component={Link} href="/login" onClick={() => setMobileOpen(false)}
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem component={Link} href="/register" onClick={() => setMobileOpen(false)}
                  sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Logout confirmation */}
      <Dialog open={logoutConfirm} onClose={() => setLogoutConfirm(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setLogoutConfirm(false)} variant="outlined" sx={{ borderColor: '#ccc', color: 'text.primary' }}>
            Cancel
          </Button>
          <Button
            onClick={() => { logout(); setLogoutConfirm(false); }}
            variant="contained"
            sx={{ bgcolor: '#d32f2f', '&:hover': { bgcolor: '#b71c1c' } }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
