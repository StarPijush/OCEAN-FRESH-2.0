import { useState } from 'react';

import { formatCurrency } from '../../utils/format.js';

interface ChartDay {
  label: string;
  sales: number;
  income: number;
}

interface Props {
  data: ChartDay[];
}

export function ChartCard({ data }: Props) {
  const [mode, setMode] = useState<'income' | 'sales'>('income');
  const max = Math.max(...data.map((d) => (mode === 'income' ? d.income : d.sales)), 1);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short' });

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title">7-Day Performance</div>
        <div className="chart-toggle">
          <button
            className={`chart-toggle-btn ${mode === 'income' ? 'active' : ''}`}
            onClick={() => setMode('income')}
          >
            Income
          </button>
          <button
            className={`chart-toggle-btn ${mode === 'sales' ? 'active' : ''}`}
            onClick={() => setMode('sales')}
          >
            Sales
          </button>
        </div>
      </div>
      <div className="chart-bars" id="chart-bars">
        {data.map((d) => {
          const val = mode === 'income' ? d.income : d.sales;
          const pct = Math.max(Math.round((val / max) * 100), 4);
          return (
            <div key={d.label} className="chart-bar-wrap">
              <div className="chart-bar-outer">
                <div
                  className={`chart-bar${d.label === today ? ' today' : ''}`}
                  style={{ height: `${pct}%` }}
                  title={`${d.label}: ${mode === 'income' ? formatCurrency(d.income) : `${d.sales} orders`}`}
                />
              </div>
              <div className="chart-bar-label">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
