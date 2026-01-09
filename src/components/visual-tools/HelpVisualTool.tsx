import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HelpSection {
  title: string;
  icon: string;
  items: { name: string; desc: string }[];
}

export function HelpVisualTool() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['generators', 'pipes']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const sections: HelpSection[] = [
    {
      title: 'generators',
      icon: '⚡',
      items: [
        { name: 'r.cpf', desc: 'Generate random Brazilian CPF [-f formatted] [-n count]' },
        { name: 'r.cnpj', desc: 'Generate random Brazilian CNPJ [-f formatted] [-n count]' },
        { name: 'r.titulo', desc: 'Generate random Brazilian Titulo Eleitoral [-f formatted] [-n count]' },
        { name: 'r.user', desc: 'Generate random username [-n count]' },
        { name: 'r.nick', desc: 'Generate random nickname [-n count]' },
        { name: 'r.email', desc: 'Generate random email address [-n count]' },
      ],
    },
    {
      title: 'pipes',
      icon: '🔧',
      items: [
        { name: 'xc', desc: 'Copy input to clipboard' },
        { name: 'xp', desc: 'Paste from clipboard' },
        { name: 'xl', desc: 'Convert to lowercase' },
        { name: 'xu', desc: 'Convert to uppercase' },
        { name: 'xt', desc: 'Trim whitespace' },
        { name: 'xr', desc: 'Reverse string' },
      ],
    },
    {
      title: 'visual tools',
      icon: '📺',
      items: [
        { name: 'v.temp', desc: 'Temperature converter (F/C/K)' },
        { name: 'v.csv', desc: 'JSON to CSV converter' },
        { name: 'v.curl', desc: 'cURL request generator' },
        { name: 'v.json', desc: 'JSON formatter & validator' },
        { name: 'v.help', desc: 'This help reference' },
      ],
    },
    {
      title: 'interpreters',
      icon: '🖥️',
      items: [
        { name: 'ei.js', desc: 'JavaScript interpreter' },
        { name: 'ei.python', desc: 'Python interpreter' },
      ],
    },
    {
      title: 'history',
      icon: '📋',
      items: [
        { name: 'latest', desc: 'Get last command result' },
        { name: 'latest(i)', desc: 'Get result at index i (0=latest)' },
        { name: 'latest(i,n)', desc: 'Get n results starting from index i' },
        { name: 'recent', desc: 'Show last 20 executed commands with timestamps' },
      ],
    },
    {
      title: 'utility',
      icon: '🛠️',
      items: [
        { name: 'clear', desc: 'Clear the terminal' },
        { name: 'help', desc: 'Show help message in terminal' },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col bg-card/30">
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/30">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span>📖</span> Command Reference
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Click sections to expand/collapse
        </p>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              {expandedSections.has(section.title) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-base">{section.icon}</span>
              <span className="text-sm font-medium text-foreground capitalize">{section.title}</span>
              <span className="text-xs text-muted-foreground ml-auto">{section.items.length}</span>
            </button>
            
            {expandedSections.has(section.title) && (
              <div className="bg-background/50 divide-y divide-border/30">
                {section.items.map((item) => (
                  <div key={item.name} className="px-3 py-2 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <code className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono whitespace-nowrap">
                        {item.name}
                      </code>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Examples section */}
        <div className="rounded-lg border border-border/50 overflow-hidden mt-4">
          <div className="px-3 py-2 bg-terminal-success/10 border-b border-border/30">
            <span className="text-sm font-medium text-terminal-success">💡 Examples</span>
          </div>
          <div className="p-3 space-y-2 text-xs font-mono">
            <div className="flex gap-2">
              <code className="text-primary">r.cpf</code>
              <span className="text-muted-foreground">→ Generate unformatted CPF</span>
            </div>
            <div className="flex gap-2">
              <code className="text-primary">r.cpf -f</code>
              <span className="text-muted-foreground">→ Generate formatted CPF</span>
            </div>
            <div className="flex gap-2">
              <code className="text-primary">r.cpf -n 5</code>
              <span className="text-muted-foreground">→ Generate 5 CPFs</span>
            </div>
            <div className="flex gap-2">
              <code className="text-primary">r.cpf | xc</code>
              <span className="text-muted-foreground">→ Generate and copy to clipboard</span>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="px-3 py-2 bg-purple-500/10 border-b border-border/30">
            <span className="text-sm font-medium text-purple-400">⌨️ Keyboard Shortcuts</span>
          </div>
          <div className="p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Tab</kbd>
              <span className="text-muted-foreground">Autocomplete command</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">↑ / ↓</kbd>
              <span className="text-muted-foreground">Navigate history/suggestions</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Ctrl+E</kbd>
              <span className="text-muted-foreground">Toggle panel focus</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Ctrl+L</kbd>
              <span className="text-muted-foreground">Clear terminal</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">/</kbd>
              <span className="text-muted-foreground">Open command palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
