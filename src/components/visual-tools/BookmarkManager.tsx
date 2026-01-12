import { useState, useMemo } from 'react';
import { useBookmarks, Bookmark } from '@/hooks/use-bookmarks';
import { 
  Plus, Trash2, ExternalLink, Check, X, AlertCircle, 
  Search, Tag, FolderOpen, Hash, Download, Upload, Star
} from 'lucide-react';

export function BookmarkManager() {
  const { 
    bookmarks, addBookmark, removeBookmark, updateBookmark, 
    setShortcut, searchBookmarks, getCategories, exportBookmarks, importBookmarks 
  } = useBookmarks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // New bookmark form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTags, setNewTags] = useState('');

  const categories = getCategories();
  
  const filteredBookmarks = useMemo(() => {
    let results = searchQuery ? searchBookmarks(searchQuery) : bookmarks;
    if (categoryFilter) {
      results = results.filter(b => b.category === categoryFilter);
    }
    return results;
  }, [bookmarks, searchQuery, categoryFilter, searchBookmarks]);

  const handleSave = () => {
    if (!newName.trim()) {
      setError('Please enter a bookmark name');
      return;
    }
    
    if (!newUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const result = addBookmark(newName, newUrl, newCategory || undefined, tags.length > 0 ? tags : undefined);
    
    if (result.success) {
      setNewName('');
      setNewUrl('');
      setNewCategory('');
      setNewTags('');
      setShowForm(false);
      setError(null);
      showSuccess(`Bookmark "${newName}" added! Open with: bk.${result.id}`);
    } else {
      setError(result.error || 'Failed to save bookmark');
    }
  };

  const handleCancel = () => {
    setNewName('');
    setNewUrl('');
    setNewCategory('');
    setNewTags('');
    setShowForm(false);
    setError(null);
  };

  const handleExport = () => {
    const data = exportBookmarks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devxy-bookmarks.json';
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Bookmarks exported successfully!');
  };

  const handleImport = () => {
    const result = importBookmarks(importData);
    if (result.success) {
      setImportData('');
      setShowImport(false);
      showSuccess(`Imported ${result.count} bookmarks successfully!`);
    } else {
      setError(result.error || 'Failed to import bookmarks');
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/30">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>🔖</span> Bookmark Manager
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Quick-access links • Open in new tab via <code className="text-primary">bk.name</code> or <code className="text-primary">bk.1-9</code>
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-border/30 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                categoryFilter === null 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  categoryFilter === cat 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mx-4 mt-2 flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 border border-primary/30 text-primary text-sm">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Add/Import buttons */}
        {!showForm && !showImport && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Add Bookmark</span>
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-3 rounded-lg border border-border/50 hover:border-secondary/50 hover:bg-secondary/5 text-muted-foreground hover:text-secondary transition-all"
              title="Import bookmarks"
            >
              <Upload className="w-5 h-5" />
            </button>
            {bookmarks.length > 0 && (
              <button
                onClick={handleExport}
                className="px-4 py-3 rounded-lg border border-border/50 hover:border-secondary/50 hover:bg-secondary/5 text-muted-foreground hover:text-secondary transition-all"
                title="Export bookmarks"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
            <div className="px-4 py-3 bg-primary/10 border-b border-border/30 flex items-center justify-between">
              <span className="text-sm font-medium text-primary">New Bookmark</span>
              <button
                onClick={handleCancel}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., GitHub, MDN, StackOverflow"
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Access via: <code className="text-primary">bk.{newName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'name'}</code>
                </p>
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., docs, tools, social"
                  list="existing-categories"
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
                <datalist id="existing-categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Tags (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g., javascript, react, frontend"
                  className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={!newName.trim() || !newUrl.trim()}
                  className="flex-1 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Save Bookmark
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

        {/* Import form */}
        {showImport && (
          <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden">
            <div className="px-4 py-3 bg-secondary/10 border-b border-border/30 flex items-center justify-between">
              <span className="text-sm font-medium text-secondary">Import Bookmarks</span>
              <button
                onClick={() => { setShowImport(false); setImportData(''); setError(null); }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Paste JSON data
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='[{"name": "GitHub", "url": "https://github.com", "category": "dev"}]'
                  className="w-full h-32 px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-secondary/50 text-foreground placeholder:text-muted-foreground font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="flex-1 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => { setShowImport(false); setImportData(''); setError(null); }}
                  className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks list */}
        {filteredBookmarks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Bookmarks ({filteredBookmarks.length})
            </h3>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard 
                key={bookmark.id} 
                bookmark={bookmark} 
                onRemove={() => removeBookmark(bookmark.id)}
                onSetShortcut={(num) => setShortcut(bookmark.id, num)}
                onUpdate={(updates) => updateBookmark(bookmark.id, updates)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredBookmarks.length === 0 && !showForm && !showImport && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-3">🔖</div>
            <p className="text-sm">
              {searchQuery || categoryFilter ? 'No bookmarks match your search' : 'No bookmarks yet'}
            </p>
            <p className="text-xs mt-1">
              {searchQuery || categoryFilter ? 'Try a different search term' : 'Add your first bookmark to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onRemove: () => void;
  onSetShortcut: (num: number | undefined) => void;
  onUpdate: (updates: Partial<Bookmark>) => void;
  formatDate: (date: Date) => string;
}

function BookmarkCard({ bookmark, onRemove, onSetShortcut, formatDate }: BookmarkCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showShortcutPicker, setShowShortcutPicker] = useState(false);

  const handleOpen = () => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden hover:border-border transition-colors">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={handleOpen}
              className="text-sm font-mono font-medium text-primary hover:underline flex items-center gap-1"
            >
              bk.{bookmark.id}
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-xs text-muted-foreground">
              ({bookmark.name})
            </span>
            {bookmark.shortcut && (
              <span className="px-1.5 py-0.5 text-xs rounded bg-accent/20 text-accent font-medium">
                ⌨ {bookmark.shortcut}
              </span>
            )}
            {bookmark.category && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                <FolderOpen className="w-3 h-3" />
                {bookmark.category}
              </span>
            )}
          </div>
          
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {bookmark.tags.map(tag => (
                <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded bg-secondary/10 text-secondary">
                  <Hash className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[200px]"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{bookmark.url}</span>
            </a>
            {bookmark.usageCount > 0 && (
              <span className="flex-shrink-0">Used {bookmark.usageCount}x</span>
            )}
          </div>
        </div>
        
        <div className="flex-shrink-0 flex items-center gap-1">
          {/* Shortcut picker */}
          <div className="relative">
            <button
              onClick={() => setShowShortcutPicker(!showShortcutPicker)}
              className={`p-1.5 rounded transition-colors ${
                bookmark.shortcut 
                  ? 'bg-accent/10 text-accent hover:bg-accent/20' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Set keyboard shortcut (1-9)"
            >
              <Star className="w-4 h-4" />
            </button>
            
            {showShortcutPicker && (
              <div className="absolute right-0 top-full mt-1 z-10 p-2 rounded-lg bg-popover border border-border shadow-lg">
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => { onSetShortcut(num); setShowShortcutPicker(false); }}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        bookmark.shortcut === num
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {bookmark.shortcut && (
                  <button
                    onClick={() => { onSetShortcut(undefined); setShowShortcutPicker(false); }}
                    className="w-full mt-1 px-2 py-1 text-xs rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Delete button */}
          {showConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onRemove(); setShowConfirm(false); }}
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
              title="Delete bookmark"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
