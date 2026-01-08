
import React, { useState, useRef } from 'react';
import { Upload, FileText, Send, X, AlertCircle } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (texts: string[]) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'batch'>('direct');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectAnalyze = () => {
    if (!textInput.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setError(null);
    onAnalyze([textInput]);
    setTextInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!['text/plain', 'application/json', 'text/csv'].includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
        setError('Unsupported file format. Please use .txt, .json, or .csv');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleBatchAnalyze = async () => {
    if (!file) return;

    try {
      const content = await file.text();
      let texts: string[] = [];

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(content);
        texts = Array.isArray(parsed) ? parsed : [parsed.text || JSON.stringify(parsed)];
      } else if (file.name.endsWith('.csv')) {
        texts = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        // Basic CSV parsing: skip header if exists
        if (texts.length > 1) texts.shift();
      } else {
        texts = content.split(/\r?\n\n/).map(p => p.trim()).filter(p => p.length > 0);
      }

      if (texts.length === 0) {
        setError('No valid text found in file.');
        return;
      }

      onAnalyze(texts.slice(0, 50)); // Limit batch for safety
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError('Failed to parse file. Ensure format is valid.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('direct')}
          className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'direct' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Send size={18} />
          Direct Entry
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'batch' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Upload size={18} />
          Batch Processing
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {activeTab === 'direct' ? (
          <div className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste text content, customer reviews, or social media posts here..."
              className="w-full h-32 p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            />
            <button
              onClick={handleDirectAnalyze}
              disabled={isLoading || !textInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Analyze Sentiment <Send size={18} /></>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.json,.csv"
              />
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-colors">
                <FileText className="text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">Supports TXT, JSON, and CSV (Max 50 items)</p>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={16} className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-blue-800 truncate">{file.name}</span>
                </div>
                <button 
                  onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleBatchAnalyze}
              disabled={isLoading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Process Batch <Upload size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
