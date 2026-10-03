'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSwipeNav } from '@/hooks/use-swipe-nav';
import { useWardrobePreferences } from './wardrobe-preferences';

const SWIPE_ROUTES = ["/", "/favorites", "/customize"];

export default function AppTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { motion } = useWardrobePreferences();
  const { dragOffset, dragOpacity, canSwipe } = useSwipeNav({
    routes: SWIPE_ROUTES,
    enabled: motion && !reducedMotionPreference() && SWIPE_ROUTES.some((r) => pathname.startsWith(r)),
  });

  const [reducedMotion, setReducedMotion] = useState(false);
  const [prevIndex, setPrevIndex] = useState(-1);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const currentIndex = SWIPE_ROUTES.findIndex(
    (r) => pathname === r || (r !== SWIPE_ROUTES[0] && pathname.startsWith(`${r}/`)),
  );
  const direction = currentIndex >= 0 && prevIndex >= 0
    ? currentIndex > prevIndex ? 1 : currentIndex < prevIndex ? -1 : 0 : 0;

  useEffect(() => { setPrevIndex(currentIndex); }, [currentIndex]);

  const transitionStyle: React.CSSProperties = {
    transform: canSwipe && dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
    opacity: canSwipe && dragOpacity < 1 ? dragOpacity : undefined,
    transition: dragOffset !== 0 ? 'none' : 'opacity 0.38s cubic-bezier(0.22,1,0.36,1)',
  };

  const enterClass = motion && !reducedMotion && currentIndex >= 0 && direction !== 0
    ? direction > 0 ? 'outfitweather-enter-right' : 'outfitweather-enter-left' : '';

  return (
    <div key={pathname} className={`w-full ${enterClass}`} style={transitionStyle}>
      {children}
    </div>
  );
}

function reducedMotionPreference() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
