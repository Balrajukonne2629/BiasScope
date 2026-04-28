import { useState } from 'react';

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getRbiStatusClass(value) {
  if (value >= 80) {
    return 'green';
  }
  if (value >= 60) {
    return 'yellow';
  }
  return 'red';
}

function getDirStatusClass(value) {
  if (value >= 0.8) {
    return 'green';
  }
  if (value >= 0.6) {
    return 'yellow';
  }
  return 'red';
}

function getSrdStatusClass(value) {
  if (value <= 0.05) {
    return 'green';
  }
  if (value <= 0.1) {
    return 'yellow';
  }
  return 'red';
}

function WhatIfSimulator({ result }) {
  const distribution = result?.group_distribution ?? {};
  const groups = Object.keys(distribution);
  const groupA = groups[0] ?? 'Group A';
  const groupB = groups[1] ?? 'Group B';

  const originalRatio = typeof distribution[groupA] === 'number' ? distribution[groupA] : 0.5;
  const [groupARatio, setGroupARatio] = useState(originalRatio);

  const newDist = {
    [groupA]: groupARatio,
    [groupB]: 1 - groupARatio,
  };

  const expected = 1 / 2;
  const maxDeviation = Math.max(
    Math.abs(newDist[groupA] - expected),
    Math.abs(newDist[groupB] - expected),
  );
  const newRBI = roundTo((1 - maxDeviation) * 100, 2);

  const rates = Object.values(result?.hire_rates ?? {}).filter((value) => typeof value === 'number');
  const majorityRate = rates.length > 0 ? Math.max(...rates) : 0;
  const minorityRate = rates.length > 0 ? Math.min(...rates) : 0;
  const dirSafe = majorityRate > 0;
  const newDIR = dirSafe ? roundTo(minorityRate / majorityRate, 3) : 0;
  const newSRD = roundTo(majorityRate - minorityRate, 3);

  const rbiClass = getRbiStatusClass(newRBI);
  const dirClass = dirSafe ? getDirStatusClass(newDIR) : 'yellow';
  const srdClass = getSrdStatusClass(newSRD);

  return (
    <section className="card results-panel">
      <h3>What-If Simulator</h3>

      <label htmlFor="group-a-slider">
        Adjust representation of {groupA} in dataset
      </label>
      <input
        id="group-a-slider"
        type="range"
        min="0.1"
        max="0.9"
        step="0.01"
        value={groupARatio}
        onChange={(event) => setGroupARatio(Number(event.target.value))}
      />
      <p>
        {groupA}: {groupARatio.toFixed(2)} | {groupB}: {(1 - groupARatio).toFixed(2)}
      </p>

      <div className="metrics-grid">
        <article className={`card metric-card ${rbiClass}`}>
          <p className="metric-short-label">RBI</p>
          <div className="metric-value">{newRBI.toFixed(2)}</div>
          <p className="metric-label">Dataset Balance</p>
        </article>

        <article className={`card metric-card ${dirClass}`}>
          <p className="metric-short-label">DIR</p>
          <div className="metric-value">{dirSafe ? newDIR.toFixed(3) : 'N/A'}</div>
          <p className="metric-label">Disparate Impact</p>
        </article>

        <article className={`card metric-card ${srdClass}`}>
          <p className="metric-short-label">SRD</p>
          <div className="metric-value">{newSRD.toFixed(3)}</div>
          <p className="metric-label">Selection Gap</p>
        </article>
      </div>

      <p>Hire rates per group are held constant. Only dataset representation is adjusted.</p>

      <button type="button" onClick={() => setGroupARatio(originalRatio)}>
        Reset
      </button>
    </section>
  );
}

export default WhatIfSimulator;
