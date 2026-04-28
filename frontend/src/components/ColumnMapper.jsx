function ColumnMapper({ columns, mapping, onMappingChange, disabled }) {
  const selectedGender = mapping.gender || '';
  const selectedOutcome = mapping.outcome || '';
  const featureCol = mapping.features[0] || '';
  const filteredColumns = columns.filter(
    (column) => column !== selectedGender && column !== selectedOutcome,
  );

  const handleSingleChange = (field) => (event) => {
    const nextValue = event.target.value;
    const nextMapping = {
      ...mapping,
      [field]: nextValue,
    };

    if (field === 'gender' && nextValue === selectedOutcome) {
      nextMapping.outcome = '';
    }

    if (field === 'outcome' && nextValue === selectedGender) {
      nextMapping.gender = '';
    }

    nextMapping.features = nextMapping.features.filter(
      (feature) => feature !== nextMapping.gender && feature !== nextMapping.outcome,
    );

    onMappingChange(nextMapping);
  };

  const handleFeatureChange = (event) => {
    const value = event.target.value;
    onMappingChange({
      ...mapping,
      features: value ? [value] : [],
    });
  };

  const isGenderLocked = (column) => column === selectedOutcome && column !== selectedGender;
  const isOutcomeLocked = (column) => column === selectedGender && column !== selectedOutcome;

  return (
    <section>
      <h2>2. Column Mapper</h2>

      {disabled ? (
        <p>Upload a CSV to detect available columns.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label htmlFor="gender-column">Select Gender Column</label>
            <select
              id="gender-column"
              value={selectedGender}
              onChange={handleSingleChange('gender')}
            >
              <option value="" disabled>
                Select column
              </option>
              {columns.map((column) => (
                <option key={column} value={column} disabled={isGenderLocked(column)}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label htmlFor="outcome-column">Select Outcome Column</label>
            <select
              id="outcome-column"
              value={selectedOutcome}
              onChange={handleSingleChange('outcome')}
            >
              <option value="" disabled>
                Select column
              </option>
              {columns.map((column) => (
                <option key={column} value={column} disabled={isOutcomeLocked(column)}>
                  {column}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <label htmlFor="feature-columns">Select Feature Column</label>
            <select
              id="feature-columns"
              value={featureCol}
              onChange={handleFeatureChange}
            >
              <option value="">Select feature</option>
              {filteredColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}

export default ColumnMapper;
