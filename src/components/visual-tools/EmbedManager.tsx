import { useState } from 'react';
import { useEmbeddedTools, EmbeddedTool } from '@/hooks/use-embedded-tools';
import { Plus, Trash2, ExternalLink, Eye, Check, X, AlertCircle } from 'lucide-react';

export function EmbedManager() {
  const { tools, addTool, removeTool } = useEmbeddedTools();
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handlePreview = () => {
    if (!newUrl.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    try {
      new URL(newUrl);
      setPreviewUrl(newUrl);
      setError(null);
    } catch {
      setError('Invalid URL format');
    }
  };

  const handleSave = () => {
    if (!newName.trim()) {
      setError('Please enter a tool name');
      return;
    }
    
    if (!newUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    const result = addTool(newName, newUrl, newDescription || undefined);
    
    if (result.success) {
      setNewUrl('');
      setNewName('');
      setNewDescription('');
      setPreviewUrl(null);
      setShowForm(false);
      setError(null);
    } else {
      setError(result.error || 'Failed to save tool');
    }
  };

  const handleCancel = () => {
    setNewUrl('');
    setNewName('');
    setNewDescription('');
    setPreviewUrl(null);
    setShowForm(false);
    setError(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-card/30">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/30">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>🔗</span> Embed Manager
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Create custom visual tools from any URL • Access via <code className="text-primary">ve.toolname</code>
        </p>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* New tool button / form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add New Embed</span>
          </button>
        ) : (
          <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
            <div className="px-4 py-3 bg-primary/10 border-b border-border/30 flex items-center justify-between">
              <span className="text-sm font-medium text-primary">New Embedded Tool</span>
              <button
                onClick={handleCancel}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {/* Error display */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name input */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tool Name (unique identifier)
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., calculator, charts, docs"
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Access via: <code className="text-primary">ve.{newName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'name'}</code>
                </p>
              </div>

              {/* URL input */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  URL to Embed
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://example.com/tool"
                    className="flex-1 px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handlePreview}
                    className="px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>

              {/* Description input */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g., Interactive calculator widget"
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Preview area */}
              {previewUrl && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Preview
                  </label>
                  <div className="rounded-lg border border-border/50 overflow-hidden bg-background" style={{ height: '200px' }}>
                    <iframe
                      src={previewUrl}
                      className="w-full h-full"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      title="Embed preview"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!newName.trim() || !newUrl.trim()}
                  className="flex-1 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Save Tool
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing tools list */}
        {tools.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Saved Embeds ({tools.length})
            </h3>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onRemove={() => removeTool(tool.id)} formatDate={formatDate} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {tools.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3">🔗</div>
            <p className="text-sm">No embedded tools yet</p>
            <p className="text-xs mt-1">Add your first tool to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ToolCardProps {
  tool: EmbeddedTool;
  onRemove: () => void;
  formatDate: (date: Date) => string;
}

function ToolCard({ tool, onRemove, formatDate }: ToolCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden hover:border-border transition-colors">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono font-medium text-primary">
              ve.{tool.id}
            </code>
            <span className="text-xs text-muted-foreground">
              ({tool.name})
            </span>
          </div>
          {tool.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {tool.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[200px]"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{tool.url}</span>
            </a>
            <span className="flex-shrink-0">Added {formatDate(tool.createdAt)}</span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          {showConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onRemove();
                  setShowConfirm(false);
                }}
                className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title="Confirm delete"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete tool"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
