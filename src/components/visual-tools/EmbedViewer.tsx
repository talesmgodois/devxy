import { ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface EmbedViewerProps {
  url: string;
  name: string;
  description?: string;
}

export function EmbedViewer({ url, name, description }: EmbedViewerProps) {
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="h-full flex flex-col bg-card/30">
      <div className="flex-shrink-0 px-4 py-2 border-b border-border/30 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span>🔗</span>
            <span className="truncate">{name}</span>
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-background">
        <iframe
          key={key}
          src={url}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={name}
        />
      </div>
    </div>
  );
}
