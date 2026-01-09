import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface OutputLine {
  id: number;
  type: 'command' | 'result' | 'error' | 'info';
  content: string;
}

// JavaScript interpreter using safe eval
const executeJavaScript = (code: string, context: Record<string, unknown>): { output: string; isError: boolean; newContext?: Record<string, unknown> } => {
  try {
    // Handle variable declarations
    const letMatch = code.match(/^(?:let|const|var)\s+(\w+)\s*=\s*(.+)$/);
    if (letMatch) {
      const [, varName, value] = letMatch;
      try {
        const evaluated = evaluateWithContext(value, context);
        const newContext = { ...context, [varName]: evaluated };
        return { output: `${varName} = ${formatOutput(evaluated)}`, isError: false, newContext };
      } catch (e) {
        return { output: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, isError: true };
      }
    }

    // Handle function declarations (simple arrow functions)
    const funcMatch = code.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(\([^)]*\)|[\w]+)\s*=>\s*(.+)$/);
    if (funcMatch) {
      const [, funcName] = funcMatch;
      try {
        const func = evaluateWithContext(code.replace(/^(?:const|let|var)\s+\w+\s*=\s*/, ''), context);
        const newContext = { ...context, [funcName]: func };
        return { output: `[Function: ${funcName}]`, isError: false, newContext };
      } catch (e) {
        return { output: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, isError: true };
      }
    }

    // Handle console.log
    const consoleLogMatch = code.match(/^console\.log\((.+)\)$/);
    if (consoleLogMatch) {
      const args = consoleLogMatch[1];
      const result = evaluateWithContext(args, context);
      return { output: formatOutput(result), isError: false };
    }

    // Evaluate expression
    const result = evaluateWithContext(code, context);
    return { output: formatOutput(result), isError: false };
  } catch (e) {
    return { output: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`, isError: true };
  }
};

const evaluateWithContext = (code: string, context: Record<string, unknown>): unknown => {
  const contextKeys = Object.keys(context);
  const contextValues = Object.values(context);
  
  // Create a function with context variables as parameters
  const fn = new Function(...contextKeys, `"use strict"; return (${code})`);
  return fn(...contextValues);
};

const formatOutput = (value: unknown): string => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return `[Function${value.name ? `: ${value.name}` : ''}]`;
  if (typeof value === 'string') return `"${value}"`;
  if (Array.isArray(value)) return `[${value.map(formatOutput).join(', ')}]`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
};

export function JavaScriptInterpreter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<OutputLine[]>([
    { id: 0, type: 'info', content: 'JavaScript Console (ES6+)' },
    { id: 1, type: 'info', content: 'Type JavaScript code and press Enter to execute' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [context, setContext] = useState<Record<string, unknown>>({});
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

    addOutput('command', `> ${cmd}`);

    // Handle help
    if (trimmed === 'help' || trimmed === 'help()') {
      addOutput('info', `JavaScript Console
Supported features:
  - Variables: let x = 5, const y = "hello"
  - Expressions: 1 + 2, Math.sqrt(16)
  - Arrays: [1, 2, 3].map(x => x * 2)
  - Objects: { name: "John", age: 30 }
  - Arrow functions: const add = (a, b) => a + b
  - console.log(): console.log("Hello")
  - Built-in: Math, JSON, Date, Array methods
  - clear: clear the output`);
      return;
    }

    // Handle clear
    if (trimmed === 'clear' || trimmed === 'clear()') {
      setOutput([]);
      setContext({});
      return;
    }

    const { output: result, isError, newContext } = executeJavaScript(trimmed, context);
    if (newContext) {
      setContext(newContext);
    }
    if (result && result !== 'undefined') {
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
          <span className="text-yellow-400 font-bold">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground caret-primary placeholder:text-muted-foreground/50 text-sm"
            placeholder="Enter JavaScript code..."
            spellCheck={false}
            autoComplete="off"
          />
          <span className="w-2 h-4 bg-primary cursor-blink" />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 border-t border-border/30 px-4 py-1 text-xs text-muted-foreground flex justify-between">
        <span>↑↓ History • Ctrl+L Clear • Esc Back to terminal</span>
        <span>ES6+</span>
      </div>
    </div>
  );
}
