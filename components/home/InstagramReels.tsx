'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import { Instagram, PlayArrow, VolumeOff, VolumeUp, OpenInNew } from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface InstagramReel {
  id: string;
  title?: string | null;
  caption?: string | null;
  reelUrl: string;
  videoUrl?: string | null;
  thumbnail?: string | null;
}

interface Props {
  reels: InstagramReel[];
  sectionTitle?: string;
}

function extractShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

// ── Individual reel card ───────────────────────────────────────────
interface ReelCardProps {
  reel: InstagramReel;
  index: number;
  onVideoRef: (id: string, el: HTMLVideoElement | null) => void;
}

function ReelCard({ reel, index, onVideoRef }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const shortcode = extractShortcode(reel.reelUrl);
  const embedSrc = shortcode
    ? `https://www.instagram.com/reel/${shortcode}/embed/?autoplay=1&cr=1`
    : null;

  // Register/unregister this video element with the parent observer
  useEffect(() => {
    if (!reel.videoUrl) return;
    const el = videoRef.current;
    onVideoRef(reel.id, el);
    return () => onVideoRef(reel.id, null);
  }, [reel.id, reel.videoUrl, onVideoRef]);

  // Listen for custom play/pause events dispatched by the parent observer
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const handlePlay = () => {
      el.play().then(() => setPlaying(true)).catch(() => {});
    };
    const handlePause = () => {
      el.pause();
      setPlaying(false);
    };

    el.addEventListener('reel:play', handlePlay);
    el.addEventListener('reel:pause', handlePause);
    return () => {
      el.removeEventListener('reel:play', handlePlay);
      el.removeEventListener('reel:pause', handlePause);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 4) * 0.08, duration: 0.45 }}
      style={{ flexShrink: 0 }}
    >
      <Box
        sx={{
          width: { xs: 180, sm: 210, md: 240 },
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          aspectRatio: '9 / 16',
          bgcolor: '#111',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          '&:hover .reel-overlay': { opacity: 1 },
          '&:hover .reel-scale': { transform: 'scale(1.03)' },
          transition: 'box-shadow 0.3s',
          '&:hover': { boxShadow: '0 16px 48px rgba(0,0,0,0.28)' },
        }}
      >
        {reel.videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={reel.videoUrl}
              className="reel-scale"
              poster={reel.thumbnail || undefined}
              muted={muted}
              loop
              playsInline
              preload="none"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
                transition: 'transform 0.4s ease',
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
              sx={{
                position: 'absolute', bottom: 52, right: 8,
                bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
                width: 28, height: 28,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
              }}
            >
              {muted ? <VolumeOff sx={{ fontSize: 14 }} /> : <VolumeUp sx={{ fontSize: 14 }} />}
            </IconButton>
            {!playing && (
              <Box sx={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <Box sx={{
                  bgcolor: 'rgba(0,0,0,0.45)', borderRadius: '50%',
                  width: 52, height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PlayArrow sx={{ color: 'white', fontSize: 30 }} />
                </Box>
              </Box>
            )}
          </>
        ) : embedSrc ? (
          <iframe
            src={embedSrc}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            scrolling="no"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', bgcolor: '#1a1a1a' }} />
        )}

        {/* Gradient overlay */}
        <Box
          className="reel-overlay"
          sx={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
            opacity: reel.videoUrl ? 1 : 0,
            transition: 'opacity 0.3s', pointerEvents: 'none',
          }}
        />

        {/* Instagram badge */}
        <Box sx={{
          position: 'absolute', top: 10, right: 10,
          bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
          width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Instagram sx={{ fontSize: 16, color: 'white' }} />
        </Box>

        {/* Bottom meta */}
        <Box sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0, p: 1.5,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        }}>
          {reel.title && (
            <Typography sx={{
              color: 'white', fontWeight: 700, fontSize: '0.72rem', lineHeight: 1.3, mb: 0.4,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {reel.title}
            </Typography>
          )}
          <Box
            component="a"
            href={reel.reelUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.4,
              color: '#c9a84c', fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
              '&:hover': { color: 'white' },
            }}
          >
            View on Instagram
            <OpenInNew sx={{ fontSize: 10 }} />
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

// ── Parent: single shared IntersectionObserver, max 1 playing ─────
export default function InstagramReels({ reels, sectionTitle }: Props) {
  // Map of reel id → video element
  const videoMapRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  // Currently playing video element
  const currentlyPlayingRef = useRef<HTMLVideoElement | null>(null);


  // Single IntersectionObserver — created once, cards observe/unobserve themselves
  const obsRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    obsRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            if (currentlyPlayingRef.current && currentlyPlayingRef.current !== el) {
              currentlyPlayingRef.current.dispatchEvent(new Event('reel:pause'));
            }
            currentlyPlayingRef.current = el;
            el.dispatchEvent(new Event('reel:play'));
          } else {
            if (currentlyPlayingRef.current === el) {
              el.dispatchEvent(new Event('reel:pause'));
              currentlyPlayingRef.current = null;
            }
          }
        }
      },
      { threshold: 0.6 }
    );
    return () => obsRef.current?.disconnect();
  }, []);

  // Expose observer to cards via callback
  const handleVideoRef = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoMapRef.current.set(id, el);
      obsRef.current?.observe(el);
    } else {
      const prev = videoMapRef.current.get(id);
      if (prev) {
        obsRef.current?.unobserve(prev);
        videoMapRef.current.delete(id);
      }
    }
  }, []);

  if (!reels || reels.length === 0) return null;

  return (
    <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fafafa', overflow: 'hidden' }}>
      <Container maxWidth="xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: { xs: 3, md: 5 }, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{
                  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  borderRadius: '8px', p: 0.5,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Instagram sx={{ color: 'white', fontSize: 16 }} />
                </Box>
                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a84c' }}>
                  Instagram
                </Typography>
              </Box>
              <Typography variant="h2" sx={{
                fontFamily: 'var(--font-playfair)', fontWeight: 700,
                fontSize: { xs: '1.7rem', sm: '2.3rem', md: '2.8rem' },
                color: '#111', letterSpacing: '-0.02em', lineHeight: 1.05,
              }}>
                {sectionTitle || 'Reels & Looks'}
              </Typography>
            </Box>
            <Box
              component="a"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.75,
                px: 2, py: 1, border: '1px solid #ddd', borderRadius: '24px',
                color: '#555', fontSize: '0.72rem', fontWeight: 700,
                textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#c9a84c', color: '#c9a84c', bgcolor: 'rgba(201,168,76,0.04)' },
              }}
            >
              <Instagram sx={{ fontSize: 16 }} />
              Follow Us
            </Box>
          </Box>
        </motion.div>

        {/* Horizontal scroll strip */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, md: 2 },
            overflowX: 'auto',
            pb: 1,
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 },
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollSnapType: 'x mandatory',
            '& > *': { scrollSnapAlign: 'start' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {reels.map((reel, i) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              index={i}
              onVideoRef={handleVideoRef}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
