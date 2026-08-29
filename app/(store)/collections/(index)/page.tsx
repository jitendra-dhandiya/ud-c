'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box, Container, Typography, Grid, Card, CardMedia, CardContent,
  Skeleton, Chip, Button,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { collectionApi, bannerApi } from '../../../../services/api.service';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isFeatured: boolean;
  _count?: { products: number };
}

function CollectionCardSkeleton() {
  return (
    <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      <Skeleton variant="rectangular" height={260} />
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton width="60%" height={28} />
        <Skeleton width="90%" height={20} sx={{ mt: 1 }} />
        <Skeleton width="40%" height={36} sx={{ mt: 1.5 }} />
      </CardContent>
    </Card>
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * Artwork behind the page title, uploaded in Admin → Banners as a banner of
   * type COLLECTION. Nothing uploaded means the dark block below stays exactly
   * as it is, so this can never leave the page looking unfinished.
   */
  const [heroBanner, setHeroBanner] = useState<any | null>(null);
  /** Whether the banner request has come back yet, either way. */
  const [bannerChecked, setBannerChecked] = useState(false);

  useEffect(() => {
    collectionApi.getAll({ limit: 50, sortBy: 'sortOrder' })
      .then(({ data }) => setCollections((data as any).data || []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));

    bannerApi.getByType('collection')
      .then(({ data }) => setHeroBanner((data as any)?.data?.[0] || null))
      .catch(() => setHeroBanner(null))
      .finally(() => setBannerChecked(true));
  }, []);

  const featured = collections.filter(c => c.isFeatured);
  const rest = collections.filter(c => !c.isFeatured);

  /**
   * An uploaded banner is finished artwork: it arrives with its own wording
   * already set in it. Painting the page's headings over the top of that put
   * two unrelated pieces of type in the same space, each making the other hard
   * to read — the shot that prompted this had "Elevate Your Style" printed in
   * the image with "Curated For You / Explore our carefully curated
   * collections" laid across it.
   *
   * So when a banner image is present the page contributes no wording of its
   * own. Anything the admin typed into that banner's own title and subtitle
   * still shows, because that was written for this artwork and can be removed
   * from the same screen it was entered on.
   *
   * The fallback wording is kept for the case where no banner was ever
   * uploaded, since the alternative there is an empty black band.
   */
  const bannerImage    = heroBanner?.image || '';
  const bannerTitle    = (heroBanner?.title || '').trim();
  const bannerSubtitle = (heroBanner?.subtitle || '').trim();

  const heroTitle    = bannerImage ? bannerTitle
    : bannerChecked ? (bannerTitle || 'Our Collections') : '';
  const heroSubtitle = bannerImage ? bannerSubtitle
    : bannerChecked ? (bannerSubtitle
        || 'Explore our carefully curated collections — each one a story told through fabric, colour, and style.')
    : '';
  const hasHeroText  = !!(heroTitle || heroSubtitle);

  return (
    <Box sx={{ pb: { xs: 8, md: 6 } }}>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: '#1a1a1a',
          color: 'white',
          // With no wording to make room for, the padding has nothing to space
          // and the height has to come from somewhere, or the absolutely
          // positioned artwork collapses to nothing.
          py: hasHeroText ? { xs: 6, md: 9 } : 0,
          // Holds the band open both while the banner is still being fetched
          // and when the artwork carries all the wording itself, so the page
          // does not jump as the request lands.
          ...(hasHeroText ? {} : { height: { xs: 200, sm: 300, md: 380 } }),
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {bannerImage ? (
          <>
            <Box
              component="img"
              src={bannerImage}
              // Decorative only while type sits over it. On its own the artwork
              // is the banner, though its wording lives in the pixels and
              // cannot be read back out here — so the honest alt is still
              // whatever the admin titled it, and nothing when they titled
              // it nothing.
              alt={hasHeroText ? '' : bannerTitle}
              aria-hidden={hasHeroText ? true : undefined}
              sx={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center 40%',
              }}
            />
            {/* The scrim exists to keep type readable over an unknown
                photograph. With no type over it, it was only darkening the
                artwork the shop chose to show. */}
            {hasHeroText && (
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.68) 100%)',
              }} />
            )}
          </>
        ) : (
          <Box
            sx={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
              backgroundSize: '12px 12px',
            }}
          />
        )}
        {hasHeroText && (
          <Container maxWidth="md" sx={{ position: 'relative' }}>
            {heroTitle && (
              <Typography
                variant="h3"
                sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: heroSubtitle ? 2 : 0 }}
              >
                {heroTitle}
              </Typography>
            )}
            {heroSubtitle && (
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 480, mx: 'auto' }}>
                {heroSubtitle}
              </Typography>
            )}
          </Container>
        )}
      </Box>

      <Container maxWidth="xl" sx={{ pt: { xs: 5, md: 7 } }}>

        {/* Featured collections — large cards */}
        {(loading || featured.length > 0) && (
          <Box sx={{ mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="h5"
              sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: 3 }}
            >
              Featured Collections
            </Typography>

            <Grid container spacing={3}>
              {loading
                ? [0, 1].map(i => (
                  <Grid item xs={12} sm={6} key={i}>
                    <CollectionCardSkeleton />
                  </Grid>
                ))
                : featured.map((col, i) => (
                  <Grid item xs={12} sm={6} key={col.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link href={`/collections/${col.slug}`} style={{ textDecoration: 'none' }}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 2, overflow: 'hidden',
                            border: '1px solid', borderColor: 'divider',
                            cursor: 'pointer',
                            '&:hover .col-img': { transform: 'scale(1.05)' },
                            '&:hover .col-arrow': { transform: 'translateX(4px)' },
                          }}
                        >
                          {/* Collection artwork is portrait (sources run
                              0.64-1.04). A fixed 320px height on a card that is
                              ~760px wide at desktop made the frame 2.4:1, so
                              cover had to throw away most of the picture to fill
                              it — "Office wear" survived at 27% of its height,
                              which is why the model had no head. Sizing by ratio
                              instead keeps the frame in proportion to the card
                              at every width. */}
                          <Box sx={{
                            aspectRatio: { xs: '1 / 1', md: '4 / 3' },
                            maxHeight: 560,
                            overflow: 'hidden',
                            position: 'relative',
                          }}>
                            {col.image ? (
                              <CardMedia
                                className="col-img"
                                component="img"
                                image={col.image}
                                alt={col.name}
                                sx={{
                                  width: '100%', height: '100%',
                                  objectFit: 'cover',
                                  // Bias upward: the face sits near the top of a
                                  // full-length shot, so a centred crop removes
                                  // exactly the part worth keeping.
                                  objectPosition: 'center 25%',
                                  transition: 'transform 0.5s ease',
                                }}
                              />
                            ) : (
                              <Box
                                className="col-img"
                                sx={{
                                  height: '100%',
                                  background: 'linear-gradient(135deg, #f5f0eb 0%, #e8ddd4 100%)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'transform 0.5s ease',
                                }}
                              >
                                <Typography
                                  sx={{ fontFamily: 'var(--font-playfair)', fontSize: '3rem', color: '#c9a84c', opacity: 0.4 }}
                                >
                                  {col.name.charAt(0)}
                                </Typography>
                              </Box>
                            )}
                            <Chip
                              label="Featured"
                              size="small"
                              sx={{
                                position: 'absolute', top: 12, left: 12,
                                bgcolor: '#c9a84c', color: 'white', fontWeight: 600,
                                fontSize: '0.65rem', letterSpacing: '0.06em',
                              }}
                            />
                            {col._count?.products != null && (
                              <Chip
                                label={`${col._count.products} items`}
                                size="small"
                                sx={{
                                  position: 'absolute', top: 12, right: 12,
                                  bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
                                  backdropFilter: 'blur(4px)', fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                          <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
                              {/* minWidth:0 is what makes the clamp below work.
                                  A flex item defaults to min-width:auto, so it
                                  refuses to shrink below its content's width —
                                  the text box then grew wider than the card,
                                  its own overflow never triggered, and the
                                  Card's overflow:hidden did the cutting
                                  instead. That is why the description was
                                  sliced mid-word with no ellipsis. */}
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a' }}>
                                  {col.name}
                                </Typography>
                                {col.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mt: 0.5,
                                      // A clamp is a maximum, not a fixed height, so
                                      // desktop still uses only the two lines these
                                      // 128-148 character descriptions need, while a
                                      // narrow card gets a third line before it cuts.
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {col.description}
                                  </Typography>
                                )}
                              </Box>
                              <ArrowForward
                                className="col-arrow"
                                sx={{ color: '#1a1a1a', transition: 'transform 0.2s', flexShrink: 0, mt: 0.5 }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* All other collections — smaller grid */}
        {(loading || rest.length > 0) && (
          <Box>
            {featured.length > 0 && (
              <Typography
                variant="h5"
                sx={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, mb: 3 }}
              >
                All Collections
              </Typography>
            )}

            <Grid container spacing={2.5}>
              {loading
                ? [0, 1, 2, 3, 4, 5].map(i => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <CollectionCardSkeleton />
                  </Grid>
                ))
                : (featured.length === 0 ? collections : rest).map((col, i) => (
                  <Grid item xs={6} sm={4} md={3} key={col.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <Link href={`/collections/${col.slug}`} style={{ textDecoration: 'none' }}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 2, overflow: 'hidden',
                            border: '1px solid', borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                            '&:hover': { boxShadow: 4, transform: 'translateY(-3px)' },
                            '&:hover .col-img': { transform: 'scale(1.06)' },
                          }}
                        >
                          <Box sx={{
                            // Square keeps far more of a portrait source than the
                            // old 200px-tall, ~360px-wide frame did (1.8:1, 42%).
                            aspectRatio: '1 / 1',
                            overflow: 'hidden',
                            position: 'relative',
                          }}>
                            {col.image ? (
                              <CardMedia
                                className="col-img"
                                component="img"
                                image={col.image}
                                alt={col.name}
                                sx={{
                                  width: '100%', height: '100%',
                                  objectFit: 'cover',
                                  // Bias upward: the face sits near the top of a
                                  // full-length shot, so a centred crop removes
                                  // exactly the part worth keeping.
                                  objectPosition: 'center 25%',
                                  transition: 'transform 0.45s ease',
                                }}
                              />
                            ) : (
                              <Box
                                className="col-img"
                                sx={{
                                  height: '100%',
                                  background: 'linear-gradient(135deg, #f5f0eb 0%, #e8ddd4 100%)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'transform 0.45s ease',
                                }}
                              >
                                <Typography
                                  sx={{ fontFamily: 'var(--font-playfair)', fontSize: '2.5rem', color: '#c9a84c', opacity: 0.4 }}
                                >
                                  {col.name.charAt(0)}
                                </Typography>
                              </Box>
                            )}
                            {col._count?.products != null && (
                              <Chip
                                label={`${col._count.products} items`}
                                size="small"
                                sx={{
                                  position: 'absolute', bottom: 8, right: 8,
                                  bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
                                  backdropFilter: 'blur(4px)', fontSize: '0.65rem',
                                }}
                              />
                            )}
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1a1a1a' }} noWrap>
                              {col.name}
                            </Typography>
                            {col.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {col.description}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* Empty state */}
        {!loading && collections.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>No collections yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Check back soon — new collections are on their way.
            </Typography>
            <Button component={Link} href="/shop" variant="outlined" sx={{ borderColor: '#1a1a1a', color: '#1a1a1a' }}>
              Browse All Products
            </Button>
          </Box>
        )}

      </Container>
    </Box>
  );
}
