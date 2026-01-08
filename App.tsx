
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BarChart2, Brain, Download, HelpCircle, LayoutDashboard, Info, BookOpen, ChevronDown, FileJson, FileSpreadsheet, FileText as FilePdf } from 'lucide-react';
import InputSection from './components/InputSection';
import VisualizationCards from './components/VisualizationCards';
import ResultsTable from './components/ResultsTable';
import { AnalysisResult } from './types';
import { geminiService } from './services/geminiService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside of export menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnalyze = useCallback(async (texts: string[]) => {
    setIsLoading(true);
    try {
      const chunkSize = 10;
      const allResults: AnalysisResult[] = [];
      
      for (let i = 0; i < texts.length; i += chunkSize) {
        const chunk = texts.slice(i, i + chunkSize);
        const chunkResults = await geminiService.analyzeBatch(chunk);
        allResults.push(...chunkResults);
      }
      
      setResults(prev => [...allResults, ...prev].slice(0, 200));
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please check your API key and network.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportData = (format: 'json' | 'csv' | 'pdf') => {
    if (results.length === 0) return;
    setShowExportMenu(false);

    let filename = `sentix_results_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      const content = JSON.stringify(results, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['ID', 'Text', 'Sentiment', 'Confidence', 'Keywords', 'Explanation'];
      const rows = results.map(r => [
        r.id,
        `"${r.text.replace(/"/g, '""')}"`,
        r.sentiment,
        r.confidence,
        `"${r.keywords.join(', ')}"`,
        `"${r.explanation.replace(/"/g, '""')}"`
      ]);
      const content = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Sentix Analysis Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      
      const tableData = results.map(r => [
        r.sentiment,
        `${(r.confidence * 100).toFixed(0)}%`,
        r.keywords.slice(0, 3).join(', '),
        r.text.length > 60 ? r.text.substring(0, 57) + '...' : r.text
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Sentiment', 'Conf.', 'Keywords', 'Text Snippet']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
        columnStyles: {
          3: { cellWidth: 100 }
        }
      });

      doc.save(`${filename}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12">
      <nav className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Sentix</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowDocs(!showDocs)}
                className="text-slate-500 hover:text-slate-900 transition-colors p-2"
                title="Documentation"
              >
                <HelpCircle size={20} />
              </button>
              <div className="h-6 w-px bg-slate-200" />
              
              <div className="relative" ref={exportMenuRef}>
                <button 
                  disabled={results.length === 0}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Download size={16} /> Export <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      onClick={() => exportData('csv')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <FileSpreadsheet size={16} className="text-emerald-600" /> 
                      <div className="flex flex-col">
                        <span>CSV Spreadsheet</span>
                        <span className="text-[10px] text-slate-400">Best for Excel/Sheets</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => exportData('json')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <FileJson size={16} className="text-amber-600" /> 
                      <div className="flex flex-col">
                        <span>JSON Data</span>
                        <span className="text-[10px] text-slate-400">Best for developers</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => exportData('pdf')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <FilePdf size={16} className="text-rose-600" /> 
                      <div className="flex flex-col">
                        <span>PDF Report</span>
                        <span className="text-[10px] text-slate-400">Best for presentation</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {showDocs && (
          <div className="mb-8 bg-blue-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BookOpen size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info size={24} /> Model Documentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm opacity-90 leading-relaxed">
                <div>
                  <h3 className="font-semibold mb-2">Confidence Thresholds</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-bold">0.8 - 1.0:</span> Highly reliable prediction. Strong indicators present.</li>
                    <li><span className="font-bold">0.6 - 0.79:</span> Moderate reliability. Tone might be subtle or nuanced.</li>
                    <li><span className="font-bold">Below 0.6:</span> Low reliability. Sentiment is ambiguous or mixed.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Limitations & Biases</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Sarcasm and regional slang may be misclassified.</li>
                    <li>May struggle with extremely long context or double negatives.</li>
                    <li>The model is pre-trained; real-time events may lack context.</li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => setShowDocs(false)}
                className="mt-6 text-xs font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Analysis Console</h1>
              <p className="text-slate-500 text-sm">Submit text or upload files for processing.</p>
            </div>
            <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
            
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Analyzed</span>
                  <span className="text-lg font-bold">{results.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg Confidence</span>
                  <span className="text-lg font-bold">
                    {results.length > 0 
                      ? Math.round((results.reduce((acc, curr) => acc + curr.confidence, 0) / results.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Insights Dashboard</h2>
              <p className="text-slate-500 text-sm">Visualize sentiment trends and explore specific results.</p>
            </div>
            
            {results.length > 0 ? (
              <>
                <VisualizationCards results={results} />
                <ResultsTable results={results} />
              </>
            ) : (
              <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                <LayoutDashboard size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No results to display yet</p>
                <p className="text-sm opacity-60">Analyze some text to see interactive insights.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 right-8">
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI Engine Active
        </div>
      </div>
    </div>
  );
};

export default App;
