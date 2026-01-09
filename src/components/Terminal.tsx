import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { generateCPF, generateCNPJ, generateTituloEleitor, generateUserName, generateNickName, generateEmail } from '@/utils/generators';

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
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tabIndex, setTabIndex] = useState(-1);
  const [tabSuggestions, setTabSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(1);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

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
      addOutput('info', `Generator commands:\n\n${genHelpText}\n\nPipe commands:\n\n${pipeHelpText}\n\nUtility:\n\n  clear                Clear the terminal\n  help                 Show this help message\n\nPipe example: rndCpf | xc (copies generated CPF to clipboard)`);
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
      }
      return;
    }

    // Single command execution
    const result = await executeCommand(trimmedCmd);
    if (result !== null) {
      addOutput('result', result);
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

  const getAutocompleteSuggestions = (partial: string): string[] => {
    if (!partial) return [];
    
    // Check if we're after a pipe
    const pipeIndex = partial.lastIndexOf('|');
    const currentPart = pipeIndex >= 0 ? partial.slice(pipeIndex + 1).trim() : partial;
    const prefix = pipeIndex >= 0 ? partial.slice(0, pipeIndex + 1) + ' ' : '';
    
    const lower = currentPart.toLowerCase();
    const allCommands = [...Object.keys(GENERATOR_COMMANDS), ...Object.keys(PIPE_COMMANDS), 'help', 'clear'];
    const matches = allCommands.filter(cmd => cmd.startsWith(lower));
    
    return matches.map(match => prefix + match);
  };

  const getGhostText = (): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    
    // If we're cycling through suggestions, show the current one
    if (tabIndex >= 0 && tabSuggestions.length > 0) {
      const currentSuggestion = tabSuggestions[tabIndex];
      return currentSuggestion.slice(trimmed.length);
    }
    
    const suggestions = getAutocompleteSuggestions(trimmed);
    if (suggestions.length >= 1) {
      return suggestions[0].slice(trimmed.length);
    }
    return '';
  };

  const resetTabCycle = () => {
    setTabIndex(-1);
    setTabSuggestions([]);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    resetTabCycle();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      resetTabCycle();
      handleSubmit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const trimmed = input.trim();
      const suggestions = getAutocompleteSuggestions(trimmed);
      
      if (suggestions.length === 0) return;
      
      if (suggestions.length === 1) {
        // Single match - complete it
        setInput(suggestions[0]);
        resetTabCycle();
      } else {
        // Multiple matches - cycle through them zsh-style
        if (tabSuggestions.length === 0 || tabSuggestions.join() !== suggestions.join()) {
          // First Tab press or suggestions changed - start cycling
          setTabSuggestions(suggestions);
          setTabIndex(0);
          setInput(suggestions[0]);
        } else {
          // Continue cycling
          const nextIndex = (tabIndex + 1) % suggestions.length;
          setTabIndex(nextIndex);
          setInput(suggestions[nextIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      resetTabCycle();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      resetTabCycle();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      resetTabCycle();
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
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
    } else {
      // Any other key resets the tab cycle
      resetTabCycle();
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
      className="flex flex-col h-screen bg-background cursor-text"
      onClick={handleContainerClick}
    >
      {/* Scanline effect overlay */}
      <div className="fixed inset-0 scanline pointer-events-none z-10 opacity-50" />
      
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/50 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-terminal-error opacity-80" />
            <div className="w-3 h-3 rounded-full bg-terminal-warning opacity-80" />
            <div className="w-3 h-3 rounded-full bg-terminal-success opacity-80" />
          </div>
          <span className="text-muted-foreground text-sm">devxy@terminal ~ </span>
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
      <div className="flex-shrink-0 border-t border-border/50 bg-card/50 backdrop-blur-sm">
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
        <span>Tab Autocomplete • ↑↓ History • Ctrl+L Clear • Enter Execute</span>
        <span>v1.0.0</span>
      </footer>
    </div>
  );
}
