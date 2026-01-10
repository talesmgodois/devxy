import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { generateCPF, generateCNPJ, generateTituloEleitor, generateUserName, generateNickName, generateEmail } from '@/utils/generators';
import { VISUAL_TOOLS } from './visual-tools';
import { EmbedViewer } from './visual-tools/EmbedViewer';
import { EMBEDDED_INTERPRETERS } from './embedded-interpreters';
import { LayoutGrid, X, Terminal as TerminalIcon, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { MobileFAB } from './MobileFAB';
import { useEmbeddedTools, getEmbeddedToolsStatic, EmbeddedTool } from '@/hooks/use-embedded-tools';
interface OutputLine {
  id: number;
  type: 'command' | 'result' | 'error' | 'info' | 'welcome';
  content: string;
  timestamp?: Date;
}

// Parse command arguments
interface CommandArgs {
  formatted: boolean;
  number: number;
}

const parseArgs = (argsStr: string): CommandArgs => {
  const args: CommandArgs = { formatted: false, number: 1 };
  const tokens = argsStr.trim().split(/\s+/);
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '-f' || token === '--formatted') {
      args.formatted = true;
    } else if (token === '-n' || token === '--number') {
      const next = tokens[i + 1];
      if (next && !next.startsWith('-')) {
        const num = parseInt(next, 10);
        if (!isNaN(num) && num > 0 && num <= 100) {
          args.number = num;
          i++; // skip next token
        }
      }
    }
  }
  
  return args;
};

// Remove formatting from CPF (XXX.XXX.XXX-XX -> XXXXXXXXXXX)
const unformatCPF = (cpf: string): string => cpf.replace(/[.\-]/g, '');

// Remove formatting from CNPJ (XX.XXX.XXX/XXXX-XX -> XXXXXXXXXXXXXX)
const unformatCNPJ = (cnpj: string): string => cnpj.replace(/[.\-\/]/g, '');

// Remove formatting from Titulo Eleitor (XXXXXXXX XXXX -> XXXXXXXXXXXX)
const unformatTituloEleitor = (titulo: string): string => titulo.replace(/\s/g, '');

// Generator commands (no input required) - now with r. prefix
interface GeneratorCommand {
  fn: () => string;
  desc: string;
  supportsFormatted?: boolean;
  unformat?: (s: string) => string;
}

const GENERATOR_COMMANDS: Record<string, GeneratorCommand> = {
  'r.cpf': { fn: generateCPF, desc: 'Generate random Brazilian CPF [-f formatted] [-n count]', supportsFormatted: true, unformat: unformatCPF },
  'r.cnpj': { fn: generateCNPJ, desc: 'Generate random Brazilian CNPJ [-f formatted] [-n count]', supportsFormatted: true, unformat: unformatCNPJ },
  'r.titulo': { fn: generateTituloEleitor, desc: 'Generate random Brazilian Titulo Eleitoral [-f formatted] [-n count]', supportsFormatted: true, unformat: unformatTituloEleitor },
  'r.user': { fn: generateUserName, desc: 'Generate random username [-n count]' },
  'r.nick': { fn: generateNickName, desc: 'Generate random nickname [-n count]' },
  'r.email': { fn: generateEmail, desc: 'Generate random email address [-n count]' },
};

// Pipe commands (accept input from previous command or argument)
const PIPE_COMMANDS: Record<string, { fn: (input: string) => Promise<string>; desc: string }> = {
  xc: { 
    fn: async (text: string) => {
      if (!text) return 'Error: Nothing to copy';
      await navigator.clipboard.writeText(text);
      return `Copied to clipboard: ${text}`;
    }, 
    desc: 'Copy input to clipboard' 
  },
  xp: { 
    fn: async () => {
      try {
        const text = await navigator.clipboard.readText();
        return text || '(empty clipboard)';
      } catch {
        return 'Error: Unable to read clipboard (permission denied)';
      }
    }, 
    desc: 'Paste from clipboard' 
  },
  xl: {
    fn: async (text: string) => {
      if (!text) return 'Error: No input to transform';
      return text.toLowerCase();
    },
    desc: 'Convert to lowercase'
  },
  xu: {
    fn: async (text: string) => {
      if (!text) return 'Error: No input to transform';
      return text.toUpperCase();
    },
    desc: 'Convert to uppercase'
  },
  xt: {
    fn: async (text: string) => {
      if (!text) return 'Error: No input to transform';
      return text.trim();
    },
    desc: 'Trim whitespace'
  },
  xr: {
    fn: async (text: string) => {
      if (!text) return 'Error: No input to transform';
      return text.split('').reverse().join('');
    },
    desc: 'Reverse string'
  },
};

const WELCOME_MESSAGE_DESKTOP = `
+--------------------------------------------------+
|                                                  |
|   DDDDD   EEEEE  V     V  X   X  Y   Y           |
|   D    D  E      V     V   X X    Y Y            |
|   D    D  EEEE   V     V    X      Y             |
|   D    D  E       V   V    X X     Y             |
|   DDDDD   EEEEE    VVV    X   X    Y             |
|                                                  |
|   Developer Micro-Tools Console v1.0             |
|   Type 'help' for available commands             |
|                                                  |
+--------------------------------------------------+`;

const WELCOME_MESSAGE_MOBILE = `
+------------------------+
|  DEVXY Terminal v1.0   |
|  Type 'help' for cmds  |
+------------------------+`;

const HISTORY_STORAGE_KEY = 'devxy-command-history';
const MAX_STORED_HISTORY = 100;

