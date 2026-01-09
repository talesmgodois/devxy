import { useState, useEffect, useCallback } from 'react';

export interface EmbeddedTool {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  description?: string;
}

const STORAGE_KEY = 'devxy-embedded-tools';

const loadToolsFromStorage = (): EmbeddedTool[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((tool: any) => ({
        ...tool,
        createdAt: new Date(tool.createdAt),
      }));
    }
  } catch (e) {
    console.error('Failed to load embedded tools:', e);
  }
  return [];
};

const saveToolsToStorage = (tools: EmbeddedTool[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  } catch (e) {
    console.error('Failed to save embedded tools:', e);
  }
};

export function useEmbeddedTools() {
  const [tools, setTools] = useState<EmbeddedTool[]>(() => loadToolsFromStorage());

  useEffect(() => {
    saveToolsToStorage(tools);
  }, [tools]);

  const addTool = useCallback((name: string, url: string, description?: string): { success: boolean; error?: string } => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!id) {
      return { success: false, error: 'Invalid tool name. Use alphanumeric characters only.' };
    }

    if (id.length > 20) {
      return { success: false, error: 'Tool name must be 20 characters or less.' };
    }

    // Check for duplicates
    if (tools.some(t => t.id === id)) {
      return { success: false, error: `Tool "${id}" already exists.` };
    }

    const newTool: EmbeddedTool = {
      id,
      name,
      url,
      description,
      createdAt: new Date(),
    };

    setTools(prev => [...prev, newTool]);
    return { success: true };
  }, [tools]);

  const removeTool = useCallback((id: string) => {
    setTools(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTool = useCallback((id: string): EmbeddedTool | undefined => {
    return tools.find(t => t.id === id);
  }, [tools]);

  const updateTool = useCallback((id: string, updates: Partial<Omit<EmbeddedTool, 'id' | 'createdAt'>>) => {
    setTools(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  return {
    tools,
    addTool,
    removeTool,
    getTool,
    updateTool,
  };
}

// Static getter for use outside React
export function getEmbeddedToolsStatic(): EmbeddedTool[] {
  return loadToolsFromStorage();
}
