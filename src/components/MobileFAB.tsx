import { useState } from 'react';
import { Zap, Code, FileJson, Thermometer, Copy, ClipboardPaste, Sparkles, X } from 'lucide-react';
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
      icon: <Zap className="w-3.5 h-3.5" />,
      label: 'CPF',
      color: 'bg-terminal-success/20 text-terminal-success border-terminal-success/30',
      onClick: () => {
        onRunCommand('rndcpf');
        setIsOpen(false);
      },
    },
    {
      id: 'copy',
      icon: <Copy className="w-3.5 h-3.5" />,
      label: 'Copy',
      color: 'bg-primary/20 text-primary border-primary/30',
      onClick: () => {
        onRunCommand('latest | xc');
        setIsOpen(false);
      },
    },
    {
      id: 'paste',
      icon: <ClipboardPaste className="w-3.5 h-3.5" />,
      label: 'Paste',
      color: 'bg-primary/20 text-primary border-primary/30',
      onClick: () => {
        onRunCommand('xp');
        setIsOpen(false);
      },
    },
    {
      id: 'json',
      icon: <FileJson className="w-3.5 h-3.5" />,
      label: 'JSON',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      onClick: () => {
        onOpenTool('json');
        setIsOpen(false);
      },
    },
    {
      id: 'temp',
      icon: <Thermometer className="w-3.5 h-3.5" />,
      label: 'Temp',
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      onClick: () => {
        onOpenTool('temp');
        setIsOpen(false);
      },
    },
    {
      id: 'js',
      icon: <Code className="w-3.5 h-3.5" />,
      label: 'JS',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      onClick: () => {
        onOpenInterpreter('javascript');
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative">
      {/* Popup menu - appears above the button */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Actions menu */}
          <div className="absolute bottom-full right-0 mb-2 z-40 bg-card border border-border rounded-lg shadow-xl p-2 min-w-[140px]">
            <div className="flex flex-col gap-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-left transition-all duration-150 border',
                    action.color,
                    'hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  {action.icon}
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Compact trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200',
          'border border-border/50',
          isOpen 
            ? 'bg-muted text-foreground' 
            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Quick actions"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </button>
    </div>
  );
}
