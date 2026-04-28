function getStrengthClass(strength) {
  if (strength === 'High') {
    return 'red';
  }

  if (strength === 'Moderate') {
    return 'yellow';
  }

  return 'green';
}

function RecommendationsPanel({ recommendations = [] }) {
  return (
    <section className="card results-panel">
      <h3>Recommendations</h3>

      {recommendations.length === 0 ? (
        <p>No recommendations returned.</p>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((item, index) => {
            const strength = item?.strength || 'Info';
            const strengthClass = getStrengthClass(item?.strength);

            return (
              <article key={`${item?.issue || 'rec'}-${index}`} className="card recommendation-card">
                <h4 className="recommendation-title">{item?.issue || 'Recommendation'}</h4>
                <p className="recommendation-message">{item?.message || '-'}</p>
                <span className={`strength-badge ${strengthClass}`}>
                  Strength: {strength}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecommendationsPanel;
