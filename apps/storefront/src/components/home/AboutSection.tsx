export function AboutSection() {
  return (
    <section id="about" className="section about-root" aria-labelledby="about-heading">
      <div className="section-eyebrow reveal">Our Story</div>
      <h2 id="about-heading" className="section-title-lg reveal">
        Fresh from Jhargram,
        <br />
        <em>every morning.</em>
      </h2>
      <div className="section-rule reveal" aria-hidden="true"></div>
      <p className="about-body reveal">
        OceanFresh began in 2018 with a simple observation: the best catch is at the market before
        sunrise, but getting it home fresh, handled cleanly and weighed honestly, was not always
        easy. We set out to close that gap — sourcing directly from the local market each morning,
        keeping the catch chilled, and delivering within hours.
      </p>
      <p className="about-body reveal">
        We buy early, handle chilled, weigh on calibrated scales, and deliver in 2–3 hours across
        our service areas in Jhargram. No stale stock. What you order is what you receive.
      </p>
      <div className="about-mission reveal" role="note" aria-label="Our purpose">
        <div className="about-mission-label">Our purpose</div>
        <p className="about-mission-text">
          To make fresh, hygienically handled seafood a reliable daily option for families in
          Jhargram.
        </p>
      </div>
    </section>
  );
}
