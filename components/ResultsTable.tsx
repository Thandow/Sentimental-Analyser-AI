
import React from 'react';
import { Download, ExternalLink, Info } from 'lucide-react';
import { AnalysisResult, Sentiment } from '../types';

interface ResultsTableProps {
  results: AnalysisResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          Analysis History
          <span className="text-xs font-normal text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
            {results.length} results
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Snippet</th>
              <th className="px-6 py-4">Sentiment</th>
              <th className="px-6 py-4">Confidence</th>
              <th className="px-6 py-4">Keywords</th>
              <th className="px-6 py-4 text-center">Insights</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-slate-700 line-clamp-2">{result.text}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    result.sentiment === Sentiment.POSITIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    result.sentiment === Sentiment.NEGATIVE ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {result.sentiment}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[80px]">
                    <div 
                      className={`h-1.5 rounded-full ${
                        result.confidence > 0.8 ? 'bg-emerald-500' : result.confidence > 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{(result.confidence * 100).toFixed(0)}% Match</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {result.keywords.slice(0, 3).map((kw, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                    {result.keywords.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{result.keywords.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    title={result.explanation}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group-relative"
                  >
                    <Info size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
