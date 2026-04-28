function formatMetric(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(3);
  }

  return String(value);
}

function buildMetricCards(result) {
  const rbi = result.rbi_score;
  const dir = result.dir;
  const srd = result.srd;

  let rbiStatus = 'Balanced';
  let rbiClass = 'green';

  if (typeof rbi === 'number' && rbi < 60) {
    rbiStatus = 'High Imbalance';
    rbiClass = 'red';
  } else if (typeof rbi === 'number' && rbi <= 80) {
    rbiStatus = 'Moderate Imbalance';
    rbiClass = 'yellow';
  }

  const dirHighBias = typeof dir === 'number' && dir < 0.8;
  const dirUndefined = result.dir_safe === false;
  const srdSignificantGap = typeof srd === 'number' && srd > 0.1;

  return [
    {
      shortLabel: 'RBI',
      label: 'Dataset Balance',
      value: rbi,
      status: rbiStatus,
      statusClass: rbiClass,
    },
    {
      shortLabel: 'DIR',
      label: 'Disparate Impact',
      value: dirUndefined ? 'N/A' : dir,
      status: dirUndefined
        ? 'Undefined (no positive outcomes)'
        : dirHighBias
          ? 'High Bias'
          : 'Within Threshold',
      statusClass: dirUndefined ? 'yellow' : dirHighBias ? 'red' : 'green',
    },
    {
      shortLabel: 'SRD',
      label: 'Selection Gap',
      value: srd,
      status: srdSignificantGap ? 'Significant Gap' : 'Within Threshold',
      statusClass: srdSignificantGap ? 'red' : 'green',
    },
  ];
}

function MetricsCards({ result }) {
  const cards = buildMetricCards(result);

  return (
    <section className="card results-panel">
      <h3>Metrics</h3>
      <div className="metrics-grid">
        {cards.map((card) => (
          <article key={card.shortLabel} className={`card metric-card ${card.statusClass}`}>
            <p className="metric-short-label">{card.shortLabel}</p>
            <div className="metric-value">{formatMetric(card.value)}</div>
            <p className="metric-label">{card.label}</p>
            <p className="metric-status">{card.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricsCards;