const loadHistoryFromStorage = (): { cmd: string; timestamp: Date }[] => {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((entry: { cmd: string; timestamp: string }) => ({
        cmd: entry.cmd,
        timestamp: new Date(entry.timestamp),
      }));
    }
  } catch (e) {
    console.error('Failed to load history from storage:', e);
  }
  return [];
};

const saveHistoryToStorage = (history: { cmd: string; timestamp: Date }[]) => {
  try {
    const toStore = history.slice(-MAX_STORED_HISTORY).map(entry => ({
      cmd: entry.cmd,
      timestamp: entry.timestamp.toISOString(),
    }));
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.error('Failed to save history to storage:', e);
  }
};

export function Terminal() {
  const isMobile = useIsMobile();
  const { tools: embeddedTools } = useEmbeddedTools();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [history, setHistory] = useState<{ cmd: string; timestamp: Date }[]>(() => loadHistoryFromStorage());
  const [resultHistory, setResultHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [showVisualPanel, setShowVisualPanel] = useState(false);
  const [activeVisualTool, setActiveVisualTool] = useState<string | null>(null);
  const [visualToolArg, setVisualToolArg] = useState<string | undefined>(undefined);
  const [activeInterpreter, setActiveInterpreter] = useState<string | null>(null);
  const [activeEmbeddedTool, setActiveEmbeddedTool] = useState<EmbeddedTool | null>(null);
  const [panelMode, setPanelMode] = useState<'visual' | 'interpreter' | 'embed'>('visual');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const visualPanelRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(1);
  const resultHistoryRef = useRef<string[]>([]);
  const hasInitialized = useRef(false);

  // Set initial welcome message based on screen size
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const welcomeMessage = isMobile ? WELCOME_MESSAGE_MOBILE : WELCOME_MESSAGE_DESKTOP;
      setOutput([{ id: 0, type: 'welcome', content: welcomeMessage }]);
    }
  }, [isMobile]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ctrl+E to toggle focus between terminal and visual panel
      if (e.key === 'e' && e.ctrlKey) {
        e.preventDefault();
        if (showVisualPanel) {
          // Check if focus is in visual panel
          const isInVisualPanel = visualPanelRef.current?.contains(document.activeElement);
          if (isInVisualPanel) {
            // Focus back to terminal input
            inputRef.current?.focus();
          } else {
            // Focus first input in visual panel
            const firstInput = visualPanelRef.current?.querySelector('input, textarea, select') as HTMLElement;
            if (firstInput) {
              firstInput.focus();
            }
          }
        } else {
          // Open visual panel and focus it
          setShowVisualPanel(true);
          setTimeout(() => {
            const firstInput = visualPanelRef.current?.querySelector('input, textarea, select') as HTMLElement;
            if (firstInput) {
              firstInput.focus();
            }
          }, 100);
        }
        return;
      }
      
      // '/' shortcut to open command palette (only if not in input)
      if (document.activeElement === inputRef.current) return;
      
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowAutocomplete(true);
        setAutocompleteIndex(0);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showVisualPanel]);

  const addOutput = (type: OutputLine['type'], content: string) => {
    setOutput(prev => [...prev, { id: idCounter.current++, type, content, timestamp: new Date() }]);
  };

  const executeCommand = async (cmdStr: string, pipedInput?: string): Promise<string | null> => {
    const trimmed = cmdStr.trim();
    const parts = trimmed.split(/\s+/);
    const baseCmd = parts[0].toLowerCase();
    const argsStr = parts.slice(1).join(' ');
    
    // Check if it's a generator command (r.xxx)
    const genCommand = GENERATOR_COMMANDS[baseCmd];
    if (genCommand) {
      const args = parseArgs(argsStr);
      const results: string[] = [];
      
      for (let i = 0; i < args.number; i++) {
        let result = genCommand.fn();
        // If not formatted and command supports it, remove formatting
        if (!args.formatted && genCommand.supportsFormatted && genCommand.unformat) {
          result = genCommand.unformat(result);
        }
        results.push(result);
      }
      
      return results.join('\n');
    }
    
    // Check if it's a pipe command
    const pipeCommand = PIPE_COMMANDS[baseCmd];
    if (pipeCommand) {
      return await pipeCommand.fn(pipedInput || '');
    }
    
    // Check for latest command
    if (baseCmd === 'latest') {
      const results = resultHistoryRef.current;
      if (results.length === 0) return 'No previous results';
      return results[results.length - 1];
    }
    
    // Check for latest(index, count) pattern
    const latestMatch = baseCmd.match(/^latest\((\d+)(?:,\s*(\d+))?\)$/);
    if (latestMatch) {
      const results = resultHistoryRef.current;
      if (results.length === 0) return 'No previous results';
      
      const index = parseInt(latestMatch[1], 10);
      const count = latestMatch[2] ? parseInt(latestMatch[2], 10) : 1;
      
      // Index 0 = most recent, so we reverse the logic
      const startFromEnd = results.length - 1 - index;
      
      if (startFromEnd < 0) return `Error: Index ${index} out of range (only ${results.length} results available)`;
      
      const selectedResults: string[] = [];
      for (let i = 0; i < count && startFromEnd - i >= 0; i++) {
        selectedResults.push(results[startFromEnd - i]);
      }
      
      return selectedResults.join('\n');
    }
    
    // Check for pipe command with argument: xc(text)
    const argMatch = baseCmd.match(/^(\w+)\((.+)\)$/);
    if (argMatch) {
      const [, cmdName, arg] = argMatch;
      const pipeCmd = PIPE_COMMANDS[cmdName];
      if (pipeCmd) {
        return await pipeCmd.fn(arg);
      }
    }
    
    return null;
  };

  const addResultToHistory = (result: string) => {
    resultHistoryRef.current = [...resultHistoryRef.current, result];
    setResultHistory(prev => [...prev, result]);
  };

  const processCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    
    if (!trimmedCmd) return;

    addOutput('command', `> ${cmd}`);

    const lowerCmd = trimmedCmd.toLowerCase();

    if (lowerCmd === 'help') {
      const genHelpText = Object.entries(GENERATOR_COMMANDS)
        .map(([name, { desc }]) => `  ${name.padEnd(20)} ${desc}`)
        .join('\n');
      const pipeHelpText = Object.entries(PIPE_COMMANDS)
        .map(([name, { desc }]) => `  ${name.padEnd(20)} ${desc}`)
        .join('\n');
      const visualHelpText = Object.entries(VISUAL_TOOLS)
        .map(([name, { description, icon }]) => `  v.${name.padEnd(18)} ${icon} ${description}`)
        .join('\n');
      const embeddedToolsList = getEmbeddedToolsStatic();
      const embedHelpText = embeddedToolsList.length > 0
        ? embeddedToolsList.map((tool) => `  ve.${tool.id.padEnd(17)} 🔗 ${tool.description || tool.name}`).join('\n')
        : '  (none yet - use v.embeds to add)';
      const interpreterHelpText = Object.entries(EMBEDDED_INTERPRETERS)
        .map(([name, { description, icon }]) => `  ei.${name.padEnd(17)} ${icon} ${description}`)
        .join('\n');
      addOutput('info', `Generator commands (r.*):\n\n${genHelpText}\n\nOptions:\n  -f, --formatted      Include formatting (CPF, CNPJ, Titulo)\n  -n, --number <n>     Generate n results (max 100)\n\nPipe commands:\n\n${pipeHelpText}\n\nVisual tools:\n\n${visualHelpText}\n\nEmbedded tools (ve.*):\n\n${embedHelpText}\n\nEmbedded interpreters:\n\n${interpreterHelpText}\n\nHistory:\n\n  latest               Get last command result\n  latest(i)            Get result at index i (0=latest)\n  latest(i,n)          Get n results starting from index i\n  recent               Show last 20 executed commands with timestamps\n  clearhistory         Clear stored command history\n\nUtility:\n\n  clear                Clear the terminal\n  help                 Show this help message\n\nExamples:\n  r.cpf                Generate unformatted CPF\n  r.cpf -f             Generate formatted CPF\n  r.cpf -n 5           Generate 5 unformatted CPFs\n  r.cpf -f -n 3        Generate 3 formatted CPFs\n  r.cpf | xc           Generate CPF and copy to clipboard`);
      return;
    }

    // Recent command - show last 20 commands with timestamps
    if (lowerCmd === 'recent') {
      if (history.length === 0) {
        addOutput('info', 'No commands in history yet.');
        return;
      }
      const recentCmds = history.slice(-20).reverse();
      const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleString();
      };
      
      const output = recentCmds
        .map((entry, i) => `  ${String(i + 1).padStart(2)}. ${formatTime(entry.timestamp).padEnd(12)} ${entry.cmd}`)
        .join('\n');
      
      addOutput('info', `📋 Recent commands (newest first):\n\n${output}`);
      return;
    }

    // Clear history command
    if (lowerCmd === 'clearhistory' || lowerCmd === 'clear-history') {
      clearHistory();
      return;
    }

    // Check for visual tool commands (v.toolname or v.toolname(arg))
    if (lowerCmd.startsWith('v.')) {
      const visualMatch = lowerCmd.match(/^v\.(\w+)(?:\((.+)\))?$/);
      if (visualMatch) {
        const [, toolName, arg] = visualMatch;
        if (VISUAL_TOOLS[toolName]) {
          setActiveVisualTool(toolName);
          setVisualToolArg(arg);
          setPanelMode('visual');
          setShowVisualPanel(true);
          addOutput('info', `📺 Opening visual tool: ${VISUAL_TOOLS[toolName].icon} ${VISUAL_TOOLS[toolName].description}`);
          return;
        }
      }
      addOutput('error', `Visual tool not found: '${cmd}'. Available: ${Object.keys(VISUAL_TOOLS).map(t => 'v.' + t).join(', ')}`);
      return;
    }

    // Check for embedded tool commands (ve.toolname)
    if (lowerCmd.startsWith('ve.')) {
      const embedMatch = lowerCmd.match(/^ve\.(\w+)$/);
      if (embedMatch) {
        const [, toolId] = embedMatch;
        const embeddedToolsList = getEmbeddedToolsStatic();
        const embeddedTool = embeddedToolsList.find(t => t.id === toolId);
        if (embeddedTool) {
          setActiveEmbeddedTool(embeddedTool);
          setPanelMode('embed');
          setShowVisualPanel(true);
          addOutput('info', `🔗 Opening embedded tool: ${embeddedTool.name}${embeddedTool.description ? ` - ${embeddedTool.description}` : ''}`);
          return;
        }
      }
      const availableEmbeds = getEmbeddedToolsStatic().map(t => 've.' + t.id).join(', ');
      addOutput('error', `Embedded tool not found: '${cmd}'.${availableEmbeds ? ` Available: ${availableEmbeds}` : ' No embeds created yet. Use v.embeds to add one.'}`);
      return;
    }

    // Check for embedded interpreter commands (ei.language)
    if (lowerCmd.startsWith('ei.')) {
      const interpreterMatch = lowerCmd.match(/^ei\.(\w+)$/);
      if (interpreterMatch) {
        const [, langName] = interpreterMatch;
        if (EMBEDDED_INTERPRETERS[langName]) {
          setActiveInterpreter(langName);
          setPanelMode('interpreter');
          setShowVisualPanel(true);
          addOutput('info', `🖥️ Opening interpreter: ${EMBEDDED_INTERPRETERS[langName].icon} ${EMBEDDED_INTERPRETERS[langName].description}`);
          return;
        }
      }
      addOutput('error', `Interpreter not found: '${cmd}'. Available: ${Object.keys(EMBEDDED_INTERPRETERS).map(t => 'ei.' + t).join(', ')}`);
      return;
    }

    if (lowerCmd === 'clear') {
      setOutput([]);
      return;
    }

    // Check for piped commands (e.g., rndCpf | xc)
    if (trimmedCmd.includes('|')) {
      const parts = trimmedCmd.split('|').map(p => p.trim());
      let result: string | null = null;
      
      for (const part of parts) {
        result = await executeCommand(part, result || undefined);
        if (result === null) {
          addOutput('error', `Command not found: '${part}'. Type 'help' for available commands.`);
          return;
        }
      }
      
      if (result) {
        addOutput('result', result);
        addResultToHistory(result);
      }
      return;
    }

    // Single command execution
    const result = await executeCommand(trimmedCmd);
    if (result !== null) {
      addOutput('result', result);
      addResultToHistory(result);
    } else {
      addOutput('error', `Command not found: '${cmd}'. Type 'help' for available commands.`);
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      const newHistory = [...history, { cmd: input, timestamp: new Date() }];
      setHistory(newHistory);
      saveHistoryToStorage(newHistory);
      setHistoryIndex(-1);
      processCommand(input);
      setInput('');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    addOutput('info', '🗑️ Command history cleared.');
  };

  // Fuzzy match function - returns score (higher = better) or -1 if no match
  const fuzzyMatch = (query: string, target: string): number => {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    
    // Exact match - highest priority
    if (t === q) return 100;
    
    // Prefix match - high priority
    if (t.startsWith(q)) return 90 + (q.length / t.length) * 10;
    
    // Fuzzy match - check if all chars appear in order
    let queryIndex = 0;
    let score = 0;
    let lastMatchIndex = -1;
    
    for (let i = 0; i < t.length && queryIndex < q.length; i++) {
      if (t[i] === q[queryIndex]) {
        // Bonus for consecutive characters
        if (lastMatchIndex === i - 1) score += 5;
        // Bonus for matching at word boundaries
        if (i === 0 || !t[i - 1].match(/[a-z]/i)) score += 3;
        score += 1;
        lastMatchIndex = i;
        queryIndex++;
      }
    }
    
    // All query characters must be found
    if (queryIndex !== q.length) return -1;
    
    return score;
  };

  // Get indices of matched characters for highlighting
  const getMatchIndices = (query: string, target: string): number[] => {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    const indices: number[] = [];
    
    let queryIndex = 0;
    for (let i = 0; i < t.length && queryIndex < q.length; i++) {
      if (t[i] === q[queryIndex]) {
        indices.push(i);
        queryIndex++;
      }
    }
    
    return queryIndex === q.length ? indices : [];
  };

  // Render command name with highlighted matched characters
  const renderHighlightedName = (name: string, query: string) => {
    if (!query) return <span>{name}</span>;
    
    const indices = new Set(getMatchIndices(query, name));
    
    return (
      <span>
        {name.split('').map((char, i) => (
          <span
            key={i}
            className={indices.has(i) ? 'text-primary font-bold' : ''}
          >
            {char}
          </span>
        ))}
      </span>
    );
  };

  // Get current search query for highlighting
  const getCurrentQuery = () => {
    const pipeIndex = input.lastIndexOf('|');
    return pipeIndex >= 0 ? input.slice(pipeIndex + 1).trim() : input.trim();
  };

  const getAllCommands = () => {
    const embeddedToolsList = getEmbeddedToolsStatic();
    return [
      ...Object.keys(GENERATOR_COMMANDS).map(cmd => ({ name: cmd, type: 'generator' as const, desc: GENERATOR_COMMANDS[cmd].desc })),
      ...Object.keys(PIPE_COMMANDS).map(cmd => ({ name: cmd, type: 'pipe' as const, desc: PIPE_COMMANDS[cmd].desc })),
      ...Object.keys(VISUAL_TOOLS).map(tool => ({ name: `v.${tool}`, type: 'visual' as const, desc: VISUAL_TOOLS[tool].description })),
      ...embeddedToolsList.map(tool => ({ name: `ve.${tool.id}`, type: 'embed' as const, desc: tool.description || tool.name })),
      ...Object.keys(EMBEDDED_INTERPRETERS).map(lang => ({ name: `ei.${lang}`, type: 'interpreter' as const, desc: EMBEDDED_INTERPRETERS[lang].description })),
      { name: 'latest', type: 'history' as const, desc: 'Get last command result' },
      { name: 'recent', type: 'history' as const, desc: 'Show last 20 commands with timestamps' },
      { name: 'help', type: 'utility' as const, desc: 'Show available commands' },
      { name: 'clear', type: 'utility' as const, desc: 'Clear the terminal' },
    ];
  };

  const getFilteredCommands = () => {
    const allCommands = getAllCommands();
    
    // Check if we're after a pipe
    const pipeIndex = input.lastIndexOf('|');
    const currentPart = pipeIndex >= 0 ? input.slice(pipeIndex + 1).trim() : input.trim();
    
    if (!currentPart) return allCommands;
    
    // Use fuzzy matching and sort by score
    return allCommands
      .map(cmd => ({ ...cmd, score: fuzzyMatch(currentPart, cmd.name) }))
      .filter(cmd => cmd.score >= 0)
      .sort((a, b) => b.score - a.score);
  };

  const getAutocompleteSuggestions = (partial: string): string[] => {
    if (!partial) return [];
    
    // Check if we're after a pipe
    const pipeIndex = partial.lastIndexOf('|');
    const currentPart = pipeIndex >= 0 ? partial.slice(pipeIndex + 1).trim() : partial;
    const prefix = pipeIndex >= 0 ? partial.slice(0, pipeIndex + 1) + ' ' : '';
    
    const embeddedToolsList = getEmbeddedToolsStatic();
    const allCommands = [...Object.keys(GENERATOR_COMMANDS), ...Object.keys(PIPE_COMMANDS), ...Object.keys(VISUAL_TOOLS).map(t => `v.${t}`), ...embeddedToolsList.map(t => `ve.${t.id}`), ...Object.keys(EMBEDDED_INTERPRETERS).map(t => `ei.${t}`), 'latest', 'help', 'clear'];
    
    // Use fuzzy matching and sort by score
    const matches = allCommands
      .map(cmd => ({ name: cmd, score: fuzzyMatch(currentPart, cmd) }))
      .filter(cmd => cmd.score >= 0)
      .sort((a, b) => b.score - a.score);
    
    return matches.map(match => prefix + match.name);
  };

  const getGhostText = (): string => {
    const trimmed = input.trim();
    if (!trimmed || showAutocomplete) return '';
    
    const suggestions = getAutocompleteSuggestions(trimmed);
    if (suggestions.length >= 1) {
      return suggestions[0].slice(trimmed.length);
    }
    return '';
  };

  const selectAutocompleteItem = (commandName: string) => {
    const pipeIndex = input.lastIndexOf('|');
    const prefix = pipeIndex >= 0 ? input.slice(0, pipeIndex + 1) + ' ' : '';
    setInput(prefix + commandName);
    setShowAutocomplete(false);
    setAutocompleteIndex(0);
    inputRef.current?.focus();
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setHistoryIndex(-1);
    
    // Show autocomplete when typing (or keep showing if already open with empty input)
    const pipeIndex = value.lastIndexOf('|');
    const currentPart = pipeIndex >= 0 ? value.slice(pipeIndex + 1).trim() : value.trim();
    
    if (currentPart.length > 0) {
      setShowAutocomplete(true);
      setAutocompleteIndex(0);
    } else if (!showAutocomplete) {
      // Only hide if not already showing (allows "/" shortcut to keep it open)
      setShowAutocomplete(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const filteredCommands = getFilteredCommands();
    
    if (e.key === 'Enter') {
      if (showAutocomplete && filteredCommands.length > 0) {
        e.preventDefault();
        selectAutocompleteItem(filteredCommands[autocompleteIndex].name);
      } else {
        setShowAutocomplete(false);
        handleSubmit();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (showAutocomplete && filteredCommands.length > 0) {
        selectAutocompleteItem(filteredCommands[autocompleteIndex].name);
      } else {
        const suggestions = getAutocompleteSuggestions(input.trim());
        if (suggestions.length === 1) {
          setInput(suggestions[0]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setAutocompleteIndex(0);
    } else if (e.key === '/') {
      // Show all commands when typing "/" on empty input or after pipe
      const trimmedInput = input.trim();
      if (trimmedInput === '' || trimmedInput.endsWith('|')) {
        e.preventDefault();
        setShowAutocomplete(true);
        setAutocompleteIndex(0);
      }
    } else if (e.key === 'ArrowUp') {
      if (showAutocomplete && filteredCommands.length > 0) {
        e.preventDefault();
        const newIndex = autocompleteIndex > 0 ? autocompleteIndex - 1 : filteredCommands.length - 1;
        setAutocompleteIndex(newIndex);
        // Scroll into view
        setTimeout(() => {
          const item = autocompleteRef.current?.querySelector(`[data-index="${newIndex}"]`);
          item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
      } else {
        e.preventDefault();
        if (history.length > 0) {
          const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(history[newIndex].cmd);
        }
      }
    } else if (e.key === 'ArrowDown') {
      if (showAutocomplete && filteredCommands.length > 0) {
        e.preventDefault();
        const newIndex = autocompleteIndex < filteredCommands.length - 1 ? autocompleteIndex + 1 : 0;
        setAutocompleteIndex(newIndex);
        // Scroll into view
        setTimeout(() => {
          const item = autocompleteRef.current?.querySelector(`[data-index="${newIndex}"]`);
          item?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
      } else {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= history.length) {
            setHistoryIndex(-1);
            setInput('');
          } else {
            setHistoryIndex(newIndex);
            setInput(history[newIndex].cmd);
          }
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const getLineClass = (type: OutputLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-terminal-prompt';
      case 'result':
        return 'text-terminal-success terminal-glow';
      case 'error':
        return 'text-terminal-error';
      case 'info':
        return 'text-terminal-info';
      case 'welcome':
        return 'text-primary terminal-glow-subtle';
      default:
        return 'text-foreground';
    }
  };

  // Panel content component to reuse in both desktop panel and mobile drawer
  const PanelContent = () => (
    <div 
      ref={!isMobile ? visualPanelRef : undefined}
      className="flex flex-col h-full"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }}
    >
      {/* Panel header - only show on desktop, mobile uses drawer header */}
      {!isMobile && (
        <div className="flex-shrink-0 border-b border-border/50 px-4 py-2 flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-2">
            {panelMode === 'interpreter' ? (
              <TerminalIcon className="w-4 h-4 text-yellow-400" />
            ) : panelMode === 'embed' ? (
              <span className="text-base">🔗</span>
            ) : (
              <LayoutGrid className="w-4 h-4 text-primary" />
            )}
            <span className="text-sm font-medium text-foreground">
              {panelMode === 'interpreter' ? 'Interpreter' : panelMode === 'embed' ? 'Embedded Tool' : 'Visual Tools'}
            </span>
            {renderToolSelector()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowVisualPanel(false);
            }}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Panel body */}
      <div className="flex-1 overflow-auto">
        {panelMode === 'embed' && activeEmbeddedTool ? (
          <EmbedViewer 
            url={activeEmbeddedTool.url} 
            name={activeEmbeddedTool.name} 
            description={activeEmbeddedTool.description}
          />
        ) : panelMode === 'interpreter' && activeInterpreter && EMBEDDED_INTERPRETERS[activeInterpreter] ? (
          (() => {
            const InterpreterComponent = EMBEDDED_INTERPRETERS[activeInterpreter].component;
            return <InterpreterComponent />;
          })()
        ) : panelMode === 'visual' && activeVisualTool && VISUAL_TOOLS[activeVisualTool] ? (
          (() => {
            const ToolComponent = VISUAL_TOOLS[activeVisualTool].component;
            return <ToolComponent initialValue={visualToolArg} />;
          })()
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <LayoutGrid className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Tool Active</h3>
            <p className="text-sm text-muted-foreground/70 mb-6">
              Run a command to open a tool here
            </p>
            <div className="space-y-4 w-full max-w-xs">
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Visual Tools</h4>
                <div className="space-y-2">
                  {Object.entries(VISUAL_TOOLS).map(([name, tool]) => (
                    <button
                      key={name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVisualTool(name);
                        setVisualToolArg(undefined);
                        setPanelMode('visual');
                        addOutput('command', `> v.${name}`);
                        addOutput('info', `📺 Opening visual tool: ${tool.icon} ${tool.description}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-left transition-colors"
                    >
                      <span className="text-xl">{tool.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-foreground">v.{name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {embeddedTools.length > 0 && (
                <div>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Embedded Tools</h4>
                  <div className="space-y-2">
                    {embeddedTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmbeddedTool(tool);
                          setPanelMode('embed');
                          addOutput('command', `> ve.${tool.id}`);
                          addOutput('info', `🔗 Opening embedded tool: ${tool.name}${tool.description ? ` - ${tool.description}` : ''}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-left transition-colors"
                      >
                        <span className="text-xl">🔗</span>
                        <div>
                          <div className="text-sm font-medium text-foreground">ve.{tool.id}</div>
                          <div className="text-xs text-muted-foreground">{tool.description || tool.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Interpreters</h4>
                <div className="space-y-2">
                  {Object.entries(EMBEDDED_INTERPRETERS).map(([name, interp]) => (
                    <button
                      key={name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInterpreter(name);
                        setPanelMode('interpreter');
                        addOutput('command', `> ei.${name}`);
                        addOutput('info', `🖥️ Opening interpreter: ${interp.icon} ${interp.description}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-left transition-colors"
                    >
                      <span className="text-xl">{interp.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-foreground">ei.{name}</div>
                        <div className="text-xs text-muted-foreground">{interp.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Tool selector dropdown - unified for visual tools, embedded tools, and interpreters
  const renderToolSelector = () => {
    const currentValue = panelMode === 'interpreter' 
      ? (activeInterpreter ? `ei.${activeInterpreter}` : '')
      : panelMode === 'embed'
        ? (activeEmbeddedTool ? `ve.${activeEmbeddedTool.id}` : '')
        : (activeVisualTool ? `v.${activeVisualTool}` : '');

    const embeddedToolsList = getEmbeddedToolsStatic();

    return (
      <select
        value={currentValue}
        onChange={(e) => {
          e.stopPropagation();
          const value = e.target.value;
          
          if (value.startsWith('ei.')) {
            const lang = value.slice(3);
            if (EMBEDDED_INTERPRETERS[lang]) {
              setActiveInterpreter(lang);
              setPanelMode('interpreter');
              addOutput('command', `> ei.${lang}`);
              addOutput('info', `🖥️ Opening interpreter: ${EMBEDDED_INTERPRETERS[lang].icon} ${EMBEDDED_INTERPRETERS[lang].description}`);
            }
          } else if (value.startsWith('ve.')) {
            const toolId = value.slice(3);
            const embeddedTool = embeddedToolsList.find(t => t.id === toolId);
            if (embeddedTool) {
              setActiveEmbeddedTool(embeddedTool);
              setPanelMode('embed');
              addOutput('command', `> ve.${toolId}`);
              addOutput('info', `🔗 Opening embedded tool: ${embeddedTool.name}${embeddedTool.description ? ` - ${embeddedTool.description}` : ''}`);
            }
          } else if (value.startsWith('v.')) {
            const tool = value.slice(2);
            if (VISUAL_TOOLS[tool]) {
              setActiveVisualTool(tool);
              setVisualToolArg(undefined);
              setPanelMode('visual');
              addOutput('command', `> v.${tool}`);
              addOutput('info', `📺 Opening visual tool: ${VISUAL_TOOLS[tool].icon} ${VISUAL_TOOLS[tool].description}`);
            }
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={`text-xs px-2 py-1 rounded border outline-none cursor-pointer transition-colors ${
          panelMode === 'interpreter'
            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
            : panelMode === 'embed'
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30'
              : 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30'
        }`}
      >
        {!currentValue && <option value="">Select...</option>}
        <optgroup label="Visual Tools" className="bg-card text-foreground">
          {Object.entries(VISUAL_TOOLS).map(([key, tool]) => (
            <option key={`v.${key}`} value={`v.${key}`} className="bg-card text-foreground">
              {tool.icon} v.{key}
            </option>
          ))}
        </optgroup>
        {embeddedToolsList.length > 0 && (
          <optgroup label="Embedded Tools" className="bg-card text-foreground">
            {embeddedToolsList.map((tool) => (
              <option key={`ve.${tool.id}`} value={`ve.${tool.id}`} className="bg-card text-foreground">
                🔗 ve.{tool.id}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Interpreters" className="bg-card text-foreground">
          {Object.entries(EMBEDDED_INTERPRETERS)
            .filter(([key], _, arr) => {
              if (key === 'js' && arr.some(([k]) => k === 'javascript')) return false;
              return true;
            })
            .map(([key, interp]) => (
              <option key={`ei.${key}`} value={`ei.${key}`} className="bg-card text-foreground">
                {interp.icon} ei.{key}
              </option>
            ))}
        </optgroup>
      </select>
    );
  };

  return (
    <div 
      className="flex h-screen bg-background"
      onClick={handleContainerClick}
    >
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-10 opacity-50" />
      
      {/* Main terminal area */}
      <div className={`flex flex-col cursor-text transition-all duration-300 overflow-visible ${showVisualPanel && !isMobile ? 'w-1/2' : 'w-full'}`}>
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border/50 px-3 md:px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-terminal-error opacity-80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-terminal-warning opacity-80" />
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-terminal-success opacity-80" />
              </div>
              <span className="text-muted-foreground text-xs md:text-sm truncate">
                {isMobile ? 'devxy ~' : 'devxy@terminal ~ '}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowVisualPanel(!showVisualPanel);
              }}
              className={`p-2 rounded-md transition-colors ${
                showVisualPanel 
                  ? 'bg-primary/20 text-primary' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Toggle visual tools panel"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Output area */}
        <div 
          ref={outputRef}
          className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1"
        >
          {output.map((line) => (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-all text-xs md:text-sm leading-relaxed animate-fadeIn ${getLineClass(line.type)}`}
            >
              {line.content}
            </pre>
          ))}
        </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm relative overflow-visible">
        {/* Discord-style floating autocomplete */}
        {showAutocomplete && (() => {
          const filteredCmds = getFilteredCommands();
          if (filteredCmds.length === 0) return null;
          
          // Get recent unique commands (last 5, excluding duplicates)
          const recentCommands: typeof filteredCmds = [];
          const seenRecent = new Set<string>();
          for (let i = history.length - 1; i >= 0 && recentCommands.length < 5; i--) {
            const cmd = history[i].cmd.toLowerCase().split(/\s+/)[0]; // Get base command
            if (!seenRecent.has(cmd)) {
              const matchingCmd = filteredCmds.find(c => c.name.toLowerCase() === cmd);
              if (matchingCmd) {
                recentCommands.push({ ...matchingCmd, type: 'recent' as any });
                seenRecent.add(cmd);
              }
            }
          }
          
          // Group commands by category
          const groups = {
            recent: { label: 'Recent', commands: recentCommands },
            generator: { label: 'Generators', commands: filteredCmds.filter(c => c.type === 'generator' && !seenRecent.has(c.name.toLowerCase())) },
            pipe: { label: 'Pipes', commands: filteredCmds.filter(c => c.type === 'pipe' && !seenRecent.has(c.name.toLowerCase())) },
            visual: { label: 'Visual Tools', commands: filteredCmds.filter(c => c.type === 'visual' && !seenRecent.has(c.name.toLowerCase())) },
            embed: { label: 'Embedded Tools', commands: filteredCmds.filter(c => c.type === 'embed' && !seenRecent.has(c.name.toLowerCase())) },
            interpreter: { label: 'Interpreters', commands: filteredCmds.filter(c => c.type === 'interpreter' && !seenRecent.has(c.name.toLowerCase())) },
            history: { label: 'History', commands: filteredCmds.filter(c => c.type === 'history' && !seenRecent.has(c.name.toLowerCase())) },
            utility: { label: 'Utility', commands: filteredCmds.filter(c => c.type === 'utility' && !seenRecent.has(c.name.toLowerCase())) },
          };
          
          // Build flat list for index tracking
          let globalIndex = 0;
          
          return (
            <div 
              ref={autocompleteRef}
              className="absolute bottom-full left-0 right-0 mb-1 mx-4 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto"
            >
              <div className="p-2">
                {Object.entries(groups).map(([type, group]) => {
                  if (group.commands.length === 0) return null;
                  
                  const groupStartIndex = globalIndex;
                  const groupItems = group.commands.map((cmd, i) => {
                    const currentIndex = groupStartIndex + i;
                    return (
                      <button
                        key={cmd.name}
                        data-index={currentIndex}
                        onClick={() => selectAutocompleteItem(cmd.name)}
                        onMouseEnter={() => setAutocompleteIndex(currentIndex)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                          currentIndex === autocompleteIndex 
                            ? 'bg-primary/20 text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          type === 'recent' ? 'bg-blue-500/20 text-blue-400' :
                          type === 'generator' ? 'bg-terminal-success/20 text-terminal-success' :
                          type === 'pipe' ? 'bg-primary/20 text-primary' :
                          type === 'visual' ? 'bg-purple-500/20 text-purple-400' :
                          type === 'embed' ? 'bg-cyan-500/20 text-cyan-400' :
                          type === 'interpreter' ? 'bg-yellow-500/20 text-yellow-400' :
                          type === 'history' ? 'bg-terminal-warning/20 text-terminal-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {type === 'recent' ? '★' :
                           type === 'generator' ? 'GEN' : 
                           type === 'pipe' ? 'PIPE' : 
                           type === 'visual' ? 'VIS' :
                           type === 'embed' ? 'EMBED' :
                           type === 'interpreter' ? 'LANG' :
                           type === 'history' ? 'HIST' : 'UTIL'}
                        </span>
                        <span className="font-medium text-sm">{renderHighlightedName(cmd.name, getCurrentQuery())}</span>
                        <span className="text-xs text-muted-foreground flex-1 truncate">{cmd.desc}</span>
                      </button>
                    );
                  });
                  
                  globalIndex += group.commands.length;
                  
                  return (
                    <div key={type}>
                      <div className="text-xs text-muted-foreground px-2 py-1 uppercase tracking-wide font-semibold mt-1 first:mt-0">
                        {group.label}
                      </div>
                      {groupItems}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
        
        <div className="flex items-center px-3 md:px-4 py-3 gap-2">
          <span className="text-terminal-prompt font-bold">❯</span>
          <div className="flex-1 relative">
            {/* Ghost text layer */}
            <div className="absolute inset-0 pointer-events-none flex items-center">
              <span className="text-transparent">{input}</span>
              <span className="text-muted-foreground/40">{getGhostText()}</span>
            </div>
            {/* Actual input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                // Reset autocomplete index on focus
                setAutocompleteIndex(0);
              }}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
              className="w-full bg-transparent outline-none text-foreground caret-primary placeholder:text-muted-foreground/50 relative z-10 text-sm"
              placeholder="Type a command... (press / for commands)"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          {/* Mobile FAB inline */}
          {isMobile && (
            <MobileFAB
              onRunCommand={(cmd) => {
                setHistory(prev => [...prev, { cmd, timestamp: new Date() }]);
                processCommand(cmd);
              }}
              onOpenTool={(tool) => {
                setActiveVisualTool(tool);
                setVisualToolArg(undefined);
                setPanelMode('visual');
                setShowVisualPanel(true);
                addOutput('command', `> v.${tool}`);
                addOutput('info', `📺 Opening visual tool: ${VISUAL_TOOLS[tool].icon} ${VISUAL_TOOLS[tool].description}`);
              }}
              onOpenInterpreter={(lang) => {
                setActiveInterpreter(lang);
                setPanelMode('interpreter');
                setShowVisualPanel(true);
                addOutput('command', `> ei.${lang}`);
                addOutput('info', `🖥️ Opening interpreter: ${EMBEDDED_INTERPRETERS[lang].icon} ${EMBEDDED_INTERPRETERS[lang].description}`);
              }}
            />
          )}
          {!isMobile && <span className="w-2 h-5 bg-primary cursor-blink" />}
        </div>
        
        {/* Quick commands bar - simplified for mobile */}
        <div className="border-t border-border/30 px-2 md:px-4 py-2 flex gap-1.5 md:gap-2 flex-wrap overflow-x-auto">
          {Object.keys(GENERATOR_COMMANDS).slice(0, isMobile ? 4 : undefined).map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setHistory(prev => [...prev, { cmd, timestamp: new Date() }]);
                processCommand(cmd);
                inputRef.current?.focus();
              }}
              className="text-xs px-1.5 md:px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-primary/50 whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
          {!isMobile && <span className="text-muted-foreground/50">|</span>}
          {Object.keys(PIPE_COMMANDS).slice(0, isMobile ? 3 : undefined).map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                const currentInput = input.trim();
                if (currentInput && !currentInput.includes('|')) {
                  const fullCmd = `${currentInput} | ${cmd}`;
                  setInput('');
                  setHistory(prev => [...prev, { cmd: fullCmd, timestamp: new Date() }]);
                  processCommand(fullCmd);
                } else {
                  setHistory(prev => [...prev, { cmd, timestamp: new Date() }]);
                  processCommand(cmd);
                }
                inputRef.current?.focus();
              }}
              className="text-xs px-1.5 md:px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary transition-colors border border-primary/30 hover:border-primary/50 whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
        </div>
        </div>

        {/* Status bar - simplified for mobile */}
        <footer className="flex-shrink-0 border-t border-border/30 px-3 md:px-4 py-1 text-xs text-muted-foreground flex justify-between">
          <span className="truncate">
            {isMobile ? 'Tab • ↑↓ • Tools ↗' : '/ Commands • ↑↓ Navigate • Tab/Enter Select • Esc Close • Ctrl+L Clear • Ctrl+E Toggle Panel'}
          </span>
          <span>v1.0.0</span>
        </footer>
      </div>

      {/* Visual Tools Panel - Desktop: Side panel, Mobile: Bottom sheet */}
      {isMobile ? (
        <Drawer open={showVisualPanel} onOpenChange={setShowVisualPanel}>
          <DrawerContent className="h-[85vh] bg-card">
            <DrawerHeader className="border-b border-border/50 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {panelMode === 'interpreter' ? (
                    <TerminalIcon className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <LayoutGrid className="w-4 h-4 text-primary" />
                  )}
                  <DrawerTitle className="text-sm font-medium">
                    {panelMode === 'interpreter' ? 'Interpreter' : 'Visual Tools'}
                  </DrawerTitle>
                  {renderToolSelector()}
                </div>
                <DrawerClose asChild>
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-auto">
              <PanelContent />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        showVisualPanel && (
          <div className="w-1/2 border-l border-border/50 flex flex-col bg-card/30">
            <PanelContent />
          </div>
        )
      )}
    </div>
  );
}
