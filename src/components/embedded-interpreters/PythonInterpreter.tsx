import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface OutputLine {
  id: number;
  type: 'command' | 'result' | 'error' | 'info';
  content: string;
}

// Simple Python interpreter simulation
// In a real app, this would connect to a backend service
const executePython = (code: string): { output: string; isError: boolean } => {
  try {
    // Handle print statements
    const printMatch = code.match(/^print\s*\((.+)\)$/);
    if (printMatch) {
      const arg = printMatch[1].trim();
      // Handle string literals
      if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
        return { output: arg.slice(1, -1), isError: false };
      }
      // Handle f-strings (basic)
      if (arg.startsWith('f"') || arg.startsWith("f'")) {
        return { output: arg.slice(2, -1), isError: false };
      }
      // Try to evaluate as expression
      try {
        const result = evaluateExpression(arg);
        return { output: String(result), isError: false };
      } catch {
        return { output: arg, isError: false };
      }
    }

    // Handle variable assignments
    if (code.includes('=') && !code.includes('==')) {
      return { output: '', isError: false };
    }

    // Handle expressions
    const result = evaluateExpression(code);
    if (result !== undefined) {
      return { output: String(result), isError: false };
    }

    return { output: '', isError: false };
  } catch (e) {
    return { output: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, isError: true };
  }
};

const evaluateExpression = (expr: string): number | string | undefined => {
  const trimmed = expr.trim();
  
  // Handle string literals
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  
  // Handle numeric expressions
  if (/^[\d\s+\-*/().]+$/.test(trimmed)) {
    // Safe eval for math expressions
    const sanitized = trimmed.replace(/[^0-9+\-*/().]/g, '');
    return Function(`"use strict"; return (${sanitized})`)();
  }
  
  // Handle type() function
  const typeMatch = trimmed.match(/^type\((.+)\)$/);
  if (typeMatch) {
    const arg = typeMatch[1].trim();
    if (/^\d+$/.test(arg)) return "<class 'int'>";
    if (/^\d+\.\d+$/.test(arg)) return "<class 'float'>";
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
      return "<class 'str'>";
    }
    if (arg === 'True' || arg === 'False') return "<class 'bool'>";
    if (arg.startsWith('[') && arg.endsWith(']')) return "<class 'list'>";
    if (arg.startsWith('{') && arg.endsWith('}')) return "<class 'dict'>";
    return "<class 'NoneType'>";
  }
  
  // Handle len() function
  const lenMatch = trimmed.match(/^len\((.+)\)$/);
  if (lenMatch) {
    const arg = lenMatch[1].trim();
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
      return arg.length - 2;
    }
    if (arg.startsWith('[') && arg.endsWith(']')) {
      const items = arg.slice(1, -1).split(',').filter(Boolean);
      return items.length;
    }
    return 0;
  }

  // Handle boolean literals
  if (trimmed === 'True') return 'True';
  if (trimmed === 'False') return 'False';
  if (trimmed === 'None') return 'None';

  // Handle list creation
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }

  // Handle range()
  const rangeMatch = trimmed.match(/^list\(range\((\d+)(?:,\s*(\d+))?\)\)$/);
  if (rangeMatch) {
    const start = rangeMatch[2] ? parseInt(rangeMatch[1]) : 0;
    const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(rangeMatch[1]);
    const arr = [];
    for (let i = start; i < end; i++) arr.push(i);
    return `[${arr.join(', ')}]`;
  }

  return undefined;
};

export function PythonInterpreter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { id: 0, type: 'info', content: 'Python 3.11.0 (simulated interpreter)' },
    { id: 1, type: 'info', content: 'Type Python code and press Enter to execute' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(2);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (type: OutputLine['type'], content: string) => {
    if (content) {
      setOutput(prev => [...prev, { id: idCounter.current++, type, content }]);
    }
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addOutput('command', `>>> ${cmd}`);

    // Handle help
    if (trimmed === 'help()' || trimmed === 'help') {
      addOutput('info', `This is a simulated Python interpreter.
Supported features:
  - Arithmetic: 1 + 2, 3 * 4, 10 / 2
  - print(): print("Hello")
  - type(): type(42), type("str")
  - len(): len("hello"), len([1,2,3])
  - Booleans: True, False, None
  - Lists: [1, 2, 3]
  - range(): list(range(5))
  - clear: clear the output`);
      return;
    }

    // Handle clear
    if (trimmed === 'clear' || trimmed === 'clear()') {
      setOutput([]);
      return;
    }

    const { output: result, isError } = executePython(trimmed);
    if (result) {
      addOutput(isError ? 'error' : 'result', result);
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
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

  const getLineClass = (type: OutputLine['type']) => {
    switch (type) {
      case 'command':
        return 'text-terminal-prompt';
      case 'result':
        return 'text-terminal-success';
      case 'error':
        return 'text-terminal-error';
      case 'info':
        return 'text-terminal-info';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-background/50"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output area */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm"
      >
        {output.map((line) => (
          <pre
            key={line.id}
            className={`whitespace-pre-wrap break-all leading-relaxed ${getLineClass(line.type)}`}
          >
            {line.content}
          </pre>
        ))}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border/50 bg-card/50 px-4 py-3">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-terminal-warning font-bold">&gt;&gt;&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground caret-primary placeholder:text-muted-foreground/50 text-sm"
            placeholder="Enter Python code..."
            spellCheck={false}
            autoComplete="off"
          />
          <span className="w-2 h-4 bg-primary cursor-blink" />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 border-t border-border/30 px-4 py-1 text-xs text-muted-foreground flex justify-between">
        <span>↑↓ History • Ctrl+L Clear • Esc Back to terminal</span>
        <span>Python 3.11</span>
      </div>
    </div>
  );
}
