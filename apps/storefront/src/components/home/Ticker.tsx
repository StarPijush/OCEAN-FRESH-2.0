const fish = [
  'Rohu','Katla','Pomfret','King Fish','Tiger Prawns','Live Crab',
  'Hilsa','Bombil','Rawas','Rohu','Katla','Pomfret','King Fish',
  'Tiger Prawns','Live Crab','Hilsa','Bombil','Rawas'
];

export function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">
        {fish.map((name, i) => (
          <span key={i}>{name}</span>
        ))}
      </div>
    </div>
  );
}
