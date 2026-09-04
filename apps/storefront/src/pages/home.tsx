import { useEffect } from 'react';

import { AboutSection } from '../components/home/AboutSection.js';
import { CTASection } from '../components/home/CTASection.js';
import { DeliveryChecker } from '../components/home/DeliveryChecker.js';
import { FeaturedCards } from '../components/home/FeaturedCards.js';
import { FreshCatch } from '../components/home/FreshCatch.js';
import { Hero } from '../components/home/Hero.js';
import { Ticker } from '../components/home/Ticker.js';
import { WhyUs } from '../components/home/WhyUs.js';
import { Footer } from '../components/layout/Footer.js';
import { useReveal } from '../hooks/useReveal.js';

export function HomePage() {
  useReveal();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="page-home" className="page active">
      <Hero />
      <Ticker />
      <FeaturedCards />
      <FreshCatch />
      <WhyUs />
      <AboutSection />
      <DeliveryChecker />
      <CTASection />
      <Footer />
    </div>
  );
}
