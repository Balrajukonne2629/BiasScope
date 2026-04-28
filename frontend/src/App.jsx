import { useState } from 'react';
import axios from 'axios';
import Upload from './components/Upload';
import ColumnMapper from './components/ColumnMapper';
import Dashboard from './components/Dashboard';
import './App.css';

const AUDIT_API_URL = 'http://localhost:8000/api/v1/audit';

function App() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({
    gender: '',
    outcome: '',
    features: [],
  });
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRowsParsed = (parsedRows) => {
    setRows(parsedRows);

    const detectedColumns = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];
    setColumns(detectedColumns);

    setMapping({
      gender: '',
      outcome: '',
      features: [],
    });

    setAuditResult(null);
    setError('');
  };

  const canRunAudit =
    rows.length > 0 &&
    mapping.gender.trim() !== '' &&
    mapping.outcome.trim() !== '';

  const runAudit = async () => {
    if (!canRunAudit) {
      setError('Please upload data and map gender/outcome columns before running the audit.');
      return;
    }

    setIsLoading(true);
    setAuditResult(null);
    setError('');

    try {
      if (rows.length < 10) {
        setError('Dataset must have at least 10 rows for a meaningful audit.');
        return;
      }

      const payload = {
        data: rows,
        columns: {
          gender: mapping.gender,
          outcome: mapping.outcome,
          features: mapping.features,
        },
      };

      const response = await axios.post(AUDIT_API_URL, payload);
      setAuditResult(response.data);
    } catch (requestError) {
      const detail = requestError?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Audit request failed. Check backend and selected mappings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="app-header section-block">
        <h1>BiasScope</h1>
        <p className="subtitle">Unbiased AI Decision Auditor - Detect. Explain. Reduce Bias.</p>
        <p className="sdg-badge">🌍 UN SDG 10 — Reduced Inequalities</p>
        <a href="/demo_hiring_data.csv" download="demo_hiring_data.csv" className="demo-download-link">⬇ Download Demo CSV</a>
      </header>

      <section className="section-block">
        <Upload onRowsParsed={handleRowsParsed} />
      </section>

      <section className="section-block">
        <ColumnMapper
          columns={columns}
          mapping={mapping}
          onMappingChange={setMapping}
          disabled={rows.length === 0}
        />
      </section>

      <section className="section-block run-audit-section">
        <h2>Run</h2>
        <p className="rows-count">Rows loaded: {rows.length}</p>
        <button
          className="run-button"
          type="button"
          onClick={runAudit}
          disabled={isLoading || !canRunAudit}
        >
          {isLoading ? 'Running Audit...' : 'Run Audit'}
        </button>
        {!canRunAudit && !isLoading ? (
          <p className="run-hint">Upload data and map gender/outcome columns to continue.</p>
        ) : null}
      </section>

      <section className="section-block">
        <Dashboard result={auditResult} isLoading={isLoading} error={error} />
      </section>
    </main>
  );
}

export default App;
