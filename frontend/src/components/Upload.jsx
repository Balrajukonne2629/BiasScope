import { useState } from 'react';
import Papa from 'papaparse';

function Upload({ onRowsParsed }) {
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setParseError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setParseError(results.errors[0].message || 'CSV parsing failed.');
          onRowsParsed([]);
          return;
        }

        const cleanedRows = (results.data || []).filter((row) =>
          Object.values(row).some((value) => String(value ?? '').trim() !== '')
        );

        onRowsParsed(cleanedRows);
      },
      error: (error) => {
        setParseError(error.message || 'CSV parsing failed.');
        onRowsParsed([]);
      },
    });
  };

  return (
    <section>
      <h2>1. Upload CSV</h2>
      <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
      {fileName && <p>File: {fileName}</p>}
      {parseError && <p>{parseError}</p>}
    </section>
  );
}

export default Upload;
