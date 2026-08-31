import './AdminNavigation.css';

import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { STOREFRONT_URL } from '../../env';
import { usePendingOrderCount } from '../../hooks/use-orders';
import { ADMIN_NAV_CARDS, isAdminPathActive } from '../../hooks/useAdminNav';
import { Icon } from '../Icon';

function ChevronRightIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function AdminNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: pendingCount = 0 } = usePendingOrderCount();

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 280;
    const isMobile =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector<HTMLElement>('.admin-nav-content');
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;
        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';
        void contentEl.offsetHeight;
        const topBar = 56;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;
        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;
        const raw = topBar + contentHeight + padding;
        const max = window.innerHeight - 24;
        return Math.min(raw, max);
      }
    }
    return 280;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 56, overflow: 'hidden' });
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(cards, { y: 16, opacity: 0 });
    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cardsFiltered = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (reduceMotion) {
      const tl = gsap.timeline({ paused: true });
      tl.to(navEl, { height: calculateHeight, duration: 0.01, ease: 'power3.out' });
      tl.to(cardsFiltered, { y: 0, opacity: 1, duration: 0.01, stagger: 0 }, '-=0.01');
      return tl;
    }
    const isMobile =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 768px)').matches;
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: isMobile ? 0.36 : 0.42, ease: 'power3.out' });
    tl.to(
      cardsFiltered,
      {
        y: 0,
        opacity: 1,
        duration: isMobile ? 0.32 : 0.4,
        ease: 'power3.out',
        stagger: isMobile ? 0.06 : 0.08,
      },
      '-=0.12',
    );
    return tl;
  }, [calculateHeight]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [createTimeline]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateHeight, createTimeline, isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, isHamburgerOpen]);

  useEffect(() => {
    if (!isExpanded) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const handleNavLink = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener');
      const tl = tlRef.current;
      if (tl && isExpanded) {
        setIsHamburgerOpen(false);
        tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
        tl.reverse();
      }
      return;
    }
    const tl = tlRef.current;
    if (tl && isExpanded) {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => {
        setIsExpanded(false);
        navigate(href);
        hamburgerRef.current?.focus();
      });
      tl.reverse();
    } else {
      navigate(href);
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className="admin-nav-container">
      <nav
        ref={navRef}
        className={`admin-nav ${isExpanded ? 'open' : ''}`}
        aria-label="Admin primary navigation"
      >
        <div className="admin-nav-top">
          <button
            ref={hamburgerRef}
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? 'Close admin navigation' : 'Open admin navigation'}
            aria-expanded={isExpanded}
            aria-controls="admin-nav-content"
          >
            <span className="hamburger-line" aria-hidden="true" />
            <span className="hamburger-line" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="logo-container"
            onClick={() => {
              if (isExpanded) handleNavLink('/dashboard');
              else navigate('/dashboard');
            }}
            aria-label="OceanFresh Admin — Go to dashboard"
          >
            <span className="of-wordmark" aria-hidden="true">
              OceanFresh
            </span>
            <span className="sr-only">OceanFresh Admin</span>
          </button>

          <button
            type="button"
            className="admin-nav-action-btn"
            onClick={() => {
              if (isExpanded) handleNavLink('/orders');
              else navigate('/orders');
            }}
            aria-label={
              pendingCount > 0 ? `Orders, ${pendingCount} pending — View orders` : 'Orders'
            }
          >
            <Icon name="receipt-outline" size={22} color="var(--color-text-primary, #f2eee6)" />
            <span
              className={`admin-nav-badge ${pendingCount > 0 ? 'show' : ''}`}
              aria-hidden="true"
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          </button>
        </div>

        <div
          id="admin-nav-content"
          className="admin-nav-content"
          aria-hidden={!isExpanded}
          {...(!isExpanded ? ({ inert: true } as unknown as Record<string, unknown>) : {})}
        >
          {ADMIN_NAV_CARDS.map((card, idx) => (
            <div
              key={card.label}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: card.bgColor, color: card.textColor }}
            >
              <div className="nav-card-label">{card.label}</div>
              <div className="nav-card-links">
                {card.links.map((lnk) => {
                  const href = lnk.external && lnk.href === '/' ? STOREFRONT_URL || '/' : lnk.href;
                  const active = !lnk.external && isAdminPathActive(lnk.href, location.pathname);
                  return (
                    <button
                      key={lnk.label}
                      type="button"
                      className={`nav-card-link ${active ? 'active' : ''}`}
                      onClick={() => handleNavLink(href, lnk.external)}
                      aria-label={lnk.ariaLabel || lnk.label}
                      tabIndex={isExpanded ? 0 : -1}
                      aria-current={active ? 'page' : undefined}
                      style={{ color: 'inherit' } as React.CSSProperties}
                    >
                      <span>{lnk.label}</span>
                      <ChevronRightIcon size={14} className="nav-card-link-icon" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
      <button
        type="button"
        className={`admin-nav-overlay ${isExpanded ? 'open' : ''}`}
        aria-label="Close admin navigation"
        aria-hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
        onClick={toggleMenu}
        style={{ border: 'none', padding: 0 }}
      />
    </div>
  );
}
