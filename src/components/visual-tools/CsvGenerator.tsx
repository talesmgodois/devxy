import { useState, useEffect } from 'react';

interface CsvGeneratorProps {
  initialValue?: string;
}

export function CsvGenerator({ initialValue }: CsvGeneratorProps) {
  const [jsonInput, setJsonInput] = useState(initialValue || '[\n  { "name": "John", "age": 30, "city": "NYC" },\n  { "name": "Jane", "age": 25, "city": "LA" }\n]');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);

  useEffect(() => {
    convertToCsv();
  }, [jsonInput, delimiter, includeHeaders]);

  const convertToCsv = () => {
    try {
      const trimmed = jsonInput.trim();
      if (!trimmed) {
        setCsvOutput('');
        setError(null);
        return;
      }

      const data = JSON.parse(trimmed);
      
      if (!Array.isArray(data)) {
        setError('JSON must be an array of objects');
        setCsvOutput('');
        return;
      }

      if (data.length === 0) {
        setCsvOutput('');
        setError(null);
        return;
      }

      // Get all unique keys from all objects
      const allKeys = new Set<string>();
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allKeys.add(key));
        }
      });
      const headers = Array.from(allKeys);

      if (headers.length === 0) {
        setError('No valid objects found in array');
        setCsvOutput('');
        return;
      }

      // Build CSV
      const lines: string[] = [];
      
      if (includeHeaders) {
        lines.push(headers.map(h => escapeValue(h, delimiter)).join(delimiter));
      }

      data.forEach(row => {
        if (typeof row === 'object' && row !== null) {
          const values = headers.map(header => {
            const value = row[header];
            if (value === undefined || value === null) return '';
            if (typeof value === 'object') return escapeValue(JSON.stringify(value), delimiter);
            return escapeValue(String(value), delimiter);
          });
          lines.push(values.join(delimiter));
        }
      });

      setCsvOutput(lines.join('\n'));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setCsvOutput('');
    }
  };

  const escapeValue = (value: string, delim: string): string => {
    // Escape quotes and wrap in quotes if contains delimiter, quotes, or newlines
    if (value.includes(delim) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const handleCopy = async () => {
    if (csvOutput) {
      await navigator.clipboard.writeText(csvOutput);
    }
  };

  const handleDownload = () => {
    if (!csvOutput) return;
    const blob = new Blob([csvOutput], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    setJsonInput(`[
  { "id": 1, "product": "Laptop", "price": 999.99, "inStock": true },
  { "id": 2, "product": "Mouse", "price": 29.99, "inStock": true },
  { "id": 3, "product": "Keyboard", "price": 79.99, "inStock": false },
  { "id": 4, "product": "Monitor", "price": 299.99, "inStock": true }
]`);
  };

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="text-center flex-shrink-0">
        <h2 className="text-xl font-bold text-foreground mb-2">📊 JSON to CSV Converter</h2>
        <p className="text-sm text-muted-foreground">Convert JSON arrays to CSV format</p>
      </div>

      {/* Options */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Delimiter:</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="px-2 py-1 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={includeHeaders}
            onChange={(e) => setIncludeHeaders(e.target.checked)}
            className="rounded border-border"
          />
          Include headers
        </label>
        <button
          onClick={loadSample}
          className="ml-auto px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border"
        >
          Load sample
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {/* JSON Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-muted-foreground mb-2">JSON Input</label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="flex-1 p-3 font-mono text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Paste your JSON array here..."
            spellCheck={false}
          />
        </div>

        {/* CSV Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">CSV Output</label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!csvOutput}
                className="px-2 py-1 text-xs rounded bg-primary/20 hover:bg-primary/30 text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Copy
              </button>
              <button
                onClick={handleDownload}
                disabled={!csvOutput}
                className="px-2 py-1 text-xs rounded bg-terminal-success/20 hover:bg-terminal-success/30 text-terminal-success disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          {error ? (
            <div className="flex-1 p-3 font-mono text-sm bg-terminal-error/10 border border-terminal-error/50 rounded-md text-terminal-error">
              Error: {error}
            </div>
          ) : (
            <textarea
              value={csvOutput}
              readOnly
              className="flex-1 p-3 font-mono text-sm bg-muted/30 border border-border rounded-md resize-none"
              placeholder="CSV output will appear here..."
            />
          )}
        </div>
      </div>

      {/* Stats */}
      {csvOutput && (
        <div className="flex-shrink-0 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {csvOutput.split('\n').length} rows • {csvOutput.length} characters
          </p>
        </div>
      )}
    </div>
  );
}
