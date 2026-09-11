import { useParams, useNavigate } from 'react-router-dom';
import { VISUAL_TOOLS } from '@/components/visual-tools';
import { EMBEDDED_INTERPRETERS } from '@/components/embedded-interpreters';
import { getEmbeddedToolsStatic } from '@/hooks/use-embedded-tools';
import { EmbedViewer } from '@/components/visual-tools/EmbedViewer';
import { ToolWrapper, NotFoundState } from '@/components/visual-tools/ToolPageChrome';

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

export default VisualToolPage;
