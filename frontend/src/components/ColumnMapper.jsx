function ColumnMapper({ columns, mapping, onMappingChange, disabled }) {
  const handleSingleChange = (field) => (event) => {
    onMappingChange({
      ...mapping,
      [field]: event.target.value,
    });
  };

  const handleFeaturesChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
    onMappingChange({
      ...mapping,
      features: selected,
    });
  };

  return (
    <section>
      <h2>2. Column Mapper</h2>

      {disabled ? (
        <p>Upload a CSV to detect available columns.</p>
      ) : (
        <>
          <div>
            <label htmlFor="gender-column">Gender column:</label>
            <select
              id="gender-column"
              value={mapping.gender}
              onChange={handleSingleChange('gender')}
            >
              <option value="">Select column</option>
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="outcome-column">Outcome column:</label>
            <select
              id="outcome-column"
              value={mapping.outcome}
              onChange={handleSingleChange('outcome')}
            >
              <option value="">Select column</option>
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feature-columns">Feature columns (optional):</label>
            <select
              id="feature-columns"
              multiple
              value={mapping.features}
              onChange={handleFeaturesChange}
              size={Math.min(6, Math.max(columns.length, 3))}
            >
              {columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </section>
  );
}

export default ColumnMapper;
