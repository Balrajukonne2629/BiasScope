import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function mapObjectToChartData(inputObject, valueKey) {
  if (!inputObject || typeof inputObject !== 'object') {
    return [];
  }

  return Object.entries(inputObject).map(([group, value]) => ({
    group,
    [valueKey]: Number(value ?? 0),
  }));
}

function ChartsPanel({ result }) {
  const groupCountData = mapObjectToChartData(result.group_counts, 'count');
  const groupRateData = mapObjectToChartData(result.group_rates, 'rate');

  return (
    <section className="card results-panel">
      <h3>Charts</h3>
      <div className="charts-grid">
        <article className="card chart-card">
          <h4 className="chart-title">Group Distribution</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={groupCountData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Rows" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card">
          <h4 className="chart-title">Hire Rate Comparison</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={groupRateData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Bar dataKey="rate" fill="#10b981" name="Rate" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}

export default ChartsPanel;
