// OceanFresh Admin — Reference-aligned motion tokens

export const motion = {
  // Easing curves (from reference: cubic-bezier(0.16,1,0.3,1))
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

  // Durations
  instant: '50ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '600ms',

  // Specific transitions
  fade: 'opacity 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  fadeIn: 'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  fadeOut: 'opacity 150ms cubic-bezier(0.4, 0, 1, 1)',
  slideUp:
    'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  slideDown:
    'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  slideLeft: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  slideRight: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
  scale: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  scaleIn:
    'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  scaleOut: 'transform 150ms cubic-bezier(0.4, 0, 1, 1), opacity 150ms cubic-bezier(0.4, 0, 1, 1)',
  height: 'height 300ms cubic-bezier(0.16, 1, 0.3, 1)',
  width: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  color:
    'color 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms cubic-bezier(0.16, 1, 0.3, 1), border-color 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  shadow: 'box-shadow 200ms cubic-bezier(0.16, 1, 0.3, 1)',
  border: 'border-color 150ms cubic-bezier(0.16, 1, 0.3, 1)',

  // Animation keyframes
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  spin: 'spin 1s linear infinite',
  shimmer: 'shimmer 1.5s ease-in-out infinite',
  bounce: 'bounce 1s infinite',

  // Reduced motion
  reducedMotion: '0.01ms',
} as const;

export type MotionToken = keyof typeof motion;
