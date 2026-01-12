import { useState, useEffect, useCallback } from 'react';

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  category?: string;
  tags?: string[];
  shortcut?: number; // 1-9 for quick access
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

const STORAGE_KEY = 'devxy-bookmarks';

const loadBookmarksFromStorage = (): Bookmark[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((bk: any) => ({
        ...bk,
        createdAt: new Date(bk.createdAt),
        lastUsed: bk.lastUsed ? new Date(bk.lastUsed) : undefined,
      }));
    }
  } catch (e) {
    console.error('Failed to load bookmarks:', e);
  }
  return [];
};

const saveBookmarksToStorage = (bookmarks: Bookmark[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks:', e);
  }
};

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarksFromStorage());

  useEffect(() => {
    saveBookmarksToStorage(bookmarks);
  }, [bookmarks]);

  const addBookmark = useCallback((
    name: string, 
    url: string, 
    category?: string, 
    tags?: string[]
  ): { success: boolean; error?: string; id?: string } => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!id) {
      return { success: false, error: 'Invalid bookmark name. Use alphanumeric characters only.' };
    }

    if (id.length > 30) {
      return { success: false, error: 'Bookmark name must be 30 characters or less.' };
    }

    // Check for duplicates
    if (bookmarks.some(b => b.id === id)) {
      return { success: false, error: `Bookmark "${id}" already exists.` };
    }

    // Validate URL
    try {
      new URL(url.startsWith('http') ? url : 'https://' + url);
    } catch {
      return { success: false, error: 'Invalid URL format.' };
    }

    const newBookmark: Bookmark = {
      id,
      name,
      url: url.startsWith('http') ? url : 'https://' + url,
      category: category?.toLowerCase().trim(),
      tags: tags?.map(t => t.toLowerCase().trim()).filter(Boolean),
      createdAt: new Date(),
      usageCount: 0,
    };

    setBookmarks(prev => [...prev, newBookmark]);
    return { success: true, id };
  }, [bookmarks]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const getBookmark = useCallback((id: string): Bookmark | undefined => {
    return bookmarks.find(b => b.id === id);
  }, [bookmarks]);

  const getByCategory = useCallback((category: string): Bookmark[] => {
    return bookmarks.filter(b => b.category?.toLowerCase() === category.toLowerCase());
  }, [bookmarks]);

  const getByTag = useCallback((tag: string): Bookmark[] => {
    return bookmarks.filter(b => b.tags?.some(t => t.toLowerCase() === tag.toLowerCase()));
  }, [bookmarks]);

  const getByShortcut = useCallback((num: number): Bookmark | undefined => {
    return bookmarks.find(b => b.shortcut === num);
  }, [bookmarks]);

  const updateBookmark = useCallback((id: string, updates: Partial<Omit<Bookmark, 'id' | 'createdAt'>>) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  }, []);

  const setShortcut = useCallback((id: string, shortcut: number | undefined) => {
    if (shortcut !== undefined && (shortcut < 1 || shortcut > 9)) {
      return { success: false, error: 'Shortcut must be between 1 and 9.' };
    }

    // Remove shortcut from any existing bookmark that has it
    if (shortcut !== undefined) {
      setBookmarks(prev => prev.map(b => 
        b.shortcut === shortcut ? { ...b, shortcut: undefined } : b
      ));
    }

    // Set new shortcut
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, shortcut } : b
    ));

    return { success: true };
  }, []);

  const recordUsage = useCallback((id: string) => {
    setBookmarks(prev => prev.map(b => 
      b.id === id ? { ...b, lastUsed: new Date(), usageCount: b.usageCount + 1 } : b
    ));
  }, []);

  const searchBookmarks = useCallback((query: string): Bookmark[] => {
    const q = query.toLowerCase().trim();
    if (!q) return bookmarks;

    return bookmarks.filter(b => 
      b.id.includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.url.toLowerCase().includes(q) ||
      b.category?.includes(q) ||
      b.tags?.some(t => t.includes(q))
    ).sort((a, b) => {
      // Sort by relevance (name match first, then by usage)
      const aNameMatch = a.name.toLowerCase().startsWith(q) ? 1 : 0;
      const bNameMatch = b.name.toLowerCase().startsWith(q) ? 1 : 0;
      if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
      return b.usageCount - a.usageCount;
    });
  }, [bookmarks]);

  const getCategories = useCallback((): string[] => {
    const categories = new Set<string>();
    bookmarks.forEach(b => {
      if (b.category) categories.add(b.category);
    });
    return Array.from(categories).sort();
  }, [bookmarks]);

  const getAllTags = useCallback((): string[] => {
    const tags = new Set<string>();
    bookmarks.forEach(b => {
      b.tags?.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [bookmarks]);

  const exportBookmarks = useCallback((): string => {
    return JSON.stringify(bookmarks, null, 2);
  }, [bookmarks]);

  const importBookmarks = useCallback((data: string): { success: boolean; error?: string; count?: number } => {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'Invalid format. Expected an array of bookmarks.' };
      }

      const validBookmarks: Bookmark[] = [];
      const existingIds = new Set(bookmarks.map(b => b.id));

      for (const item of parsed) {
        if (!item.name || !item.url) continue;
        
        const id = (item.id || item.name.toLowerCase().replace(/[^a-z0-9]/g, '')).slice(0, 30);
        if (existingIds.has(id)) continue; // Skip duplicates
        
        validBookmarks.push({
          id,
          name: item.name,
          url: item.url,
          category: item.category,
          tags: item.tags,
          shortcut: item.shortcut,
          createdAt: new Date(item.createdAt || Date.now()),
          lastUsed: item.lastUsed ? new Date(item.lastUsed) : undefined,
          usageCount: item.usageCount || 0,
        });
        existingIds.add(id);
      }

      if (validBookmarks.length === 0) {
        return { success: false, error: 'No valid bookmarks found to import.' };
      }

      setBookmarks(prev => [...prev, ...validBookmarks]);
      return { success: true, count: validBookmarks.length };
    } catch (e) {
      return { success: false, error: 'Failed to parse JSON data.' };
    }
  }, [bookmarks]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    getBookmark,
    getByCategory,
    getByTag,
    getByShortcut,
    updateBookmark,
    setShortcut,
    recordUsage,
    searchBookmarks,
    getCategories,
    getAllTags,
    exportBookmarks,
    importBookmarks,
  };
}

// Static getters for use outside React
export function getBookmarksStatic(): Bookmark[] {
  return loadBookmarksFromStorage();
}

export function getBookmarkByIdStatic(id: string): Bookmark | undefined {
  return loadBookmarksFromStorage().find(b => b.id === id);
}

export function getBookmarkByShortcutStatic(num: number): Bookmark | undefined {
  return loadBookmarksFromStorage().find(b => b.shortcut === num);
}
