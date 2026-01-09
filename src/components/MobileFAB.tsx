import { useState } from 'react';
import { Zap, Code, FileJson, Thermometer, Hash, Mail, User, AtSign, FileText, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  category: 'generator' | 'visual' | 'interpreter';
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
    // Generator commands
    {
      id: 'r.cpf',
      icon: <Hash className="w-4 h-4" />,
      label: 'CPF',
      category: 'generator',
      onClick: () => {
        onRunCommand('r.cpf');
        setIsOpen(false);
      },
    },
    {
      id: 'r.cnpj',
      icon: <Hash className="w-4 h-4" />,
      label: 'CNPJ',
      category: 'generator',
      onClick: () => {
        onRunCommand('r.cnpj');
        setIsOpen(false);
      },
    },
    {
      id: 'r.titulo',
      icon: <FileText className="w-4 h-4" />,
      label: 'Titulo',
      category: 'generator',
      onClick: () => {
        onRunCommand('r.titulo');
        setIsOpen(false);
      },
    },
    {
      id: 'r.user',
      icon: <User className="w-4 h-4" />,
      label: 'Username',
      category: 'generator',
      onClick: () => {
        onRunCommand('r.user');
        setIsOpen(false);
      },
    },
    {
      id: 'r.nick',
      icon: <AtSign className="w-4 h-4" />,
      label: 'Nickname',
      category: 'generator',
      onClick: () => {
        onRunCommand('r.nick');
        setIsOpen(false);
      },
    },
    {
      id: 'r.email',
      icon: <Mail className="w-4 h-4" />,
      label: 'Email',
      category: 'generator',
      onClick: () => {
        onRunCommand('r.email');
        setIsOpen(false);
      },
    },
    // Visual tools
    {
      id: 'v.json',
      icon: <FileJson className="w-4 h-4" />,
      label: 'JSON',
      category: 'visual',
      onClick: () => {
        onOpenTool('json');
        setIsOpen(false);
      },
    },
    {
      id: 'v.temp',
      icon: <Thermometer className="w-4 h-4" />,
      label: 'Temperature',
      category: 'visual',
      onClick: () => {
        onOpenTool('temp');
        setIsOpen(false);
      },
    },
    {
      id: 'v.curl',
      icon: <Zap className="w-4 h-4" />,
      label: 'cURL',
      category: 'visual',
      onClick: () => {
        onOpenTool('curl');
        setIsOpen(false);
      },
    },
    {
      id: 'v.csv',
      icon: <FileText className="w-4 h-4" />,
      label: 'CSV',
      category: 'visual',
      onClick: () => {
        onOpenTool('csv');
        setIsOpen(false);
      },
    },
    // Interpreters
    {
      id: 'ei.javascript',
      icon: <Code className="w-4 h-4" />,
      label: 'JavaScript',
      category: 'interpreter',
      onClick: () => {
        onOpenInterpreter('javascript');
        setIsOpen(false);
      },
    },
    {
      id: 'ei.python',
      icon: <Code className="w-4 h-4" />,
      label: 'Python',
      category: 'interpreter',
      onClick: () => {
        onOpenInterpreter('python');
        setIsOpen(false);
      },
    },
  ];

  const generators = actions.filter(a => a.category === 'generator');
  const visuals = actions.filter(a => a.category === 'visual');
  const interpreters = actions.filter(a => a.category === 'interpreter');

  const getCategoryColor = (category: FABAction['category']) => {
    switch (category) {
      case 'generator':
        return 'bg-terminal-success/10 text-terminal-success border-terminal-success/20 hover:bg-terminal-success/20';
      case 'visual':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20';
      case 'interpreter':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20';
    }
  };

  const renderActionGrid = (items: FABAction[], title: string) => (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {items.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all duration-150',
              getCategoryColor(action.category),
              'active:scale-[0.97]'
            )}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Compact trigger button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className={cn(
          'w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200',
          'border border-border/50',
          'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        title="Quick actions"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* Bottom drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-background border-border">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Commands
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 max-h-[60vh] overflow-y-auto">
            {renderActionGrid(generators, 'Generators')}
            {renderActionGrid(visuals, 'Visual Tools')}
            {renderActionGrid(interpreters, 'Interpreters')}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
