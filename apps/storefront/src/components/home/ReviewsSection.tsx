const reviews = [
  {
    text: '\u201CGreat fish quality and quick delivery. Always on time and very fresh.\u201D',
    author: '\u2014 Raju, Jhargram',
  },
  {
    text: '\u201CLove the variety, and prices are fair. We order every week for the family.\u201D',
    author: '\u2014 Shalini, Binpur',
  },
  {
    text: '\u201CFriendly support via WhatsApp and they handled my location request smoothly.\u201D',
    author: '\u2014 Amit, Gopiballavpur',
  },
];

export function ReviewsSection() {
  return (
    <section className="section" style={{ padding: '60px 24px' }}>
      <div className="section-eyebrow reveal">Customer Reviews</div>
      <h2 className="section-title-lg reveal">What buyers say</h2>
      <div className="review-grid" style={{ marginTop: '24px' }}>
        {reviews.map((r, i) => (
          <div
            className="review-card reveal"
            key={i}
            style={i > 0 ? { transitionDelay: `${i * 0.06}s` } : undefined}
          >
            <p>{r.text}</p>
            <div className="review-author">{r.author}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
