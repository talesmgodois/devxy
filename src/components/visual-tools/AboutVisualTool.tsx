import { Github, Globe, ExternalLink, Heart, Code2 } from 'lucide-react';
import { APP_INFO } from '@/config/appInfo';

export function AboutVisualTool() {
  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{APP_INFO.name}</h2>
            <p className="text-sm text-muted-foreground">{APP_INFO.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Version Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
            v{APP_INFO.version}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
            {APP_INFO.license} License
          </span>
        </div>

        {/* Author Section */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="px-3 py-2 bg-muted/30 border-b border-border/30">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              Created by
            </span>
          </div>
          <div className="p-4">
            <p className="text-lg font-semibold text-foreground">{APP_INFO.author.name}</p>
            <div className="mt-3 space-y-2">
              <a
                href={APP_INFO.author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Globe className="w-4 h-4" />
                <span>{APP_INFO.author.website.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={APP_INFO.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Github className="w-4 h-4" />
                <span>{APP_INFO.author.github.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="px-3 py-2 bg-muted/30 border-b border-border/30">
            <span className="text-sm font-medium text-foreground">🔗 Links</span>
          </div>
          <div className="p-3 space-y-2">
            <a
              href={APP_INFO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Live Demo</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {APP_INFO.website.replace('https://', '')}
              </span>
            </a>
            <a
              href={APP_INFO.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">GitHub Repository</span>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                View Source
              </span>
            </a>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <div className="px-3 py-2 bg-muted/30 border-b border-border/30">
            <span className="text-sm font-medium text-foreground">⚡ Built With</span>
          </div>
          <div className="p-3 flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'shadcn/ui'].map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Open Source Note */}
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 p-4 border border-primary/20">
          <p className="text-sm text-foreground">
            <span className="font-semibold">🌟 Open Source</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Devxy is open source and available under the MIT License. 
            Contributions are welcome!
          </p>
        </div>
      </div>
    </div>
  );
}
