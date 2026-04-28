function WarningsPanel({ warnings = [] }) {
  if (!warnings.length) {
    return null;
  }

  return (
    <section className="card results-panel yellow warning-box">
      <h3>Warnings</h3>
      <ul className="warnings-list">
        {warnings.map((warning, index) => (
          <li key={`${warning?.field || 'warning'}-${index}`}>
            {warning?.message || '-'}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default WarningsPanel;
