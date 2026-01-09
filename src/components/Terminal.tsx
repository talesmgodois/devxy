import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { generateCPF, generateCNPJ, generateTituloEleitor, generateUserName, generateNickName, generateEmail } from '@/utils/generators';
import { VISUAL_TOOLS } from './visual-tools';
import { LayoutGrid, X } from 'lucide-react';

interface OutputLine {
  id: number;
  type: 'command' | 'result' | 'error' | 'info' | 'welcome';
  content: string;
  timestamp?: Date;
}

// Generator commands (no input required)
const GENERATOR_COMMANDS: Record<string, { fn: () => string; desc: string }> = {
  rndcpf: { fn: generateCPF, desc: 'Generate random Brazilian CPF' },
  rndcnpj: { fn: generateCNPJ, desc: 'Generate random Brazilian CNPJ' },
  rndtituloeleitor: { fn: generateTituloEleitor, desc: 'Generate random Brazilian Titulo Eleitoral' },
  rndusername: { fn: generateUserName, desc: 'Generate random username' },
  rndnickname: { fn: generateNickName, desc: 'Generate random nickname' },
  rndemail: { fn: generateEmail, desc: 'Generate random email address' },
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

const WELCOME_MESSAGE = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗ ███████╗██╗   ██╗██╗  ██╗██╗   ██╗                 ║
║   ██╔══██╗██╔════╝██║   ██║╚██╗██╔╝╚██╗ ██╔╝                 ║
║   ██║  ██║█████╗  ██║   ██║ ╚███╔╝  ╚████╔╝                  ║
║   ██║  ██║██╔══╝  ╚██╗ ██╔╝ ██╔██╗   ╚██╔╝                   ║
║   ██████╔╝███████╗ ╚████╔╝ ██╔╝ ██╗   ██║                    ║
║   ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝   ╚═╝                    ║
║                                                               ║
║   Developer Micro-Tools Console v1.0                          ║
║   Type 'help' for available commands                          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`;

export function Terminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { id: 0, type: 'welcome', content: WELCOME_MESSAGE },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [resultHistory, setResultHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [showVisualPanel, setShowVisualPanel] = useState(false);
  const [activeVisualTool, setActiveVisualTool] = useState<string | null>(null);
  const [visualToolArg, setVisualToolArg] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const visualPanelRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(1);
  const resultHistoryRef = useRef<string[]>([]);

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
    const trimmedCmd = cmdStr.trim().toLowerCase();
    
    // Check if it's a generator command
    const genCommand = GENERATOR_COMMANDS[trimmedCmd];
    if (genCommand) {
      return genCommand.fn();
    }
    
    // Check if it's a pipe command
    const pipeCommand = PIPE_COMMANDS[trimmedCmd];
    if (pipeCommand) {
      return await pipeCommand.fn(pipedInput || '');
    }
    
    // Check for latest command
    if (trimmedCmd === 'latest') {
      const results = resultHistoryRef.current;
      if (results.length === 0) return 'No previous results';
      return results[results.length - 1];
    }
    
    // Check for latest(index, count) pattern
    const latestMatch = trimmedCmd.match(/^latest\((\d+)(?:,\s*(\d+))?\)$/);
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
    const argMatch = trimmedCmd.match(/^(\w+)\((.+)\)$/);
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
      addOutput('info', `Generator commands:\n\n${genHelpText}\n\nPipe commands:\n\n${pipeHelpText}\n\nVisual tools:\n\n${visualHelpText}\n\nHistory:\n\n  latest               Get last command result\n  latest(i)            Get result at index i (0=latest)\n  latest(i,n)          Get n results starting from index i\n\nUtility:\n\n  clear                Clear the terminal\n  help                 Show this help message\n\nPipe example: rndCpf | xc (copies generated CPF to clipboard)`);
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
          setShowVisualPanel(true);
          addOutput('info', `📺 Opening visual tool: ${VISUAL_TOOLS[toolName].icon} ${VISUAL_TOOLS[toolName].description}`);
          return;
        }
      }
      addOutput('error', `Visual tool not found: '${cmd}'. Available: ${Object.keys(VISUAL_TOOLS).map(t => 'v.' + t).join(', ')}`);
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
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      processCommand(input);
      setInput('');
    }
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
    return [
      ...Object.keys(GENERATOR_COMMANDS).map(cmd => ({ name: cmd, type: 'generator' as const, desc: GENERATOR_COMMANDS[cmd].desc })),
      ...Object.keys(PIPE_COMMANDS).map(cmd => ({ name: cmd, type: 'pipe' as const, desc: PIPE_COMMANDS[cmd].desc })),
      ...Object.keys(VISUAL_TOOLS).map(tool => ({ name: `v.${tool}`, type: 'visual' as const, desc: VISUAL_TOOLS[tool].description })),
      { name: 'latest', type: 'history' as const, desc: 'Get last command result' },
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
    
    const allCommands = [...Object.keys(GENERATOR_COMMANDS), ...Object.keys(PIPE_COMMANDS), ...Object.keys(VISUAL_TOOLS).map(t => `v.${t}`), 'latest', 'help', 'clear'];
    
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
      // Show all commands when typing "/"
      if (input.trim() === '' || input.endsWith('| ') || input.endsWith('|')) {
        e.preventDefault();
        setShowAutocomplete(true);
        setAutocompleteIndex(0);
      }
    } else if (e.key === 'ArrowUp') {
      if (showAutocomplete && filteredCommands.length > 0) {
        e.preventDefault();
        setAutocompleteIndex(prev => prev > 0 ? prev - 1 : filteredCommands.length - 1);
      } else {
        e.preventDefault();
        if (history.length > 0) {
          const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      if (showAutocomplete && filteredCommands.length > 0) {
        e.preventDefault();
        setAutocompleteIndex(prev => prev < filteredCommands.length - 1 ? prev + 1 : 0);
      } else {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= history.length) {
            setHistoryIndex(-1);
            setInput('');
          } else {
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
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

  return (
    <div 
      className="flex h-screen bg-background"
      onClick={handleContainerClick}
    >
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-10 opacity-50" />
      
      {/* Main terminal area */}
      <div className={`flex flex-col cursor-text transition-all duration-300 ${showVisualPanel ? 'w-1/2' : 'w-full'}`}>
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border/50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-terminal-error opacity-80" />
                <div className="w-3 h-3 rounded-full bg-terminal-warning opacity-80" />
                <div className="w-3 h-3 rounded-full bg-terminal-success opacity-80" />
              </div>
              <span className="text-muted-foreground text-sm">devxy@terminal ~ </span>
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
          className="flex-1 overflow-y-auto p-4 space-y-1"
        >
          {output.map((line) => (
            <pre
              key={line.id}
              className={`whitespace-pre-wrap break-all text-sm leading-relaxed animate-fadeIn ${getLineClass(line.type)}`}
            >
              {line.content}
            </pre>
          ))}
        </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm relative">
        {/* Discord-style floating autocomplete */}
        {showAutocomplete && (() => {
          const filteredCmds = getFilteredCommands();
          if (filteredCmds.length === 0) return null;
          
          // Group commands by category
          const groups = {
            generator: { label: 'Generators', commands: filteredCmds.filter(c => c.type === 'generator') },
            pipe: { label: 'Pipes', commands: filteredCmds.filter(c => c.type === 'pipe') },
            visual: { label: 'Visual Tools', commands: filteredCmds.filter(c => c.type === 'visual') },
            history: { label: 'History', commands: filteredCmds.filter(c => c.type === 'history') },
            utility: { label: 'Utility', commands: filteredCmds.filter(c => c.type === 'utility') },
          };
          
          // Build flat list for index tracking
          let globalIndex = 0;
          
          return (
            <div className="absolute bottom-full left-0 right-0 mb-1 mx-4 bg-card border border-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                {Object.entries(groups).map(([type, group]) => {
                  if (group.commands.length === 0) return null;
                  
                  const groupStartIndex = globalIndex;
                  const groupItems = group.commands.map((cmd, i) => {
                    const currentIndex = groupStartIndex + i;
                    return (
                      <button
                        key={cmd.name}
                        onClick={() => selectAutocompleteItem(cmd.name)}
                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                          currentIndex === autocompleteIndex 
                            ? 'bg-primary/20 text-foreground' 
                            : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          type === 'generator' ? 'bg-terminal-success/20 text-terminal-success' :
                          type === 'pipe' ? 'bg-primary/20 text-primary' :
                          type === 'visual' ? 'bg-purple-500/20 text-purple-400' :
                          type === 'history' ? 'bg-terminal-warning/20 text-terminal-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {type === 'generator' ? 'GEN' : 
                           type === 'pipe' ? 'PIPE' : 
                           type === 'visual' ? 'VIS' :
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
        
        <div className="flex items-center px-4 py-3 gap-2">
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
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
              className="w-full bg-transparent outline-none text-foreground caret-primary placeholder:text-muted-foreground/50 relative z-10"
              placeholder="Type a command..."
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <span className="w-2 h-5 bg-primary cursor-blink" />
        </div>
        
        {/* Quick commands bar */}
        <div className="border-t border-border/30 px-4 py-2 flex gap-2 flex-wrap">
          {Object.keys(GENERATOR_COMMANDS).map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setHistory(prev => [...prev, cmd]);
                processCommand(cmd);
                inputRef.current?.focus();
              }}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-primary/50"
            >
              {cmd}
            </button>
          ))}
          <span className="text-muted-foreground/50">|</span>
          {Object.keys(PIPE_COMMANDS).map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                const currentInput = input.trim();
                if (currentInput && !currentInput.includes('|')) {
                  const fullCmd = `${currentInput} | ${cmd}`;
                  setInput('');
                  setHistory(prev => [...prev, fullCmd]);
                  processCommand(fullCmd);
                } else {
                  setHistory(prev => [...prev, cmd]);
                  processCommand(cmd);
                }
                inputRef.current?.focus();
              }}
              className="text-xs px-2 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary transition-colors border border-primary/30 hover:border-primary/50"
            >
              {cmd}
            </button>
          ))}
        </div>
        </div>

        {/* Status bar */}
        <footer className="flex-shrink-0 border-t border-border/30 px-4 py-1 text-xs text-muted-foreground flex justify-between">
          <span>/ Commands • ↑↓ Navigate • Tab/Enter Select • Esc Close • Ctrl+L Clear • Ctrl+E Toggle Panel</span>
          <span>v1.0.0</span>
        </footer>
      </div>

      {/* Visual Tools Panel */}
      {showVisualPanel && (
        <div 
          ref={visualPanelRef}
          className="w-1/2 border-l border-border/50 flex flex-col bg-card/30"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          {/* Visual panel header */}
          <div className="flex-shrink-0 border-b border-border/50 px-4 py-2 flex items-center justify-between bg-card/50">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Visual Tools</span>
              {activeVisualTool && VISUAL_TOOLS[activeVisualTool] && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {VISUAL_TOOLS[activeVisualTool].icon} {activeVisualTool}
                </span>
              )}
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

          {/* Visual tool content */}
          <div className="flex-1 overflow-auto">
            {activeVisualTool && VISUAL_TOOLS[activeVisualTool] ? (
              (() => {
                const ToolComponent = VISUAL_TOOLS[activeVisualTool].component;
                return <ToolComponent initialValue={visualToolArg} />;
              })()
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <LayoutGrid className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Visual Tool Active</h3>
                <p className="text-sm text-muted-foreground/70 mb-6">
                  Run a visual command to open a tool here
                </p>
                <div className="space-y-2">
                  {Object.entries(VISUAL_TOOLS).map(([name, tool]) => (
                    <button
                      key={name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVisualTool(name);
                        setVisualToolArg(undefined);
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
