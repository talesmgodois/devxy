import { Link, useNavigate } from 'react-router-dom';
import { VISUAL_TOOLS } from '@/components/visual-tools';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Seo, SITE_URL } from '@/components/Seo';

const ToolsVisualIndex = () => {
  const navigate = useNavigate();
  const tools = Object.values(VISUAL_TOOLS);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ferramentas Visuais - Devxy',
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `v.${tool.name}`,
      description: tool.description,
      url: `${SITE_URL}/tools/visual/${tool.name}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Seo
        title="Ferramentas Visuais - Devxy"
        description={`Explore as ${tools.length} ferramentas visuais do Devxy: geradores, conversores e formatadores para desenvolvedores. Grátis e sem cadastro.`}
        path="/tools/visual"
        jsonLd={jsonLd}
      />
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
            title="Back to Terminal"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-mono font-semibold text-sm">Visual Tools</h1>
            <p className="text-xs text-muted-foreground">{tools.length} available tools</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="sr-only">Available visual tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                to={`/tools/visual/${tool.name}`}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-colors"
              >
                <span className="text-2xl leading-none">{tool.icon}</span>
                <div className="min-w-0">
                  <div className="font-mono font-semibold text-sm">v.{tool.name}</div>
                  <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ToolsVisualIndex;
