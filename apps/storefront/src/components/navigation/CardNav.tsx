import './CardNav.css';

import { gsap } from 'gsap';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCartStore } from '../../services/cart.service.js';
import { CartIcon, ChevronRightIcon } from '../ui/Icons.js';

export interface CardNavLink {
  label: string;
  ariaLabel?: string;
  href?: string;
  external?: boolean;
}

export interface CardNavItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
}

interface CardNavProps {
  items: CardNavItem[];
  className?: string;
  ease?: string;
}

export function CardNav({ items, className = '', ease = 'power3.out' }: CardNavProps) {
  const navigate = useNavigate();
  const count = useCartStore((s) => Object.values(s.items).reduce((a, b) => a + b, 0));

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector<HTMLElement>('.card-nav-content');
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        // force reflow
        void contentEl.offsetHeight;

        const topBar = 56;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        const raw = topBar + contentHeight + padding;
        // cap to viewport to keep cards tappable; content will scroll inside .card-nav-content
        const max = window.innerHeight - 24;
        return Math.min(raw, max);
      }
    }
    return 260;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 56, overflow: 'hidden' });
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(cards, { y: 16, opacity: 0 });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cardsFiltered = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (reduceMotion) {
      const tl = gsap.timeline({ paused: true });
      tl.to(navEl, { height: calculateHeight, duration: 0.01, ease });
      tl.to(cardsFiltered, { y: 0, opacity: 1, duration: 0.01, stagger: 0 }, '-=0.01');
      return tl;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: isMobile ? 0.36 : 0.42,
      ease,
    });

    tl.to(
      cardsFiltered,
      {
        y: 0,
        opacity: 1,
        duration: isMobile ? 0.32 : 0.4,
        ease,
        stagger: isMobile ? 0.06 : 0.08,
      },
      '-=0.12',
    );

    return tl;
  }, [calculateHeight, ease]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [createTimeline, ease, items]);

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
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateHeight, createTimeline, isExpanded]);

  // Escape closes menu
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

  // body scroll lock when expanded (premium drawer feel)
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
      // open synchronously to retain user activation (avoid popup block)
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
    <div className={`card-nav-container ${className}`}>
      <nav
        ref={navRef}
        id="card-nav"
        className={`card-nav ${isExpanded ? 'open' : ''}`}
        aria-label="Primary navigation"
      >
        <div className="card-nav-top">
          <button
            ref={hamburgerRef}
            type="button"
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={isExpanded ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isExpanded}
            aria-controls="card-nav-content"
          >
            <span className="hamburger-line" aria-hidden="true" />
            <span className="hamburger-line" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="logo-container"
            onClick={() => {
              if (isExpanded) {
                // close then go home
                handleNavLink('/');
              } else {
                navigate('/');
              }
            }}
            aria-label="OceanFresh — Go to homepage"
          >
            <span className="of-wordmark" aria-hidden="true">
              OceanFresh
            </span>
            <span className="sr-only">OceanFresh</span>
          </button>

          <button
            type="button"
            className="card-nav-cart-btn"
            onClick={() => {
              if (isExpanded) handleNavLink('/order');
              else navigate('/order');
            }}
            aria-label={
              count > 0 ? `Cart, ${count} items — View order` : 'Cart, empty — View order'
            }
          >
            <CartIcon size={21} aria-hidden="true" />
            <span className={`nav-cart-count ${count > 0 ? 'show' : ''}`} aria-hidden="true">
              {count}
            </span>
          </button>
        </div>

        <div
          id="card-nav-content"
          className="card-nav-content"
          aria-hidden={!isExpanded}
          // inert when collapsed for a11y
          {...(!isExpanded ? ({ inert: true } as unknown as Record<string, unknown>) : {})}
        >
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <button
                    key={`${lnk.label}-${i}`}
                    type="button"
                    className="nav-card-link"
                    onClick={() => lnk.href && handleNavLink(lnk.href, lnk.external)}
                    aria-label={lnk.ariaLabel || lnk.label}
                    tabIndex={isExpanded ? 0 : -1}
                    style={{ color: 'inherit' } as React.CSSProperties}
                  >
                    <span>{lnk.label}</span>
                    <ChevronRightIcon size={14} aria-hidden="true" className="nav-card-link-icon" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
      {/* overlay to close when clicking outside when expanded */}
      <button
        type="button"
        className={`card-nav-overlay ${isExpanded ? 'open' : ''}`}
        aria-label="Close menu"
        aria-hidden={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
        onClick={toggleMenu}
        style={{ border: 'none', padding: 0 }}
      />
    </div>
  );
}

export default CardNav;
