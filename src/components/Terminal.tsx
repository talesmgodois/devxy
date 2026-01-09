import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { generateCPF, generateCNPJ, generateTituloEleitor, generateUserName, generateNickName, generateEmail } from '@/utils/generators';

interface OutputLine {
  id: number;
  type: 'command' | 'result' | 'error' | 'info' | 'welcome';
  content: string;
  timestamp?: Date;
}

const COMMANDS: Record<string, { fn: () => string; desc: string }> = {
  rndcpf: { fn: generateCPF, desc: 'Generate random Brazilian CPF' },
  rndcnpj: { fn: generateCNPJ, desc: 'Generate random Brazilian CNPJ' },
  rndtituloeleitor: { fn: generateTituloEleitor, desc: 'Generate random Brazilian Titulo Eleitoral' },
  rndusername: { fn: generateUserName, desc: 'Generate random username' },
  rndnickname: { fn: generateNickName, desc: 'Generate random nickname' },
  rndemail: { fn: generateEmail, desc: 'Generate random email address' },
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

  const processCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (!trimmedCmd) return;

    addOutput('command', `> ${cmd}`);

    if (trimmedCmd === 'help') {
      const helpText = Object.entries(COMMANDS)
        .map(([name, { desc }]) => `  ${name.padEnd(20)} ${desc}`)
        .join('\n');
      addOutput('info', `Available commands:\n\n${helpText}\n\n  clear                Clear the terminal\n  help                 Show this help message`);
      return;
    }

    if (trimmedCmd === 'clear') {
      setOutput([]);
      return;
    }

    const command = COMMANDS[trimmedCmd];
    if (command) {
      const result = command.fn();
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
    const lower = partial.toLowerCase();
    const allCommands = [...Object.keys(COMMANDS), 'help', 'clear'];
    return allCommands.filter(cmd => cmd.startsWith(lower));
  };

  const getGhostText = (): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    const suggestions = getAutocompleteSuggestions(trimmed);
    if (suggestions.length === 1) {
      return suggestions[0].slice(trimmed.length);
    }
    // If multiple suggestions, show the first one's completion
    if (suggestions.length > 1) {
      return suggestions[0].slice(trimmed.length);
    }
    return '';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = getAutocompleteSuggestions(input.trim());
      if (suggestions.length === 1) {
        setInput(suggestions[0]);
      } else if (suggestions.length > 1) {
        // Find common prefix
        const commonPrefix = suggestions.reduce((prefix, cmd) => {
          while (cmd.indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
          }
          return prefix;
        }, suggestions[0]);
        
        if (commonPrefix.length > input.trim().length) {
          setInput(commonPrefix);
        } else {
          addOutput('info', `Suggestions: ${suggestions.join('  ')}`);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
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
              onChange={(e) => setInput(e.target.value)}
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
          {Object.keys(COMMANDS).map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setInput(cmd);
                inputRef.current?.focus();
              }}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-primary/50"
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
