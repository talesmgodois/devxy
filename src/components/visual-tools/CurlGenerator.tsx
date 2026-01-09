import { useState } from 'react';
import { Copy, Check, Plus, X } from 'lucide-react';

interface Header {
  key: string;
  value: string;
}

export function CurlGenerator({ initialValue }: { initialValue?: string }) {
  const [method, setMethod] = useState(initialValue?.toUpperCase() || 'GET');
  const [url, setUrl] = useState('https://api.example.com/endpoint');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const generateCurl = () => {
    let curl = `curl -X ${method}`;
    
    // Add headers
    headers.forEach(h => {
      if (h.key && h.value) {
        curl += ` \\\n  -H '${h.key}: ${h.value}'`;
      }
    });
    
    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
      // Try to minify JSON if valid
      let bodyStr = body.trim();
      try {
        const parsed = JSON.parse(bodyStr);
        bodyStr = JSON.stringify(parsed);
      } catch {
        // Use as-is if not valid JSON
      }
      curl += ` \\\n  -d '${bodyStr}'`;
    }
    
    curl += ` \\\n  '${url}'`;
    
    return curl;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateCurl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Method & URL */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Method & URL</label>
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono outline-none focus:border-primary"
            >
              {methods.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Headers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Headers</label>
            <button
              onClick={addHeader}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Header
            </button>
          </div>
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono outline-none focus:border-primary"
                />
                <span className="text-muted-foreground">:</span>
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder="Header value"
                  className="flex-1 px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono outline-none focus:border-primary"
                />
                <button
                  onClick={() => removeHeader(index)}
                  className="p-2 text-muted-foreground hover:text-terminal-error transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Request Body (JSON)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={5}
              className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm font-mono outline-none focus:border-primary resize-none"
            />
          </div>
        )}

        {/* Generated cURL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Generated cURL</label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="w-full p-3 rounded-md bg-background border border-border text-sm font-mono text-terminal-success overflow-x-auto whitespace-pre-wrap break-all">
            {generateCurl()}
          </pre>
        </div>
      </div>
    </div>
  );
}
