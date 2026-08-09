import { useNavigate } from 'react-router-dom';

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-noise"></div>
      <div className="hero-grid"></div>
      <div className="hero-content">
        <div className="hero-eyebrow">Local Market &middot; Jhargram &middot; Est. 2018</div>
        <h1 className="hero-title">
          Ocean
          <br />
          <em>Fresh</em>
          <br />
          Delivered.
        </h1>
        <p className="hero-desc">
          Premium seafood sourced every morning from our local market, delivered to your door within
          hours.
        </p>
        <div className="hero-actions">
          <button className="btn btn-dark" onClick={() => navigate('/products')}>
            Shop Now
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/order')}>
            View Order
          </button>
        </div>
      </div>
      <div className="hero-scroll">
        <div className="hero-scroll-line"></div>
        <span>Scroll</span>
      </div>
    </section>
  );
}
