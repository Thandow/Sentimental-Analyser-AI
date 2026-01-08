
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AnalysisResult, Sentiment } from '../types';

interface VisualizationCardsProps {
  results: AnalysisResult[];
}

const COLORS = {
  [Sentiment.POSITIVE]: '#10b981',
  [Sentiment.NEGATIVE]: '#ef4444',
  [Sentiment.NEUTRAL]: '#64748b',
};

const VisualizationCards: React.FC<VisualizationCardsProps> = ({ results }) => {
  if (results.length === 0) return null;

  const data = [
    { name: Sentiment.POSITIVE, value: results.filter(r => r.sentiment === Sentiment.POSITIVE).length },
    { name: Sentiment.NEGATIVE, value: results.filter(r => r.sentiment === Sentiment.NEGATIVE).length },
    { name: Sentiment.NEUTRAL, value: results.filter(r => r.sentiment === Sentiment.NEUTRAL).length },
  ].filter(d => d.value > 0);

  const confidenceData = results.map((r, i) => ({
    name: `Doc ${i + 1}`,
    confidence: Math.round(r.confidence * 100)
  })).slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Sentiment Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as Sentiment]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Confidence Comparison (Last 10)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                 cursor={{ fill: '#f1f5f9' }}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="confidence" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VisualizationCards;
