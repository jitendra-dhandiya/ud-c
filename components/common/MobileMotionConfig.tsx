'use client';
import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';

// On mobile, disable ALL framer-motion animations so they snap to final state
// instantly. This eliminates IntersectionObserver callback bursts during fast
// scroll that block the main thread and cause the page to stick.
export default function MobileMotionConfig({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <MotionConfig reducedMotion={isMobile ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  );
}
