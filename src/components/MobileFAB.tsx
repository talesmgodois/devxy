import { useState } from 'react';
import { Plus, X, Zap, Code, FileJson, Thermometer, Copy, ClipboardPaste } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface MobileFABProps {
  onRunCommand: (cmd: string) => void;
  onOpenTool: (tool: string) => void;
  onOpenInterpreter: (lang: string) => void;
}

export function MobileFAB({ onRunCommand, onOpenTool, onOpenInterpreter }: MobileFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: FABAction[] = [
    {
      id: 'rndcpf',
      icon: <Zap className="w-4 h-4" />,
      label: 'CPF',
      color: 'bg-terminal-success text-terminal-success-foreground',
      onClick: () => {
        onRunCommand('rndcpf');
        setIsOpen(false);
      },
    },
    {
      id: 'copy',
      icon: <Copy className="w-4 h-4" />,
      label: 'Copy',
      color: 'bg-primary text-primary-foreground',
      onClick: () => {
        onRunCommand('latest | xc');
        setIsOpen(false);
      },
    },
    {
      id: 'paste',
      icon: <ClipboardPaste className="w-4 h-4" />,
      label: 'Paste',
      color: 'bg-primary text-primary-foreground',
      onClick: () => {
        onRunCommand('xp');
        setIsOpen(false);
      },
    },
    {
      id: 'json',
      icon: <FileJson className="w-4 h-4" />,
      label: 'JSON',
      color: 'bg-purple-500 text-white',
      onClick: () => {
        onOpenTool('json');
        setIsOpen(false);
      },
    },
    {
      id: 'temp',
      icon: <Thermometer className="w-4 h-4" />,
      label: 'Temp',
      color: 'bg-orange-500 text-white',
      onClick: () => {
        onOpenTool('temp');
        setIsOpen(false);
      },
    },
    {
      id: 'js',
      icon: <Code className="w-4 h-4" />,
      label: 'JS',
      color: 'bg-yellow-500 text-yellow-950',
      onClick: () => {
        onOpenInterpreter('javascript');
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col-reverse items-end gap-3">
      {/* Action buttons - show when open */}
      <div
        className={cn(
          'flex flex-col-reverse gap-2 transition-all duration-300',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'flex items-center gap-2 pl-3 pr-4 py-2 rounded-full shadow-lg transition-all duration-200',
              action.color,
              'hover:scale-105 active:scale-95'
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'active:scale-95',
          isOpen && 'rotate-45 bg-muted text-muted-foreground'
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
