import { useState, useEffect } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

export function JsonFormatter({ initialValue }: { initialValue?: string }) {
  const [input, setInput] = useState(initialValue || '');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);

  useEffect(() => {
    formatJson();
  }, [input, indentSize, sortKeys]);

  const formatJson = () => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      let parsed = JSON.parse(input);
      
      if (sortKeys) {
        parsed = sortObjectKeys(parsed);
      }
      
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const sortObjectKeys = (obj: unknown): unknown => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj as Record<string, unknown>)
        .sort()
        .reduce((acc, key) => {
          acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
          return acc;
        }, {} as Record<string, unknown>);
    }
    return obj;
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
    } catch {
      // Ignore if invalid
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch {
      // Permission denied
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-border/50 px-4 py-2 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Indent:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="text-xs px-2 py-1 rounded bg-muted border border-border outline-none"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
            className="rounded"
          />
          Sort keys
        </label>
        <button
          onClick={minifyJson}
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          Minify
        </button>
        <button
          onClick={handlePaste}
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          Paste
        </button>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Input */}
        <div className="w-1/2 flex flex-col border-r border-border/50">
          <div className="flex-shrink-0 px-3 py-2 border-b border-border/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Input</span>
            {error && (
              <span className="flex items-center gap-1 text-xs text-terminal-error">
                <AlertCircle className="w-3 h-3" />
                {error}
              </span>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Paste your JSON here...'
            className="flex-1 p-3 bg-transparent text-sm font-mono outline-none resize-none placeholder:text-muted-foreground/50"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-shrink-0 px-3 py-2 border-b border-border/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Formatted</span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="flex-1 p-3 text-sm font-mono overflow-auto text-terminal-success whitespace-pre">
            {output || (error ? '' : 'Formatted JSON will appear here...')}
          </pre>
        </div>
      </div>
    </div>
  );
}
