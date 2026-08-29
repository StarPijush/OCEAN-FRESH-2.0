import './FeaturedCards.css';

import { useCallback, useEffect, useState } from 'react';

import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { productService, type ProductVM } from '../../services/index.js';
import { DepthCarousel } from './DepthCarousel.js';

export function FeaturedCards() {
  const [featured, setFeatured] = useState<ProductVM[]>([]);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    productService.getFeatured(6).then(setFeatured);
  }, []);

  const renderCard = useCallback(
    (item: { image: string; alt?: string }, index: number, isActive: boolean) => {
      const p = featured[index];
      if (!p) return null;
      const hasPhoto = p.image && !p.image.startsWith('data:image/svg');
      return (
        <div className="editorial-card" data-active={isActive}>
          <div className="editorial-card__media">
            {hasPhoto ? (
              <img src={p.image ?? ''} alt={p.name} className="editorial-card__img" />
            ) : (
              <div className="editorial-card__img editorial-card__img--emoji">{p.emoji}</div>
            )}
          </div>
        </div>
      );
    },
    [featured],
  );

  return (
    <section className="section section-alt featured-cards-root">
      <div className="section-eyebrow reveal">Featured Selection</div>
      <h2 className="section-title-lg reveal">
        Today&apos;s <em style={{ fontStyle: 'italic' }}>Finest</em>
      </h2>
      <div className="section-rule reveal"></div>
      <DepthCarousel
        items={featured.map((p) => ({ image: p.image ?? '', alt: p.name }))}
        cardWidth={isMobile ? 240 : 300}
        cardHeight={isMobile ? 300 : 400}
        radius={16}
        depth={isMobile ? 80 : 120}
        spread={isMobile ? 14 : 20}
        tilt={0}
        perspective={1200}
        visibleCards={2.5}
        falloff={0.15}
        blur={3}
        duration={600}
        autoplay={true}
        autoplayDelay={4000}
        loop={true}
        showControls={true}
        showIndicators={true}
        renderCard={renderCard}
        isMobile={isMobile}
      />
      <div className="section-action reveal">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => (window.location.href = '/products')}
        >
          See All Products &rarr;
        </button>
      </div>
    </section>
  );
}
