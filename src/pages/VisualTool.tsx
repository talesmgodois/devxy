import { useParams, useNavigate } from 'react-router-dom';
import { VISUAL_TOOLS } from '@/components/visual-tools';
import { EMBEDDED_INTERPRETERS } from '@/components/embedded-interpreters';
import { getEmbeddedToolsStatic } from '@/hooks/use-embedded-tools';
import { EmbedViewer } from '@/components/visual-tools/EmbedViewer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ToolType = 'v' | 've' | 'ei';

const VisualToolPage = () => {
  const { type, tool } = useParams<{ type: string; tool: string }>();
  const navigate = useNavigate();

  if (!type || !tool) {
    return <NotFoundState message="Invalid route parameters" onBack={() => navigate('/')} />;
  }

  const toolType = type as ToolType;

  // Visual Tools (v.toolname)
  if (toolType === 'v') {
    const visualTool = VISUAL_TOOLS[tool];
    if (!visualTool) {
      return <NotFoundState message={`Visual tool "${tool}" not found`} onBack={() => navigate('/')} />;
    }
    const ToolComponent = visualTool.component;
    return (
      <ToolWrapper
        icon={visualTool.icon}
        name={visualTool.name}
        description={visualTool.description}
        onBack={() => navigate('/')}
      >
        <ToolComponent />
      </ToolWrapper>
    );
  }

  // Embedded URL Tools (ve.toolname)
  if (toolType === 've') {
    const embeddedTools = getEmbeddedToolsStatic();
    const embeddedTool = embeddedTools.find(t => t.id === tool);
    if (!embeddedTool) {
      return <NotFoundState message={`Embedded tool "${tool}" not found`} onBack={() => navigate('/')} />;
    }
    return (
      <ToolWrapper
        icon="🔗"
        name={embeddedTool.name}
        description={embeddedTool.description || 'Custom embedded tool'}
        onBack={() => navigate('/')}
      >
        <EmbedViewer 
          url={embeddedTool.url} 
          name={embeddedTool.name} 
          description={embeddedTool.description} 
        />
      </ToolWrapper>
    );
  }

  // Embedded Interpreters (ei.toolname)
  if (toolType === 'ei') {
    const interpreter = EMBEDDED_INTERPRETERS[tool];
    if (!interpreter) {
      return <NotFoundState message={`Interpreter "${tool}" not found`} onBack={() => navigate('/')} />;
    }
    const InterpreterComponent = interpreter.component;
    return (
      <ToolWrapper
        icon={interpreter.icon}
        name={interpreter.name}
        description={interpreter.description}
        onBack={() => navigate('/')}
      >
        <InterpreterComponent />
      </ToolWrapper>
    );
  }

  return <NotFoundState message={`Unknown tool type "${type}"`} onBack={() => navigate('/')} />;
};

interface ToolWrapperProps {
  icon: string;
  name: string;
  description: string;
  onBack: () => void;
  children: React.ReactNode;
}

const ToolWrapper = ({ icon, name, description, onBack, children }: ToolWrapperProps) => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    {/* Header */}
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{icon}</span>
          <div className="min-w-0">
            <h1 className="font-mono font-semibold text-sm truncate">{name}</h1>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
      </div>
    </header>

    {/* Content */}
    <main className="flex-1 container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

interface NotFoundStateProps {
  message: string;
  onBack: () => void;
}

const NotFoundState = ({ message, onBack }: NotFoundStateProps) => (
  <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="text-6xl">🔍</div>
      <h1 className="text-xl font-semibold">Tool Not Found</h1>
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Terminal
      </Button>
    </div>
  </div>
);

export default VisualToolPage;
