import MetricsCards from './dashboard/MetricsCards';
import ChartsPanel from './dashboard/ChartsPanel';
import RecommendationsPanel from './dashboard/RecommendationsPanel';
import WarningsPanel from './dashboard/WarningsPanel';
import WhatIfSimulator from './dashboard/WhatIfSimulator';

function Dashboard({ result, isLoading, error }) {
  return (
    <section className="results-section">
      <h2>Results</h2>

      {isLoading && <p>Running audit...</p>}
      {error && <p className="error-banner">{error}</p>}

      {result ? (
        <div className="results-stack">
          {result.overall_status ? (
            <div className="overall-status-banner">
              <strong>{result.overall_status}</strong>
              <p>{result.top_issue}</p>
            </div>
          ) : null}
          <MetricsCards result={result} />
          <ChartsPanel result={result} />
          <WarningsPanel warnings={result.warnings} />
          <RecommendationsPanel recommendations={result.recommendations} />
          <WhatIfSimulator result={result} />
          {result.processing_time_ms ? (
            <p className="processing-time">
              Audit completed in {result.processing_time_ms}ms · {result.total_rows} rows analysed
            </p>
          ) : null}
        </div>
      ) : (
        !isLoading && <p>No audit result yet.</p>
      )}
    </section>
  );
}

export default Dashboard;
