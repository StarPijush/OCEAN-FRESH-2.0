import './FeaturedCards.css';

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { productService, type ProductVM } from '../../services/index.js';
import { DepthCarousel } from './DepthCarousel.js';

export function FeaturedCards() {
  const [featured, setFeatured] = useState<ProductVM[]>([]);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

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
          <div className="editorial-card__info">
            <div className="editorial-card__name">{p.name}</div>
            <div className="editorial-card__price">
              {'\u20B9'}
              {p.price} / {p.unit || 'kg'}
            </div>
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
        cardWidth={isMobile ? 210 : 300}
        cardHeight={isMobile ? 275 : 400}
        radius={16}
        depth={isMobile ? 60 : 150}
        spread={isMobile ? 30 : 34}
        tilt={isMobile ? 3 : 7}
        perspective={1400}
        visibleCards={isMobile ? 3 : 3}
        falloff={isMobile ? 0.14 : 0.12}
        blur={isMobile ? 3 : 4}
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
        <button className="btn btn-ghost btn-see-all" onClick={() => navigate('/products')}>
          See All Products
        </button>
      </div>
    </section>
  );
}
